import { uploadFileS3 } from "./fileHandler";
import * as parseMultipart from 'lambda-multipart-parser';

export async function upload(event) {
    try {
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
            else return 'IMAGE';
        }
        const [back, left, right] = await Promise.all([
            uploadFileS3(dynamicObject[fileKeys[0]], `${vehicleNumber}_${await orientation(fileKeys[0])}_${dateTime}`),
            uploadFileS3(dynamicObject[fileKeys[1]], `${vehicleNumber}_${await orientation(fileKeys[1])}_${dateTime}`),
            uploadFileS3(dynamicObject[fileKeys[2]], `${vehicleNumber}_${await orientation(fileKeys[2])}_${dateTime}`)
        ])
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
                throw(`Question related to "${secondKey}" not found or is not of type 'image'.`);
            }
        });
        return questionnaireResponse;
    } catch (error) {
        console.error('Error:', error);
    }
}