import { middyfy } from '@libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Knex, knex } from 'knex';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { v4 as uuidv4 } from 'uuid';
import { Acceptances } from './Acceptances';
import { ValidationError, errorResponse } from 'src/utils/errors';
import { AcceptanceId, Acceptance, GigSeekerIdAcceptanceId, Transactions } from './types';
import { responseObject } from 'src/utils/responseObject';

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

export const saveAcceptance = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const visibilityId: string | undefined = event.queryStringParameters?.visibilityId;
        if (!visibilityId) {
            throw new ValidationError('Visibility ID Missing');
        }

        const acceptanceId: string = uuidv4();
        const acceptances: Acceptances = new Acceptances(knexInstance);
        const values: Acceptance = {
            acceptanceId: acceptanceId,
            gigSeekerId: response,
            visibilityId: visibilityId,
            acceptanceForm: event.body,
        }
        const result: responseObject = await acceptances.save(values);
        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Acceptance details saved successfully" }),
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

export const getAcceptanceDetailsByAcceptanceId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const acceptanceId: string | undefined = event.queryStringParameters?.acceptanceId;
        if (!acceptanceId) {
            throw new ValidationError('Acceptance ID Missing');
        }

        const values: GigSeekerIdAcceptanceId = {
            acceptanceId: acceptanceId
        }
        const acceptances = new Acceptances(knexInstance);
        const result = await acceptances.getByAcceptanceId(values);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getAcceptanceDetailsByGigIdAndGigSeekerId = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const response = extractIdFromAuthToken(event.headers);

        const acceptances = new Acceptances(knexInstance);
        const result = await acceptances.getAcceptanceIdByGigIdAndGigSeekerId(gigId, response);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const removeAcceptance = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const acceptanceId: string | undefined = event.queryStringParameters?.acceptanceId;
        if (!acceptanceId) {
            throw new ValidationError('Acceptance ID Missing');
        }

        const values: AcceptanceId = {
            acceptanceId: acceptanceId,
        }
        const acceptances = new Acceptances(knexInstance);
        await acceptances.removeAcceptance(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Acceptance deleted successfully!' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getListOfGigsAcceptedByGigSeeker = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeekerIdAcceptanceId = {
            gigSeekerId: response
        }
        const acceptances = new Acceptances(knexInstance);
        await acceptances.statusUpdater(values);
        const result = await acceptances.getAllGigsAcceptedByGigSeeker(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'OK!', payload: result }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getPreAcceptanceForm = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const acceptances = new Acceptances(knexInstance);
        let result = await acceptances.preAcceptanceForm(gigId);
        result = JSON.parse(result);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'OK!', payload: result }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const sendForPayment = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const acceptanceId: string | undefined = event.queryStringParameters?.acceptanceId;
        if (!acceptanceId) {
            throw new ValidationError('Acceptance ID Missing');
        }
        const acceptances = new Acceptances(knexInstance);

        await acceptances.markComplete(acceptanceId);
        const data = JSON.stringify(event.body);
        console.log(JSON.parse(data));
        const dates = await acceptances.dates(acceptanceId);
        if(typeof dates === 'string') {
            const values: Transactions = {
                transactionId: uuidv4(),
                ...event.body,
            }
            await acceptances.createTransactionEntry(values);
            return {
                statusCode: 200,
                body: JSON.stringify(dates)
            }
        }
        const values: Transactions = {
            transactionId: uuidv4(),
            ...event.body,
            gigStartedOn : dates.startDate,
            gigEndedOn : dates.endDate,
        }
        await acceptances.createTransactionEntry(values);
        return {
            statusCode: 200,
            body: JSON.stringify(`success`),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});