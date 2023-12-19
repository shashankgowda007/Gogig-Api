import { handlerPath } from '@libs/handler-resolver';

export const getUnVerifiedSeekers = {
    handler: `${handlerPath(__dirname)}/handler.getUnVerifiedSeekers`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getUnVerifiedSeekers',
                cors: true,
            },
        },
    ],
};

export const getUnVerifiedGigs = {
    handler: `${handlerPath(__dirname)}/handler.getUnVerifiedGigs`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getUnVerifiedGigs',
                cors: true,
            },
        },
    ],
};

export const getUnVerifiedAcceptances = {
    handler: `${handlerPath(__dirname)}/handler.getUnVerifiedAcceptances`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getUnVerifiedAcceptances',
                cors: true,
            },
        },
    ],
};

export const approveWalletWithdraw = {
    handler: `${handlerPath(__dirname)}/handler.approveWalletWithdraw`,
    events: [
        {
            http: {
                method: 'put',
                path: '/approveWalletWithdraw',
                cors: true,
            },
        },
    ],
};

export const verifyGigSeeker = {
    handler: `${handlerPath(__dirname)}/handler.verifyGigSeeker`,
    events: [
        {
            http: {
                method: 'put',
                path: '/verifyGigSeeker',
                cors: true,
            },
        },
    ],
};

export const verifyGig = {
    handler: `${handlerPath(__dirname)}/handler.verifyGig`,
    events: [
        {
            http: {
                method: 'put',
                path: '/verifyGig',
                cors: true,
            },
        },
    ],
};

export const verifyCompany = {
    handler: `${handlerPath(__dirname)}/handler.verifyCompany`,
    events: [
        {
            http: {
                method: 'put',
                path: '/verifyCompany',
                cors: true,
            },
        },
    ],
};

export const verifyEmployer = {
    handler: `${handlerPath(__dirname)}/handler.verifyEmployer`,
    events: [
        {
            http: {
                method: 'put',
                path: '/verifyEmployer',
                cors: true,
            },
        },
    ],
};

export const verifyAcceptance = {
    handler: `${handlerPath(__dirname)}/handler.verifyAcceptance`,
    events: [
        {
            http: {
                method: 'put',
                path: '/verifyAcceptance',
                cors: true,
            },
        },
    ],
};

export const completeGig = {
    handler: `${handlerPath(__dirname)}/handler.completeGig`,
    events: [
        {
            http: {
                method: 'put',
                path: '/completeGig',
                cors: true,
            },
        },
    ],
};

export const getOpenQueries = {
    handler: `${handlerPath(__dirname)}/handler.getOpenQueries`,
    events: [
        {
            http: {
                method: 'get',
                path: '/getOpenQueries',
                cors: true,
            },
        },
    ],
};

export const resolveOpenQuery = {
    handler: `${handlerPath(__dirname)}/handler.resolveOpenQuery`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/resolveOpenQuery',
                cors: true,
            },
        },
    ],
};

export const emailVerification = {
    handler: `${handlerPath(__dirname)}/handler.emailVerification`,
    events: [
        {
            http: {
                method: 'post',
                path: '/emailVerification',
                cors: true,
            },
        },
    ],
};

export const listOfPaymentsToApprove = {
    handler: `${handlerPath(__dirname)}/handler.listOfPaymentsToApprove`,
    events: [
        {
            http: {
                method: 'get',
                path: '/listOfPaymentsToApprove',
                cors: true,
            },
        },
    ],
};

export const approvePayment = {
    handler: `${handlerPath(__dirname)}/handler.approvePayment`,
    events: [
        {
            http: {
                method: 'patch',
                path: '/approvePayment',
                cors: true,
            },
        },
    ],
};