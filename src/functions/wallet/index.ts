import { handlerPath } from '@libs/handler-resolver';

export const getAllTransactionsOfGigSeeker = {
    handler: `${handlerPath(__dirname)}/handler.getAllTransactions`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getTransactions',
                cors: true,
            },
        },
    ],
};

export const saveWalletCredentials = {
    handler: `${handlerPath(__dirname)}/handler.saveWalletCredentials`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveWalletCredentials',
                cors: true,
            },
        },
    ],
};


export const getWalletCredentials = {
    handler: `${handlerPath(__dirname)}/handler.getWalletCredentials`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getWalletCredentials',
                cors: true,
            },
        },
    ],
};

export const updateWalletCredentials = {
    handler: `${handlerPath(__dirname)}/handler.updateWalletCredentials`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/updateWalletCredentials',
                cors: true,
            },
        },
    ],
};

export const requestWithdrawal = {
    handler: `${handlerPath(__dirname)}/handler.requestWithdrawal`,
    events: [
        {
            http: {
                method: 'post',
                path: '/requestWithdrawal',
                cors: true,
            },
        },
    ],
};


export const getWithdrawalTransactions = {
    handler: `${handlerPath(__dirname)}/handler.getWithdrawalTransactions`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getWithdrawalTransactions',
                cors: true,
            },
        },
    ],
};