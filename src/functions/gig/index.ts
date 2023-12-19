import { handlerPath } from '@libs/handler-resolver';

export const getGigDetailsByGigId = {
    handler: `${handlerPath(__dirname)}/handler.getGigDetailsByGigId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getGigDetailsByGigId',
                cors: true,
            },
        },
    ],
};

export const getGigDetailsByEmployerId = {
    handler: `${handlerPath(__dirname)}/handler.getGigDetailsByEmployerId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getGigDetailsByEmployerId',
                cors: true,
            },
        },
    ],
};

export const getAllGigDetails = {
    handler: `${handlerPath(__dirname)}/handler.getAllGigDetails`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAllGigDetails',
                cors: true,
            },
        },
    ],
};

export const saveGigDetails = {
    handler: `${handlerPath(__dirname)}/handler.saveGigDetails`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveGigDetails',
                cors: true
            },
        },
    ],
};

export const updateGigDetails = {
    handler: `${handlerPath(__dirname)}/handler.updateGigDetails`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/updateGigDetails',
                cors: true,
            },
        },
    ],
};

export const removeGig = {
    handler: `${handlerPath(__dirname)}/handler.removeGig`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/removeGig',
                cors: true,
            },
        },
    ],
};

export const saveQuestionaire = {
    handler: `${handlerPath(__dirname)}/handler.saveQuestionaire`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/saveQuestionaire',
                cors: true,
            },
        },
    ],
};

export const getQuestionaire = {
    handler: `${handlerPath(__dirname)}/handler.getQuestionaire`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getQuestionaire',
                cors: true,
            },
        },
    ],
};

export const gigFileUpload = {
    handler: `${handlerPath(__dirname)}/handler.gigFileUpload`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/gigFileUpload',
                cors: true,
            },
        },
    ],
};