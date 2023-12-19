import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Companies } from './Companies';
import { v4 as uuidv4 } from 'uuid';
import { extractIdFromAuthToken } from 'src/utils/extractIdFromAuthToken';
import { CompanyDetails, CreatedById, CompanyDetailsUpdate } from './types';
import { ValidationError, errorResponse } from 'src/utils/errors';
import { uploadFileS3 } from 'src/utils/fileHandler';
import * as parseMultipart from 'lambda-multipart-parser';

const connection = {
    host: process.env.DB_ENDPOINT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};
const config: Knex.Config = {
    client: 'mysql',
    connection,
}
const knexInstance = knex(config);

export const saveCompanyDetails = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
 
        const companyId = uuidv4();
        const values: CompanyDetails = {
            companyId: companyId,
            createdBy: response,
            ...event.body
        }
        const employers = new Companies(knexInstance);
        const result = await employers.save(values);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Company details saved successfully" })
            };
        }
        else {
            return JSON.stringify(result.error)
        }
        
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getCompanyDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: CreatedById = {
            createdBy: response
        }
        const companies = new Companies(knexInstance);
        const result = await companies.get(values);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const updateCompanyDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const companyId: string | undefined = event.queryStringParameters?.companyId;
        if (!companyId) {
            throw new ValidationError('Company ID Missing');
        }

        const values: CompanyDetailsUpdate = {
            createdBy: response,
            companyId,
            ...event.body
        }
        const companies = new Companies(knexInstance);
        await companies.update(values);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Company details updated successfully!' })
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const companyLogoUpload = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const companyId: string | undefined = event.queryStringParameters?.companyId;
        if (!companyId) {
            throw new ValidationError('Company ID Missing');
        }

        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const result = await parseMultipart.parse(event);
        let fileName = `COMPANY_LOGO_${companyId}`;
        const name = await uploadFileS3(result.files[0], fileName);
        fileName = name;
        const filePath = `${bucketUrl}/${fileName}`;
        const companies = new Companies(knexInstance);
        await companies.logoUpload(filePath, companyId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Logo uploaded Successfully!' })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});