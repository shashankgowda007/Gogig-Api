import { JwtPayload, decode } from 'jsonwebtoken';
import { AuthorizationError } from './errors';

export const extractIdFromAuthToken = (header: { Authorization?: string; authorization?: string }): string => {
    try {
        const authorizationHeader: string = header.Authorization || header.authorization;
        if (!authorizationHeader) {
            throw new AuthorizationError('Authorization header missing.');
        }

        const token: string = authorizationHeader.split(' ')[1];
        if (!token) {
            throw new AuthorizationError('jsonWebToken token missing.');
        }

        const decodedToken: string | JwtPayload = decode(token);
        const subject = (decodedToken): string => {
            try {
                if(typeof decodedToken.sub === 'string') {
                    return decodedToken.sub;
                }
                else {
                    throw {
                        message: 'Error in Decoded Token'
                    }
                }
            } catch (error) {
                throw {
                    message: 'Error decoding jsonWebToken : ', error
                };
            }
        };

        if (typeof subject(decodedToken) === 'string') {
            return subject(decodedToken);
        }
        else {
            throw new AuthorizationError('Authorization error');
        }
    } catch (error) {
        throw error;
    }
};
