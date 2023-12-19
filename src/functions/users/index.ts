import { handlerPath } from '@libs/handler-resolver';

export const saveUser = {
    handler: `${handlerPath(__dirname)}/handler.saveUser`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveUser',
                cors: true
            },
        },
    ],
};

export const getUsers = {
    handler: `${handlerPath(__dirname)}/handler.getUsers`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getUsers',
                cors: true
            },
        },
    ],
};