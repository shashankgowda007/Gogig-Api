import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Employers } from './Employers';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { EmployerDetails, EmployerDetailsUpdate, EmployerId } from './types';
import { errorResponse } from 'src/utils/errors';

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

export const saveEmployerDetails = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: EmployerDetails = {
            employerId: response,
            ...event.body
        }
        const employers = new Employers(knexInstance);
        const result = await employers.save(values);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Employer details saved successfully" })
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

export const getEmployerDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
 
        const values: EmployerId = {
            employerId: response
        }
        const employers = new Employers(knexInstance);
        const result = await employers.get(values);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const updateEmployerDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: EmployerDetailsUpdate = {
            employerId: response,
            ...event.body
        }
        const employers = new Employers(knexInstance);
        await employers.update(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Employer details updated successfully" })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});
