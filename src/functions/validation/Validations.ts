import { Knex } from "knex";

export class Validations {
    knexInstance: Knex<any, any[]>;

    constructor(knexInstance: Knex) {
        this.knexInstance = knexInstance;
    }

    async getAdminStatus(userId: string) {
        return await this.knexInstance('AdminInfo')
            .select('isAdmin')
            .where('id', userId)
            .first();
    }

    async getUnVerifiedSeekers() {
        return await this.knexInstance('GigSeekerDetails')
            .where('isVerified', 0)
            .select('firstName', 'lastName', 'email', 'modeOfCommunication', 'phone', 'gigSeekerId', 'profileUrl');
    }

    async getUnVerifiedAcceptances() {
        return await this.knexInstance('AcceptanceDetails as AD')
            .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
            .join('GigDetails as GD', 'GD.gigId', 'VD.gigId')
            .join('GigSeekerDetails as GSD', 'GSD.gigSeekerId', 'AD.gigSeekerId')
            .where('AD.isVerified', 0)
            .andWhere((builder) => {
                builder.where('AD.status', 'onGoing').orWhere('AD.status', 'yetToStart');
            })
            .select('GD.gigTitle', 'AD.acceptanceId', 'GD.gigId', 'GD.gigStartDate', 'GSD.firstName', 'GSD.email', 'GSD.lastName', 'GSD.phone')
    }

    async getUnVerifiedGigs() {
        return await this.knexInstance('GigDetails as GD')
            .join('EmployerDetails as ED', 'ED.employerId', 'GD.postedByEmployerId')
            .where('GD.isVerified', 0)
            .select('GD.gigId', 'GD.gigTitle', 'GD.gigStartDate', 'ED.emailId', 'ED.phoneNumber', 'ED.name')
    }

    async getUnVerifiedPayments() {
        return await this.knexInstance('AcceptanceDetails as AD')
            .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
            .join('GigDetails as GD', 'GD.gigId', 'VD.gigId')
            .join('GigSeekerDetails as GSD', 'GSD.gigSeekerId', 'AD.gigSeekerId')
            .where('AD.isVerified', 0)
            .andWhere('AD.status', 'completed')
            .select('GD.gigTitle', 'AD.acceptanceId', 'GD.gigId', 'GD.gigStartDate', 'GSD.firstName', 'GSD.email', 'GSD.lastName', 'GSD.phone')
    }

    async verifyGigSeeker(userId: string) {
        await this.knexInstance('GigSeekerDetails')
            .where('gigSeekerId', userId)
            .update('isVerified', 1);

        return await this.knexInstance('GigSeekerDetails')
            .where('gigSeekerId', userId)
            .select('firstName', 'lastName', 'email', 'modeOfCommunication', 'phone')
            .first();
    }

    async verifyGig(gigId: string) {
        await this.knexInstance('GigDetails')
            .where('gigId', gigId)
            .update('isVerified', 1)
        return await this.knexInstance('GigDetails as GD')
            .join('EmployerDetails as ED', 'ED.employerId', 'GD.postedByEmployerId')
            .where('GD.gigId', gigId)
            .select('GD.gigTitle', 'GD.gigStartDate', 'ED.emailId', 'ED.phoneNumber', 'ED.name')
            .first();
    }

    async verifyCompany(companyId: string) {
        await this.knexInstance('CompanyDetails')
            .where('companyId', companyId)
            .update('isVerified', 1)
    }

    async verifyEmployer(employerId: string) {
        await this.knexInstance('EmployerDetails')
            .where('employerId', employerId)
            .update('isVerified', 1)
    }

    async verifyAcceptance(acceptanceId: string) {
        await this.knexInstance('AcceptanceDetails')
            .where('acceptanceId', acceptanceId)
            .update('isVerified', 1)

        return await this.knexInstance('AcceptanceDetails as AD')
            .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
            .join('GigDetails as GD', 'GD.gigId', 'VD.gigId')
            .join('GigSeekerDetails as GSD', 'GSD.gigSeekerId', 'AD.gigSeekerId')
            .where('AD.acceptanceId', acceptanceId)
            .select('GD.gigTitle', 'GD.gigId', 'GD.gigStartDate', 'GSD.firstName', 'GSD.email', 'GSD.lastName', 'GSD.phone')
            .first();
    }

    async completeGig(gigId: string) {
        await this.knexInstance('GigDetails')
            .where('gigId', gigId)
            .update('status', 'completed');
    }

    async getOpenQueries() {
        return await this.knexInstance('QueryHistory')
            .select()
            .where('isAddressed', 0);
    }

    async resolveOpenQuery(queryId: string, comments: string, resolvedBy: string) {
        return await this.knexInstance('QueryHistory')
            .where('queryId', queryId)
            .update('comments', comments)
            .update('addressedBy', resolvedBy)
            .update('isAddressed', 1);
    }

    async verifyPayment(acceptanceId: string) {
        const acceptanceRow = await this.knexInstance('AcceptanceDetails')
            .select()
            .where('acceptanceId', acceptanceId)
        const visibilityRow = await this.knexInstance('VisibilityDetails')
            .select()
            .where('visibilityId', acceptanceRow[0].visibilityId);
        const updateResult = await this.knexInstance('Transactions')
            .where('gigId', visibilityRow[0].gigId)
            .andWhere('gigSeekerId', acceptanceRow[0].gigSeekerId)
            .andWhere('isVerified', 0)
            .update({
                transactionStatus: 'success',
                isVerified: 1,
            });
        if (updateResult) {
            const transactionRow = await this.knexInstance('Transactions')
                .select()
                .where('gigId', visibilityRow[0].gigId)
                .andWhere('gigSeekerId', acceptanceRow[0].gigSeekerId);
            await this.knexInstance('Wallet')
                .where('gigSeekerId', acceptanceRow[0].gigSeekerId)
                .increment('totalEarned', transactionRow[0].amount);

            await this.knexInstance('AcceptanceDetails')
                .where('acceptanceId', acceptanceId)
                .update('isVerified', 1)
            return `Payment Approved!!`
        } else {
            return 'Already Approved!!'
        }
    }
}