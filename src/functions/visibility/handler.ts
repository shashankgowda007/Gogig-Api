import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Visibilities } from './Visibilities';
import { ValidationError, errorResponse } from 'src/utils/errors';
import { VisibilityDetails_GET_GigID, VisibilityDetails_POST } from './types';

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

export const saveVisibilityDetails = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }

        const visibilities = new Visibilities(knexInstance);
        const visibilityId = uuidv4();
        const values: VisibilityDetails_POST = {
            gigId: gigId,
            visibilityId: visibilityId
        }
        const result = await visibilities.save(values);

        const GigId: VisibilityDetails_GET_GigID = {
            gigId
        }
        await visibilities.publishGig(GigId);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Gig Published Successfully!' })
            }
        }
        else {
            return JSON.stringify(result.error)
        }

    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getVisibilityDetails = middyfy(async (): Promise<APIGatewayProxyResult> => {
    try {
        const visibilities = new Visibilities(knexInstance);
        return {
            statusCode: 200,
            body: JSON.stringify(await visibilities.get())
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getVisibilityCount = middyfy(async (): Promise<APIGatewayProxyResult> => {
    try {
        const visibilities = new Visibilities(knexInstance);
        const result = await visibilities.getCount();
        const data = {
            "visibleGigs": result[0],
            "gigSeekerCount": result[1],
            "numberOfCompaniesRegistered": result[2],
            "numberOfGigsPublished": result[3]
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});