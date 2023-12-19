import { handlerPath } from '@libs/handler-resolver';

export const saveBookmark = {
    handler: `${handlerPath(__dirname)}/handler.saveBookmark`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveBookmark',
                cors: true
            },
        },
    ],
};
export const getBookmarks = {
    handler: `${handlerPath(__dirname)}/handler.getBookmarks`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getBookmarks',
                cors: true
            },
        },
    ],
};
export const removeBookmark = {
    handler: `${handlerPath(__dirname)}/handler.removeBookmark`,
    events: [
        {
            http: {
                method: 'delete',
                path: '/removeBookmark',
                cors: true,
            },
        },
    ],
};
