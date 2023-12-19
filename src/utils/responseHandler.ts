import { responseObject } from "./responseObject"

export function response(result: any): responseObject {
    return {
        success: true,
        payload: result
    }
}

export function duplicateEntry(): responseObject {
    return {
        success: false,
        error: {
            code: "ER_DUP_ENTRY",
            message: "Already exists!"
        },
        payload: []
    }
}

export function foreignKeyError(): responseObject {
    return {
        success: false,
        error: {
            code: "ER_NO_REFERENCED_ROW",
            message: "Requested id does not exist!"
        },
        payload: []
    }
}