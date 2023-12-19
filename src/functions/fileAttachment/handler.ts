import { APIGatewayProxyResult } from 'aws-lambda';
import { Knex, knex } from 'knex';
import { middyfy } from '@libs/lambda';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import FileAttachment from './FileAttachment';
import { v4 as uuidv4 } from 'uuid';
import { uploadFileS3 } from 'src/utils/fileHandler';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { GigSeekerId, GigSeekerIdFileName, UserDocument } from './types';
import { ValidationError, errorResponse } from 'src/utils/errors';
import * as parseMultipart from 'lambda-multipart-parser';

const connection = {
    host: process.env.DB_ENDPOINT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};
const config: Knex.Config = {
    client: 'mysql',
    connection,
}
const knexInstance = knex(config);

export const getFiles = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeekerId = {
            gigSeekerId: response
        }
        const fileAttachment = new FileAttachment(knexInstance);
        const files = await fileAttachment.getFilesByGigSeekerId(values);

        return {
            statusCode: 200,
            body: JSON.stringify(files)
        };
    } catch (error) {
        console.error('Error while fetching file : ', error);
        return errorResponse(error);
    }
});

export const getByFileName = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeekerIdFileName = {
            gigSeekerId: response,
            fileName: event.body
        }
        const fileAttachment = new FileAttachment(knexInstance);
        const file = fileAttachment.getByName(values);

        return {
            statusCode: 200,
            body: JSON.stringify(file)
        };
    } catch (error) {
        console.error('Error while fetching the file:', error);
        return errorResponse(error);
    }
});

export const uploadFile = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const fileId = uuidv4();
        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const result = await parseMultipart.parse(event);
        const fileName = event.body.fileName;
        await uploadFileS3(result.files[0], fileName);
        const filePath = `${bucketUrl}/${fileName}`;
        const values: UserDocument = {
            fileId: fileId,
            gigSeekerId: response,
            fileName: fileName,
            filePath: filePath
        }
        let fileAttachment = new FileAttachment(knexInstance);
        await fileAttachment.uploadFile(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File saved Successfully!' })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const uploadCSV = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No file to upload' }),
            };
        }

        const decodedCSV = Buffer.from(event.body, 'base64').toString('utf-8');
        const bodyStream = new Readable();
        bodyStream.push(decodedCSV);
        bodyStream.push(null);
        const csvData: any[] = [];
        await new Promise<any[]>((resolve, reject) => {
            bodyStream.pipe(csvParser())
                .on('data', (row: any) => {
                    csvData.push(row);
                })
                .on('end', () => {
                    resolve(csvData);
                })
                .on('error', (error: Error) => {
                    reject(error);
                });
        });
        const result = csvData.slice(4, csvData.length);
        const originalKeys = Object.keys(csvData[0]);
        let columnNames: any = Object.values(csvData[3]);

        async function formatStrings(strings) {
            return strings.map((str) => {
                str = str.toLowerCase();
                return str.replace(/\s(.)/g, (_match, group1) => {
                    return group1.toUpperCase();
                });
            });
        }
        columnNames = await formatStrings(columnNames);
        columnNames = columnNames.map(columnName => columnName.replace(/\s/g, ''));

        function changeKeyNames(inputObject: any, newKeys: string[]): any {
            const modifiedObject: any = {};
            for (let i = 0; i < newKeys.length; i++) {
                modifiedObject[newKeys[i]] = inputObject[originalKeys[i]] || inputObject[`_${i}`];
            }
            return modifiedObject;
        }

        let modifiedJsonArray = result.map((object) => changeKeyNames(object, columnNames));

        modifiedJsonArray = modifiedJsonArray.map((object) => {
            let newId = uuidv4();
            return {
                gigId: gigId,
                vendorId: newId,
                vendorInformation: object,
            };
        });

        modifiedJsonArray = modifiedJsonArray.filter((object) => {
            return Object.keys(object.vendorInformation).length > 0;
        });
        modifiedJsonArray = modifiedJsonArray.slice(0, modifiedJsonArray.length - 1);

        const fileAttachment = new FileAttachment(knexInstance);
        const fileTableName = 'VendorDetails';
        await fileAttachment.createTableFromFile(fileTableName);
        await fileAttachment.insertData(fileTableName, modifiedJsonArray);
        await fileAttachment.updateTotalVendors(gigId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Test CSV file data extraction successful!", details: modifiedJsonArray })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const removeCSV = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const fileAttachment = new FileAttachment(knexInstance);
        await fileAttachment.removecsv(gigId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'CSV Deleted Successfully!' })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const brandingFileUploader = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const result = await parseMultipart.parse(event);
        const vehicleNumber = result.vehicleNumber;
        let orientation: string = result.orientation;
        orientation = orientation.toLowerCase();
        if (orientation.includes('left')) {
            orientation = 'LEFT'
        } else if (orientation.includes('right')) {
            orientation = 'RIGHT'
        } else if (orientation.includes('back')) {
            orientation = 'BACK'
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Wrong Orientation' })
            }
        }
        const currentDate = new Date();

        const timeZoneOffset = 5.5 * 60; // 5 hours and 30 minutes in minutes
        const gmtDate = new Date(currentDate.getTime() + timeZoneOffset * 60 * 1000);
        const formattedDate = gmtDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const dateTime: string = formattedDate.replace(/ /g, '_');

        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const fileName = `${vehicleNumber}_${orientation}_${dateTime}`;
        const name = await uploadFileS3(result.files[0], fileName);
        const filePath = `${bucketUrl}/${name}`;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'file uploaded successfully!', payload: filePath })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const tester = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        console.log(event);
        const result = await parseMultipart.parse(event);
        const keys = Object.keys(result);
        const values = Object.values(result);
        let fieldNames: string[] = [];
        for (const fileObject of result.files || []) {
            fieldNames.push(fileObject.fieldname);
        }
        const dynamicObject: Record<string, any> = {};
        for (let i = 0, f = 0, v = 1; i < keys.length + result.files.length; i++) {
            if (result.files[f]) {
                dynamicObject[`${fieldNames[f]}`] = result.files[f];
                f++;
            }
            if (values[v] !== undefined) {
                dynamicObject[`${keys[v]}`] = values[v];
                v++
            }
        }
        const questionnaireResponse = JSON.parse(dynamicObject.updatedQuestionnaireResponse);
        delete dynamicObject['updatedQuestionnaireResponse'];
        const fileKeys: string[] = Object.keys(dynamicObject);
        const currentDate = new Date();
        const timeZoneOffset = 5.5 * 60; // 5 hours and 30 minutes in minutes
        const gmtDate = new Date(currentDate.getTime() + timeZoneOffset * 60 * 1000);
        const formattedDate = gmtDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const dateTime: string = formattedDate.replace(/ /g, '_');
        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const vehicleNumber = questionnaireResponse.Q1.answer;
        const orientation = async (question: string): Promise<string> => {
            question = question.toLowerCase();
            if (question.includes('left')) return 'LEFT';
            else if (question.includes('right')) return 'RIGHT';
            else if (question.includes('back')) return 'BACK';
            else return 'INVALID';
        }
        console.log('file uploading : ', new Date())
        const [back, left, right] = await Promise.all([
            uploadFileS3(dynamicObject[fileKeys[0]], `${vehicleNumber}_${await orientation(fileKeys[0])}_${dateTime}`),
            uploadFileS3(dynamicObject[fileKeys[1]], `${vehicleNumber}_${await orientation(fileKeys[1])}_${dateTime}`),
            uploadFileS3(dynamicObject[fileKeys[2]], `${vehicleNumber}_${await orientation(fileKeys[2])}_${dateTime}`)
        ])
        console.log('file uploading : ', new Date())
        Object.keys(dynamicObject).forEach((secondKey) => {
            const matchingQuestionKey = Object.keys(questionnaireResponse).find((firstKey) =>
                secondKey.toLowerCase().includes(questionnaireResponse[firstKey].question.toLowerCase()));
            if (matchingQuestionKey && questionnaireResponse[matchingQuestionKey].type === 'image') {
                if (questionnaireResponse[matchingQuestionKey].question.toLowerCase().includes('back')) {
                    questionnaireResponse[matchingQuestionKey].answer = `${bucketUrl}/${back}`;
                }
                if (questionnaireResponse[matchingQuestionKey].question.toLowerCase().includes('left')) {
                    questionnaireResponse[matchingQuestionKey].answer = `${bucketUrl}/${left}`;
                }
                if (questionnaireResponse[matchingQuestionKey].question.toLowerCase().includes('right')) {
                    questionnaireResponse[matchingQuestionKey].answer = `${bucketUrl}/${right}`;
                }
            } else {
                throw (`Question related to "${secondKey}" not found or is not of type 'image'.`);
            }
        });
        console.log('tester end')
        return {
            statusCode: 200,
            body: JSON.stringify(questionnaireResponse)
        }
    } catch (error) {
        console.error('Error:', error);
        return handleError(error);
    }
});