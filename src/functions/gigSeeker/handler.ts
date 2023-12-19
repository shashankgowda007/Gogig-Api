import { middyfy } from '@libs/lambda';
import { Knex, knex } from 'knex';
import { APIGatewayProxyResult } from 'aws-lambda';
import { GigSeekers } from './GigSeekers';
import { extractIdFromAuthToken } from '../../utils/extractIdFromAuthToken';
import { errorResponse } from 'src/utils/errors';
import { GigSeeker_GET, GigSeeker_POST, GigSeeker_REMOVE, GigSeeker_UPDATE } from './types';
import { Locations, Languages, PersonalIncomeRange, FamilyIncomeRange,FieldOfStudy, WorkExperience, Qualifications, RecruitmentStatus, QualificationYear, WorkAvailability, WorkLocation, TravelPreference, ModeOfCommunication } from 'src/utils/staticData';
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

export const getGigProfileStaticData = middyfy(async (): Promise<APIGatewayProxyResult> => {
    try {
        
        const result = {
            "locations": Locations,
            "Languages": Languages,
            "PersonalIncomeRange": PersonalIncomeRange,
            "FamilyIncomeRange": FamilyIncomeRange,
            "WorkExperience": WorkExperience,
            "Qualifications": Qualifications,
            "RecruitmentStatus": RecruitmentStatus,
            "FieldOfStudy": FieldOfStudy,
            "QualificationYear": QualificationYear,
            "WorkAvailability": WorkAvailability,
            "WorkLocation": WorkLocation,
            "TravelPreference": TravelPreference,
            "ModeOfCommunication": ModeOfCommunication

         };
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getGigSeekerDetails = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeeker_GET = {
            gigSeekerId: response
        }

        const gigSeekers = new GigSeekers(knexInstance);
        const result = await gigSeekers.get(values);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const saveGigSeekerDetails = middyfy(async (event): Promise<APIGatewayProxyResult | string> => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeeker_POST = {
            gigSeekerId: response,
            ...event.body
        }

        const gigSeekers = new GigSeekers(knexInstance);
        const result = await gigSeekers.save(values);

        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Gig seeker details saved successfully.' }),
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

export const updateGigSeekerDetails = middyfy(async (event) => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        
        const values: GigSeeker_UPDATE = {
            gigSeekerId: response,
            ...event.body
        }
        const gigSeekers = new GigSeekers(knexInstance);
        await gigSeekers.update(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gig seeker details updated successfully!' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const removeGigSeeker = middyfy(async (event) => {
    try {
        const response = extractIdFromAuthToken(event.headers);

        const values: GigSeeker_REMOVE = {
            gigSeekerId: response

        }

        const gigSeekers = new GigSeekers(knexInstance);
        await gigSeekers.remove(values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gig seeker deleted successfully!' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const columnListGigSeeker = middyfy(async () => {
    try {
        const gigSeekers = new GigSeekers(knexInstance);
        const result = await gigSeekers.allColumns();
        return JSON.stringify(result);
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const seekerProfilePhotoUpload = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigSeekerId = extractIdFromAuthToken(event.headers);
        
        const gigSeekers = new GigSeekers(knexInstance);
        const bucketUrl = `https://8r8rpl19e6.execute-api.us-east-1.amazonaws.com/v1/gogigfileupload`;
        const result = await parseMultipart.parse(event);
        let fileName = `DP_${gigSeekerId}`
        const name = await uploadFileS3(result.files[0], fileName);
        fileName = name;
        const filePath = `${bucketUrl}/${fileName}`;
        await gigSeekers.seekerProfilePhotoUpload(filePath, gigSeekerId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'profile uploaded Successfully! ', fileUrl: filePath })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});