import { APIGatewayProxyResult } from 'aws-lambda';
import { Knex, knex } from 'knex';
import { middyfy } from '@libs/lambda';
import { Gigs } from './Gigs';
import { v4 as uuidv4 } from 'uuid';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { uploadFileS3 } from 'src/utils/fileHandler';
import { ValidationError, errorResponse } from 'src/utils/errors';
import { GetEmployerId, UpdateQuestionaire, GetQuestionaire, GigDetails_PATCH, GetGigId, GigDetails } from './types';
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

export const getAllGigDetails = middyfy(async (): Promise<APIGatewayProxyResult> => {
    try {
        const gigs = new Gigs(knexInstance);
        const result = await gigs.getAll();

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getGigDetailsByEmployerId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const values: GetEmployerId = {
            postedByEmployerId: response
        }
        const gigs = new Gigs(knexInstance);
        const result = await gigs.getByEmployerId(values);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getGigDetailsByGigId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const values: GetGigId = {
            gigId: gigId
        }

        const gigs = new Gigs(knexInstance);
        const gigDetails = await gigs.get(values);

        if (gigDetails && gigDetails.length > 0 && gigDetails[0].archive === 1) { // Use numeric comparison for archive field
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'The gig has been deleted' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(gigDetails),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const saveGigDetails = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const companyId: string | undefined = event.queryStringParameters?.companyId;
        if (!companyId) {
            throw new ValidationError('Company ID Missing');
        }
        const gigId: string = uuidv4();
        const gigDetails = event.body;

        const gigs = new Gigs(knexInstance);
        const values: GigDetails = {
            gigId: gigId,
            companyId: companyId,
            postedByEmployerId: response,
            ...gigDetails,
        };

        const result = await gigs.save(values);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Gig details saved successfully.' }),
            };
        }
        else {
            return JSON.stringify(result.error)
        }

    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const saveQuestionnaire = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const gigs = new Gigs(knexInstance);
        const values: UpdateQuestionaire = {
            gigId: gigId,
            postedByEmployerId: response,
            ...event.body
        }
        await gigs.updateQuestionaire(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Questionnaire saved successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getQuestionnaire = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        let gigs = new Gigs(knexInstance);
        const values: GetQuestionaire = {
            gigId: gigId,
            postedByEmployerId: response

        }
        let result = await gigs.getQuestionaire(values);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const updateGigDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const gigs = new Gigs(knexInstance);
        const postedByEmployerId = await gigs.postedByEmployerId(gigId);
        if (postedByEmployerId !== response) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Access forbidden' }),
            };
        }

        const values: GigDetails_PATCH = {
            gigId: gigId,
            postedByEmployerId: response,
            ...event.body
        }

        const gigDetails = await gigs.get(values);

        if (gigDetails && gigDetails.length > 0 && gigDetails[0].archive === '1') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'The gig has been deleted' })
            };
        }

        await gigs.update(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gig details updated successfully.' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const removeGig = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const gigs = new Gigs(knexInstance);
        const postedByUserId = await gigs.postedByEmployerId(gigId);
        if (postedByUserId !== response) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Access forbidden' }),
            };
        }

        const values: GetGigId = {
            gigId: gigId
        }

        const gigDetails = await gigs.get(values);
        if (gigDetails && gigDetails.length > 0 && gigDetails[0].archive === '1') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'The gig has been deleted' })
            };
        }

        await gigs.remove(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gig deleted successfully.' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const gigFileUpload = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const result = await parseMultipart.parse(event);
        let fileName = `GIG_FILE_${gigId}`;
        const name = await uploadFileS3(result.files[0], fileName);
        fileName = name;
        const filePath = `${bucketUrl}/${fileName}`;
        const gigs = new Gigs(knexInstance);
        await gigs.uploadFile(filePath, gigId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File saved Successfully!' })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});
