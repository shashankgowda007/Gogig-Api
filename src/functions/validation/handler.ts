import { middyfy } from "@libs/lambda";
import { APIGatewayProxyResult } from "aws-lambda";
import { Knex, knex } from "knex";
import { ValidationError, errorResponse } from "src/utils/errors";
import { Validations } from "./Validations";
import { extractIdFromAuthToken } from "src/utils/extractIdFromAuthToken";
import { sendMail } from "src/utils/mailer";

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

export const getUnVerifiedSeekers = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const validations = new Validations(knexInstance);

        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        const seekerdata = await validations.getUnVerifiedSeekers();
        return {
            statusCode: 200,
            body: JSON.stringify(seekerdata),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getUnVerifiedAcceptances = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const validations = new Validations(knexInstance);

        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        const seekerdata = await validations.getUnVerifiedAcceptances();
        return {
            statusCode: 200,
            body: JSON.stringify(seekerdata),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getUnVerifiedGigs = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const validations = new Validations(knexInstance);

        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        const gigdata = await validations.getUnVerifiedGigs();
        return {
            statusCode: 200,
            body: JSON.stringify(gigdata),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const verifyGigSeeker = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigSeekerId: string | undefined = event.queryStringParameters?.gigSeekerId;
        if (!gigSeekerId) {
            throw new ValidationError('GigSeeker ID Missing');
        }
        const validations = new Validations(knexInstance);
        const response = extractIdFromAuthToken(event.headers);
        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        const seekerdata = await validations.verifyGigSeeker(gigSeekerId);
        if (seekerdata) {
            var firstname = seekerdata.firstName != null ? seekerdata.firstName : "Guest";
            var lastname = seekerdata.lastName != null ? seekerdata.lastName : "";
            var html = "<p><strong>Congratulations " + firstname + " " + lastname + "</strong></p><p>Your profile is verified now, \
            Start exploring for gigs here:&nbsp;<a href=\"https://gogig.in/BrowseJobs\">https://gogig.in/BrowseJobs</a></p>\
            <p>All the best!!!</p><p><br></p>\
            <p>Regards,</p><p>GoGig Team</p><p>Click.Work.Earn</p>";
            sendMail(seekerdata.email, '[Gogig] Your profile is Verified now!', 'your profile is verified how, start exploring gigs.', html);
        }
        else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Error: ' + gigSeekerId + ' not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: gigSeekerId + 'verified' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const verifyGig = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('Gig ID Missing');
        }
        const validations = new Validations(knexInstance);
        const response = extractIdFromAuthToken(event.headers);
        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        var gigData = await validations.verifyGig(gigId);
        if (gigData) {
            var name = gigData.name != null ? gigData.name : "Employer";
            var html = "<p><strong>Congratulations " + name + "</strong></p><p>Your Gig <b>" + gigData.gigTitle + "</b> has been approved now, \
            It's being shared with seekers now. It will start at " + gigData.gigStartDate + "&nbsp;\
            <p>All the best!!!</p><p><br></p>\
            <p>Regards,</p><p>GoGig Team</p><p>Click.Work.Earn</p>";
            sendMail(gigData.emailId, '[Gogig] Your Gig is Approved now!', 'your Gig has been approved how, start exploring gigs.', html);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'gig id:' + gigId + ' title: ' + gigData.gigTitle + ' is approved' }),
            };
        }
        else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Error: ' + gigId + ' not found' }),
            };
        }

    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const verifyAcceptance = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const acceptanceId: string | undefined = event.queryStringParameters?.acceptanceId;
        if (!acceptanceId) {
            throw new ValidationError('Acceptance ID Missing');
        }
        const validations = new Validations(knexInstance);
        const response = extractIdFromAuthToken(event.headers);
        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        var acceptanceData = await validations.verifyAcceptance(acceptanceId);
        if (acceptanceData) {
            var name = acceptanceData.firstName != null ? acceptanceData.firstName : "Guest";
            var html = "<p><strong>Congratulations " + name + "</strong></p><p>Your application for Gig <b>" + acceptanceData.gigTitle + "</b> has been approved now, \
            You can start it from " + acceptanceData.gigStartDate + "&nbsp;\
            <p>All the best!!!</p><p><br></p>\
            <p>Regards,</p><p>GoGig Team</p><p>Click.Work.Earn</p>";

            sendMail(acceptanceData.email, '[Gogig] Your Request for Gig is Approved now!', 'your request for Gig has been approved now, start working.', html);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'gig id:' + acceptanceData.gigId + ' title: ' + acceptanceData.gigTitle + ' is approved' }),
            };
        }
        else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Error: ' + acceptanceId + ' not found' }),
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const verifyCompany = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const companyId: string | undefined = event.queryStringParameters?.companyId;
        if (!companyId) {
            throw new ValidationError('Company ID Missing');
        }
        const validations = new Validations(knexInstance);
        await validations.verifyCompany(companyId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const verifyEmployer = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const employerId: string | undefined = event.queryStringParameters?.employerId;
        if (!employerId) {
            throw new ValidationError('Employer ID Missing');
        }
        const validations = new Validations(knexInstance);
        await validations.verifyEmployer(employerId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const completeGig = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const gigId: string | undefined = event.queryStringParameters?.gigId;
        if (!gigId) {
            throw new ValidationError('gig ID Missing');
        }
        const validations = new Validations(knexInstance);
        await validations.completeGig(gigId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gig completion done' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const getOpenQueries = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const validations = new Validations(knexInstance);
        const response = extractIdFromAuthToken(event.headers);
        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        var queries = await validations.getOpenQueries();
        return {
            statusCode: 200,
            body: JSON.stringify({ queries }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const resolveOpenQuery = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const queryId: string | undefined = event.queryStringParameters?.queryId;
        if (!queryId) {
            throw new ValidationError('query ID Missing');
        }
        if (!event.body.comments) {
            throw new ValidationError('Must mention comments');
        }

        const validations = new Validations(knexInstance);
        const userId = extractIdFromAuthToken(event.headers);
        const isUserAdmin = await validations.getAdminStatus(userId);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        var queries = await validations.resolveOpenQuery(queryId, event.body.comments, userId);
        return {
            statusCode: 200,
            body: JSON.stringify({ queries }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const emailVerification = middyfy(async (): Promise<APIGatewayProxyResult> => {
    try {
        var html = "<p><strong>Congratulations " + 'Devjit' + "</strong></p><p>Your Gig <b>" + 'Email Verification' + "</b> has been approved now, \
            It's being shared with seekers now. It will start at " + 'Some Data' + "&nbsp;\
            <p>All the best!!!</p><p><br></p>\
            <p>Regards,</p><p>GoGig Team</p><p>Click.Work.Earn</p>";
        sendMail(`devjit.neogi@gmail.com`, '[Gogig] Your Gig is Approved now!', 'your Gig has been approved how, start exploring gigs.', html);
        return {
            statusCode: 200,
            body: JSON.stringify(`success!!`),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const listOfPaymentsToApprove = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const response = extractIdFromAuthToken(event.headers);
        const validations = new Validations(knexInstance);

        const isUserAdmin = await validations.getAdminStatus(response);

        if (isUserAdmin['isAdmin'] == 0)
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 403, message: 'Unauthorized User' })
            };

        const seekerdata = await validations.getUnVerifiedPayments();
        return {
            statusCode: 200,
            body: JSON.stringify(seekerdata),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});

export const approvePayment = middyfy(async (event): Promise<APIGatewayProxyResult> => {
    try {
        const acceptanceId: string | undefined = event.queryStringParameters?.acceptanceId;
        if (!acceptanceId) {
            throw new ValidationError('Acceptance ID Missing');
        }
        const validations = new Validations(knexInstance);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: await validations.verifyPayment(acceptanceId) }),
        };
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(error);
    }
});