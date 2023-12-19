import { handlerPath } from '@libs/handler-resolver';

export const saveCompanyDetails = {
    handler: `${handlerPath(__dirname)}/handler.saveCompanyDetails`,
    events: [
        {
            http: {
                method: 'post',
                path: '/saveCompanyDetails',
                cors: true
            },
        },
    ],
};

export const getCompanyDetails = {
    handler: `${handlerPath(__dirname)}/handler.getCompanyDetails`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getCompanyDetails',
                cors: true
            },
        },
    ],
};

export const updateCompanyDetails = {
    handler: `${handlerPath(__dirname)}/handler.updateCompanyDetails`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/updateCompanyDetails',
                cors: true
            },
        },
    ],
};

export const companyLogoUpload = {
    handler: `${handlerPath(__dirname)}/handler.companyLogoUpload`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/uploadCompanyLogo',
                cors: true
            },
        },
    ],
};