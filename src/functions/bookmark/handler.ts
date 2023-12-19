import { middyfy } from '@libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Knex, knex } from 'knex';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { v4 as uuidv4 } from 'uuid';
import { Bookmark } from './Bookmarks';
import { AuthorizationError, ValidationError, errorResponse } from 'src/utils/errors';
import { BookmarkId, Bookmarks, GigSeekerId } from './types';

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

export const saveBookmark = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        
        const response = extractIdFromAuthToken(event.headers);

        const bookmarkId = uuidv4();

        const values: Bookmarks = {
            bookmarkId: bookmarkId,
            gigId: gigId,
            userId: response
        }
        const bookmark = new Bookmark(knexInstance);
        const result = await bookmark.save(values);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Bookmark saved successfully" })
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

export const getBookmarks = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        if (typeof response !== 'string') {
            throw new AuthorizationError('Authorization token is invalid');
        }

        const values: GigSeekerId = {
            userId: response
        }
        const bookmark = new Bookmark(knexInstance);
        const result = await bookmark.getBookmarksFromUserId(values);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const removeBookmark = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const bookmarkId: string | undefined = event.queryStringParameters?.bookmarkId;
        if (!bookmarkId) {
            throw new ValidationError('Bookmark ID Missing');
        }

        const values: BookmarkId = {
            bookmarkId: bookmarkId
        }
        const bookmark = new Bookmark(knexInstance);
        await bookmark.remove(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Bookmark removed successfully!' })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});