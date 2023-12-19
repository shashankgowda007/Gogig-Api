import { middyfy } from '@libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Knex, knex } from 'knex';
import { errorResponse } from 'src/utils/errors';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { Wallet } from './Wallet';
import { WalletCreds, WalletCredsUpdate } from './types';
import { v4 as uuidv4 } from 'uuid';

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

export const getAllTransactions = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const wallet = new Wallet(knexInstance);
        const result = await wallet.getTransactions(response);
        return {
            statusCode: 200,
            body: JSON.stringify({ transactions: result.transactions, totalEarned: result.totalEarnings })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const saveWalletCredentials = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: WalletCreds = {
            userId: response,
            ...event.body
        }
        const wallet = new Wallet(knexInstance);
        await wallet.saveWalletCreds(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Credentials Saved Successfully!' })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getWalletCredentials = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const wallet = new Wallet(knexInstance);
        const result = await wallet.getWalletCreds(response);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const updateWalletCredentials = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: WalletCredsUpdate = {
            ...event.body
        }
        const wallet = new Wallet(knexInstance);
        await wallet.updateWalletCreds(response, values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Credentials Updated Successfully!' })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getWithdrawalTransactions = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const wallet = new Wallet(knexInstance);
        const result = wallet.getAllWithdrawal(response);
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const requestWithdrawal = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const transactionId = uuidv4();
        const values = {
            gigSeekerId: response,
            transactionId,
            withdrawAmount: event.body.withdrawAmount
        }
        const wallet = new Wallet(knexInstance);
        await wallet.requestWithdrawal(values);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Withdrawal Request Raised Successfully!' })
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});