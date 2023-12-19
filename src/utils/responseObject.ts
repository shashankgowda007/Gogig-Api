export interface responseObject {
    success: boolean,
    error?: {
        code: string,
        message: string
    },
    payload: any
};

