import { middyfy } from "@libs/lambda";
import { APIGatewayProxyResult } from "aws-lambda";
import { knex, Knex } from "knex";
import { extractIdFromAuthToken } from "src/utils/extractIdFromAuthToken";
import { v4 as uuidv4 } from 'uuid';
import { Responses } from "./Responses";
import { errorResponse, ValidationError } from "src/utils/errors";
import { GigDetails_GET_GigId, Response_GET_GigSeekerId } from "./types";
import { upload } from "src/utils/brandingUploader";

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

export const getAllResponses = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const values: GigDetails_GET_GigId = {
            gigId
        }
        const responses = new Responses(knexInstance);
        const result = await responses.get(values);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getResponseByGigSeekerId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const response = extractIdFromAuthToken(event.headers);

        const responses = new Responses(knexInstance);
        const values: Response_GET_GigSeekerId = {
            gigSeekerId: response
        }
        const result = await responses.getResponseDetailsByGigSeekerId(values);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const assignToGigSeeker = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const responses = new Responses(knexInstance);
        const gigCategory = await responses.getGigCategory(gigId);
        const values: Response_GET_GigSeekerId = {
            gigSeekerId: response,
            gigId
        }
        if (typeof gigCategory === 'string' && gigCategory === 'survey') {
            const numberOfRows = await responses.getByGigSeekerId(values);
            const assignedCount = numberOfRows.length;
            const maxNumberOfRowsToAssign = 1;
            const vendorIds = await responses.pullNUnassigned(maxNumberOfRowsToAssign - assignedCount, gigId);
            if (vendorIds.length === 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: `Vendor List Empty or Missing` })
                }
            }
            interface Assignment {
                responseId?: string,
                vendorId: string,
                gigSeekerId: string,
            }
            const assign: Assignment[] = [];
            vendorIds.forEach((vendorId) => {
                if (typeof response === 'string') {
                    assign.push({
                        vendorId,
                        gigSeekerId: response
                    })
                }
            })
            await responses.assignVendorToGigSeeker(assign, response, vendorIds, gigId);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: `Assigned a Vendor` })
            }
        }
        if (typeof gigCategory === 'string' && gigCategory === 'branding') {
            const checkIfAlreadyAssigned = await responses.getByGigSeekerId(values);
            if ((await checkIfAlreadyAssigned).length != 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: `Already assigned` })
                }
            }
            const questionaire = await responses.getQuestionaire(gigId)
            const assign = {
                gigId,
                gigSeekerId: response,
                vendorId: uuidv4(),
                questionaireResponse: questionaire,
                assignmentStatus: 'assigned',
            }
            await responses.assignBranding(assign);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: `Fill in auto details` })
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getAssignedVendorDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const responses = new Responses(knexInstance);
        const values: Response_GET_GigSeekerId = {
            gigSeekerId: response,
            gigId
        }
        const gigCategory = await responses.getGigCategory(gigId);
        let res = await responses.getByGigSeekerId(values);
        if (res.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Empty or not assigned yet' })
            }
        }
        res[0]['category'] = gigCategory;
        return {
            statusCode: 200,
            body: JSON.stringify(res)
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const updateResponse = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers)

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const responses = new Responses(knexInstance);
        const gigCategory = await responses.getGigCategory(gigId);
        let res;
        if (typeof gigCategory === 'string' && gigCategory === 'survey') {
            res = await responses.update(gigId, response, event.body);
            const callStatus = await responses.getCallStatus(gigId, response);
            await responses.setClientStatus(callStatus, gigId, response);
            if (callStatus === 'success') {
                const exists = await responses.checkIfExists(gigId, response);
                if (!exists) {
                    const values = {
                        dailyEarningId: uuidv4(),
                        gigId,
                        gigSeekerId: response
                    }
                    await responses.pushARow(values)
                }
            }
        }
        if (typeof gigCategory === 'string' && gigCategory === 'branding') {
            // internal api call for tester function should be made here...
            // using temporary function to bypass api call or invoke lambda function
            const result  = await upload(event);
            if(result === undefined || typeof result === 'undefined') {
                return {
                    statusCode: 500,
                    body: JSON.stringify(`files upload failed!`)
                }
            } 
            res = await responses.updateBranding(gigId, response, result);
            if (res[0].assignmentStatus === 'success') {
                const exists = await responses.checkIfExists(gigId, response);
                if (!exists) {
                    const values = {
                        dailyEarningId: uuidv4(),
                        gigId,
                        gigSeekerId: response
                    }
                    await responses.pushARow(values)
                }
            }
        }
        const dailyEarningId = await responses.getDailyEarningId(gigId, response);
        responses.updateNumberOfTaskCompletedAndEarning(gigId, response, dailyEarningId);
        return {
            statusCode: 200,
            body: JSON.stringify({ details: res })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getResponseQuestionnaire = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const responses = new Responses(knexInstance);
        let result = await responses.getQuestionaire(gigId);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getQuestionaireResponseByGigId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        let { page } = event.queryStringParameters || {};
        const pageNumber = page ? parseInt(page, 10) : 1;

        if (pageNumber < 1) {
            throw new ValidationError('Invalid page number');
        }

        let pageSize: number | undefined = event.queryStringParameters?.pageSize;
        if (!pageSize) {
            pageSize = 10
        }
        const limit = pageSize;
        const offset = (pageNumber - 1) * pageSize;

        const responses = new Responses(knexInstance);
        const result = await responses.getQuestionaireResponse(gigId, limit, offset);
        let parsedData = result.map(item => ({
            questionaireResponse: JSON.parse(item.questionaireResponse),
        }));
        parsedData = parsedData.map(item => item.questionaireResponse);
        const mappedData = parsedData.map(item => {
            const result: Record<string, any> = {};
            for (const key in item) {
                const question = item[key].question;
                const answer = item[key].answer;
                result[question] = answer;
            }
            return result;
        });
        const filteredArray = mappedData.map(item => ({
            "Enter Vehicle Number": item["Enter Vehicle Number"],
            "Upload back Image": item["Upload back Image"],
        }));
        return {
            statusCode: 200,
            body: JSON.stringify(filteredArray)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const aggregateInformation = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const responses = new Responses(knexInstance);
        let result = await responses.aggregateInformation(gigId);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});