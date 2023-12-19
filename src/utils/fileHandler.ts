import { S3 } from 'aws-sdk';
import * as parseMultipart from 'lambda-multipart-parser';

const S3Instance = new S3();


export const uploadFileS3 = async (file: parseMultipart.MultipartFile, name: string): Promise<string> => {
    try {
        const fileName = `${name}.${file.contentType.split('/')[1]}`;
        const params = {
            Bucket: `gogigfileupload`,
            Key: fileName,
            Body: file.content,
            ContentType: file.contentType
        }
        await S3Instance.upload(params).promise();
        return fileName;
    } catch (error) {
        throw error
    }
};