import { handlerPath } from '@libs/handler-resolver';

export const getFiles = {
    handler: `${handlerPath(__dirname)}/handler.getFiles`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getFiles',
                cors: true,
            },
        },
    ],
};

export const getByFileName = {
    handler: `${handlerPath(__dirname)}/handler.getByFileName`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getByFileName',
                cors: true,
            },
        },
    ],
};

export const uploadFile = {
    handler: `${handlerPath(__dirname)}/handler.uploadFile`,
    events: [
        {
            http: {
                method: 'post',
                path: '/uploadFile',
                cors: true
            },
        },
    ],
};

export const uploadCSV = {
    handler: `${handlerPath(__dirname)}/handler.uploadCSV`,
    events: [
        {
            http: {
                method: 'post',
                path: '/uploadCSV',
                cors: true,
            },
        },
    ],
};

export const removeCSV = {
    handler: `${handlerPath(__dirname)}/handler.removeCSV`,
    events: [
        {
            http: {
                method: 'delete',
                path: '/removeCSV',
                cors: true,
            },
        },
    ],
};

export const fileUploader = {
    handler: `${handlerPath(__dirname)}/handler.brandingFileUploader`,
    events: [
        {
            http: {
                method: 'post',
                path: '/fileUploader',
                cors: true
            },
        },
    ],
};

export const tester = {
    handler: `${handlerPath(__dirname)}/handler.tester`,
    events: [
        {
            http: {
                method: 'post',
                path: '/tester',
                cors: true
            },
        },
    ],
};