import { handlerPath } from '@libs/handler-resolver';

export const postUserQuery = {
    handler: `${handlerPath(__dirname)}/handler.postUserQuery`,
    events: [
        {
            http: {
                method: 'post',
                path: '/postUserQuery',
                cors: true
            },
        },
    ],
};
