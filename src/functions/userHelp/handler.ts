import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse } from 'src/utils/errors';
import { UserQuery } from './types';
import { UserHelp } from './help';

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

export const postUserQuery = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const values: UserQuery = {
            isAddressed: 0,
            queryId: uuidv4(),
            ...event.body
        }
        const userHelp = new UserHelp(knexInstance);
        var response = await userHelp.addUserQuery(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ response })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});