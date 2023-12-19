import { APIGatewayProxyResult } from "aws-lambda";

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class ResourceNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ResourceNotFoundError';
    }
}

export function errorResponse(error: Error): APIGatewayProxyResult {
    if (error instanceof AuthorizationError) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Authorization error' }),
        };
    } else if (error instanceof ValidationError) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Validation error' }),
        };
    } else if (error instanceof ResourceNotFoundError) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Resource not found' }),
        };
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Uh oh! Something Went Wrong :(' }),
        };
    }
}