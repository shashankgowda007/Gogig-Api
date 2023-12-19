import { handlerPath } from '@libs/handler-resolver';

export const getAllResponses = {
    handler: `${handlerPath(__dirname)}/handler.getAllResponses`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAllResponses',
                cors: true,
            },
        },
    ],
};

export const getResponseByGigSeekerId = {
    handler: `${handlerPath(__dirname)}/handler.getResponseByGigSeekerId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getResponseByGigSeekerId',
                cors: true,
            },
        },
    ],
};

export const assignToGigSeeker = {
    handler: `${handlerPath(__dirname)}/handler.assignToGigSeeker`,
    events: [
        {
            http: {
                method: 'post',
                path: '/assignToGigSeeker',
                cors: true
            },
        },
    ],
};

export const updateResponse = {
    handler: `${handlerPath(__dirname)}/handler.updateResponse`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/updateResponse',
                cors: true
            },
        },
    ],
};

export const getAssignedDetails = {
    handler: `${handlerPath(__dirname)}/handler.getAssignedVendorDetails`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAssignedDetails',
                cors: true,
            },
        },
    ],
};

export const getQuestionaireResponseByGigId = {
    handler: `${handlerPath(__dirname)}/handler.getQuestionaireResponseByGigId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getQuestionaireResponseByGigId',
                cors: true,
            },
        },
    ],
};

export const removeAssignment = {
    handler: `${handlerPath(__dirname)}/handler.removeAssignment`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/removeAssignment',
                cors: true,
            },
        },
    ],
};

export const getResponseQuestionnaire = {
    handler: `${handlerPath(__dirname)}/handler.getResponseQuestionnaire`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getResponseQuestionnaire',
                cors: true,
            },
        },
    ],
};

export const aggregateInformation = {
    handler: `${handlerPath(__dirname)}/handler.aggregateInformation`,
    events: [
        {
            http: {
                method: 'get',
                path: '/aggregateInformation',
                cors: true,
            },
        },
    ],
};