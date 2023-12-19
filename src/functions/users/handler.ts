import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError, errorResponse } from 'src/utils/errors';
import { users } from './types';
import { Users } from './Users';

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

export const saveUser = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const values: users = {
            ...event.body
        }
        const users = new Users(knexInstance);
        await users.save(values);
        return {
            statusCode: 200,
            body: JSON.stringify('Kudos! Your Details are saved Successfully')
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getUsers = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId: string | undefined = event.queryStringParameters?.userId;
        if (!userId) {
            throw new ValidationError('User ID Missing');
        }
        const users = new Users(knexInstance);
        const result = await users.get(userId);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});