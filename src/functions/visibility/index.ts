import { handlerPath } from '@libs/handler-resolver';

export const saveVisibilityDetails = {
    handler: `${handlerPath(__dirname)}/handler.saveVisibilityDetails`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveVisibilityDetails',
                cors: true
            },
        },
    ],
};

export const getVisibilityDetails = {
    handler: `${handlerPath(__dirname)}/handler.getVisibilityDetails`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getVisibilityDetails',
                cors: true
            },
        },
    ],
};

export const getCount  = {
    handler: `${handlerPath(__dirname)}/handler.getVisibilityCount`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getCount',
                cors: true
            },
        },
    ],
};