import { handlerPath } from '@libs/handler-resolver';

export const saveEmployerDetails = {
    handler: `${handlerPath(__dirname)}/handler.saveEmployerDetails`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveEmployerDetails',
                cors: true
            },
        },
    ],
};

export const getEmployerDetails = {
    handler: `${handlerPath(__dirname)}/handler.getEmployerDetails`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getEmployerDetails',
                cors: true
            },
        },
    ],
};

export const updateEmployerDetails = {
    handler: `${handlerPath(__dirname)}/handler.updateEmployerDetails`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/updateEmployerDetails',
                cors: true
            },
        },
    ],
};
