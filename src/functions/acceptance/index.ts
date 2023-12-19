import { handlerPath } from '@libs/handler-resolver';

export const saveAcceptance = {
    handler: `${handlerPath(__dirname)}/handler.saveAcceptance`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveAcceptance',
                cors: true
            },
        },
    ],
};

export const getAcceptanceDetailsByAcceptanceId = {
    handler: `${handlerPath(__dirname)}/handler.getAcceptanceDetailsByAcceptanceId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAcceptanceDetailsByAcceptanceId',
                cors: true
            },
        },
    ],
};

export const getAcceptanceByGigSeekerId = {
    handler: `${handlerPath(__dirname)}/handler.getAcceptanceByGigSeekerId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAcceptanceByGigSeekerId',
                cors: true
            },
        },
    ],
};

export const getAcceptanceDetailsByGigIdAndGigSeekerId = {
    handler: `${handlerPath(__dirname)}/handler.getAcceptanceDetailsByGigIdAndGigSeekerId`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getAcceptanceDetailsByGigIdAndGigSeekerId',
                cors: true
            },
        },
    ],
};

export const removeAcceptance = {
    handler: `${handlerPath(__dirname)}/handler.removeAcceptance`,
    events: [
        {
            http: {
                method: 'delete',
                path: '/removeAcceptance',
                cors: true
            },
        },
    ],
};

export const statusUpdate = {
    handler: `${handlerPath(__dirname)}/handler.statusUpdate`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/statusUpdate',
                cors: true
            },
        },
    ],
};

export const getListOfGigsAcceptedByGigSeeker = {
    handler: `${handlerPath(__dirname)}/handler.getListOfGigsAcceptedByGigSeeker`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getListOfGigsAcceptedByGigSeeker',
                cors: true
            },
        },
    ],
};

export const getPreAcceptanceForm = {
    handler: `${handlerPath(__dirname)}/handler.getPreAcceptanceForm`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getPreAcceptanceForm',
                cors: true
            },
        },
    ],
};

export const sendForPayment = {
    handler: `${handlerPath(__dirname)}/handler.sendForPayment`,
    events: [
        {
            http: {
                method: 'post',
                path: '/sendForPayment',
                cors: true
            },
        },
    ],
};