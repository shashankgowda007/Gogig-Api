import { Knex } from "knex";
import { GigDetails_GET_GigId, Response_GET_GigSeekerId, Response_GET_ResponseId } from "./types";
interface Assignment {
    responseId?: string,
    vendorId: string,
    gigSeekerId: string,
}

export class Responses {
    knexInstance: Knex<any, any[]>;

    constructor(knexInstance: Knex) {
        this.knexInstance = knexInstance;
    }

    async get(payload: GigDetails_GET_GigId) {
        return await this.knexInstance
            .select()
            .from('VendorDetails')
            .where('gigId', payload.gigId)
    }


    async getColumnNames(tableName: string) {
        return await this.knexInstance.raw(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`, [tableName])
            .then((result) => {
                const columnNames = result[0].map((row) => row.COLUMN_NAME);
                return columnNames;
            });
    }

    async getResponseDetailsByGigSeekerId(payload: Response_GET_GigSeekerId) {
        return await this.knexInstance('ResponseDetails')
            .select()
            .where('gigSeekerId', payload.gigSeekerId);
    }

    async getByGigSeekerId(payload: Response_GET_GigSeekerId) {
        return await this.knexInstance('VendorDetails')
            .select()
            .where('gigId', payload.gigId)
            .andWhere('gigSeekerId', payload.gigSeekerId)
            .andWhere('assignmentStatus', 'assigned');
    }

    async getQuestionaire(gigId: string) {
        const questionaireResult = await this.knexInstance('GigDetails')
            .select('questionaire')
            .where('gigId', gigId);
        return questionaireResult[0].questionaire;
    }

    async pullNUnassigned(n: number, gigId: string) // where N is the number of unassigned rows we want to pull from the vendor list
    {
        return (
            await this.knexInstance('VendorDetails')
                .select('vendorId')
                .where('assignmentStatus', 'unassigned')
                .andWhere('gigId', gigId)
                .limit(n)
        ).map((row) => row.vendorId);
    }

    async assignVendorToGigSeeker(details: Assignment[], gigSeekerId: string, vendorIds: string[], gigId: string) {
        await this.knexInstance('VendorDetails')
            .where('gigId', gigId)
            .whereIn('vendorId', vendorIds)
            .update('assignmentStatus', 'assigned');
        const questionaireResult = await this.knexInstance('GigDetails')
            .select('questionaire')
            .where('gigId', gigId);
        const newDetails = details.map((jsonObject) => ({
            ...jsonObject,
            questionaireResponse: questionaireResult[0].questionaire,
        }));
        await this.knexInstance('VendorDetails')
            .where('vendorId', vendorIds[0])
            .update(newDetails[0]);
        return await this.knexInstance('VendorDetails')
            .select()
            .where('gigSeekerId', gigSeekerId);
    }

    async assignBranding(payload) {
        await this.knexInstance('VendorDetails').insert(payload);
    }

    async update(gigId, gigSeekerId, payload) {
        await this.knexInstance('VendorDetails')
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('assignmentStatus', 'assigned')
            .update(payload);
        return await this.knexInstance('VendorDetails')
            .select()
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId);
    }

    async updateBranding(gigId, gigSeekerId, payload) {
        const vendorIdResult = await this.knexInstance('VendorDetails')
            .select('vendorId')
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('assignmentStatus', 'assigned');
        await this.knexInstance('VendorDetails')
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('assignmentStatus', 'assigned')
            .update({
                questionaireResponse: JSON.stringify(payload),
                assignmentStatus: 'success'
            });
        return await this.knexInstance('VendorDetails')
            .select()
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('vendorId', vendorIdResult[0].vendorId);
    }

    async unassign(responseId: string, callStatus: string) {
        await this.knexInstance
            .from('ClientList')
            .join('ResponseDetails', 'ClientList.vendorId', 'ResponseDetails.vendorId')
            .where('ResponseDetails.responseId', responseId)
            .update('ClientList.assignmentStatus', 'marked');
        if (callStatus === 'invalid') {
            await this.knexInstance
                .from('ClientList')
                .join('ResponseDetails', 'ClientList.vendorId', 'ResponseDetails.vendorId')
                .where('ResponseDetails.responseId', responseId)
                .update('ClientList.assignmentStatus', 'failed');
        }
    }

    async getCallStatus(gigId, gigSeekerId): Promise<string> {
        const res = await this.knexInstance('VendorDetails')
            .select('callStatus')
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('assignmentStatus', 'assigned');
        return res[0].callStatus;
    }

    async getRetryCount(payload: Response_GET_ResponseId) {
        const res = await this.knexInstance('ResponseDetails')
            .select('retry')
            .where('responseId', payload.responseId);
        return res[0].retry;
    }

    async setClientStatus(callStatus: string, gigId: string, gigSeekerId: string) {
        if (callStatus === 'success') {
            const questionaireResponseResult = await this.knexInstance('VendorDetails')
                .select('questionaireResponse')
                .where('gigId', gigId)
                .andWhere('gigSeekerId', gigSeekerId)
                .andWhere('assignmentStatus', 'assigned');
            questionaireResponseResult.forEach(async (questionaireResponse) => {
                if (questionaireResponse.answer === null) {
                    await this.knexInstance('VendorDetails')
                        .where('gigId', gigId)
                        .andWhere('gigSeekerId', gigSeekerId)
                        .andWhere('assignmentStatus', 'assigned')
                        .update('isAnswerInvalid', 1);
                }
            })
            await this.knexInstance('VendorDetails')
                .where('gigId', gigId)
                .andWhere('gigSeekerId', gigSeekerId)
                .andWhere('assignmentStatus', 'assigned')
                .andWhere('callStatus', 'success')
                .update('assignmentStatus', 'success');
        }
        if (callStatus === 'invalid') {
            await this.knexInstance('VendorDetails')
                .where('gigId', gigId)
                .andWhere('gigSeekerId', gigSeekerId)
                .andWhere('assignmentStatus', 'assigned')
                .andWhere('callStatus', 'invalid')
                .update('assignmentStatus', 'failed');
        }
        if (callStatus === 'busy' || callStatus === 'unreachable' || callStatus === 'be right back') {
            await this.knexInstance('VendorDetails')
                .where('gigId', gigId)
                .andWhere('gigSeekerId', gigSeekerId)
                .andWhere('assignmentStatus', 'assigned')
                .andWhere(function () {
                    this.where('callStatus', 'busy')
                        .orWhere('callStatus', 'unreachable')
                        .orWhere('callStatus', 'be right back');
                })
                .update('assignmentStatus', 'marked');
        }
    }

    async updateNumberOfTaskCompletedAndEarning(gigId: string, gigSeekerId: string, dailyEarningId: string) {
        const visibilityIdResult = await this.knexInstance('AcceptanceDetails as AD')
            .select('AD.visibilityId')
            .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
            .where('VD.gigId', gigId)
        const visibilityId = visibilityIdResult[0].visibilityId;

        const totalCompletedResult = await this.knexInstance('AcceptanceDetails')
            .select('totalCompleted')
            .where('visibilityId', visibilityId)
            .andWhere('gigSeekerId', gigSeekerId);
        let newTotalCompleted = totalCompletedResult[0].totalCompleted;
        newTotalCompleted = newTotalCompleted + 1;
        await this.knexInstance('AcceptanceDetails')
            .where('visibilityId', visibilityId)
            .andWhere('gigSeekerId', gigSeekerId)
            .update('totalCompleted', newTotalCompleted);
        const totalVendorsCompletedResult = await this.knexInstance('AcceptanceDetails')
            .sum('totalCompleted as completed')
            .where('visibilityId', visibilityId);
        const totalVendorsCompleted = totalVendorsCompletedResult[0].completed;
        await this.knexInstance('GigDetails')
            .where('gigId', gigId)
            .update('totalCompleted', totalVendorsCompleted);
        const completedTodayResult = await this.knexInstance('DailyEarning')
            .select('taskCount')
            .where('dailyEarningId', dailyEarningId);
        let completedToday = completedTodayResult[0].taskCount;
        completedToday = completedToday + 1;
        await this.knexInstance('DailyEarning')
            .where('dailyEarningId', dailyEarningId)
            .update('taskCount', completedToday);
        const pricePerClientResult = await this.knexInstance('GigDetails')
            .select('pricePerClient')
            .where('gigId', gigId);
        const pricePerClient = pricePerClientResult[0].pricePerClient;
        await Promise.all([
            this.knexInstance('DailyEarning')
                .where('dailyEarningId', dailyEarningId)
                .update('todaysEarning', pricePerClient * completedToday),

            this.knexInstance('AcceptanceDetails')
                .where('visibilityId', visibilityId)
                .andWhere('gigSeekerId', gigSeekerId)
                .update('earned', pricePerClient * newTotalCompleted),
        ]);
    }

    async getGigIdAndGigSeekerIdFromResponseId(responseId: string) {
        const [gigIdResult, gigSeekerIdResult] = await Promise.all([
            this.knexInstance('ResponseDetails as RD')
                .select('CL.gigId')
                .join('ClientList as CL', 'CL.vendorId', 'RD.vendorId')
                .where('RD.responseId', responseId),

            this.knexInstance('ResponseDetails')
                .where('responseId', responseId)
                .select('gigSeekerId'),
        ])
        return {
            gigId: gigIdResult[0].gigId,
            gigSeekerId: gigSeekerIdResult[0].gigSeekerId
        };
    }

    async checkIfExists(gigId: string, gigSeekerId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Set time to the beginning of the next day

        const res = await this.knexInstance('DailyEarning')
            .select()
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('createdAt', '>=', today)
            .andWhere('createdAt', '<', tomorrow)

        if (res.length > 0) {
            return true;
        }
        else return false;
    }

    async getDailyEarningId(gigId: string, gigSeekerId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Set time to the beginning of the next day

        const res = await this.knexInstance('DailyEarning')
            .select('dailyEarningId')
            .where('gigId', gigId)
            .andWhere('gigSeekerId', gigSeekerId)
            .andWhere('createdAt', '>=', today)
            .andWhere('createdAt', '<', tomorrow)
        return res[0].dailyEarningId;
    }

    async pushARow(payload) {
        await this.knexInstance('DailyEarning').insert(payload)
    }

    async getGigCategory(gigId: string) {
        const gigCategoryResult = await this.knexInstance('GigDetails')
            .select('category')
            .where('gigId', gigId)
        return gigCategoryResult[0].category;
    }

    async checkVehicleNumber(gigId: string, vehicleNumber: string) {
        const exists = await this.knexInstance('VendorDetails')
            .where('gigId', gigId)
            .whereRaw(`JSON_CONTAINS(questionaireResponse->'$.Q1.answer', ?)`, [JSON.stringify(vehicleNumber)]);
        if (exists.length != 0) return true
        else return false
    }

    async getQuestionaireResponse(gigId: string, limit: number, offset: number) {
        return await this.knexInstance('VendorDetails')
            .select('questionaireResponse')
            .where('gigId', gigId)
            .limit(limit)
            .offset(offset);
    }

    async aggregateInformation(gigId: string) {
        const [gigDetailsRow, totalCountResult] = await Promise.all([
            this.knexInstance('GigDetails')
                .first()
                .where('gigId', gigId),

            this.knexInstance('VendorDetails')
                .first()
                .count('* as count')
                .where('gigId', gigId)

        ]);
        const [companyDetailsRow, totalCount] = await Promise.all([
            this.knexInstance('CompanyDetails')
                .first()
                .where('companyId', gigDetailsRow.companyId),

            totalCountResult.count,
        ]);
        return {
            companyName: companyDetailsRow.companyName,
            companyLogo: companyDetailsRow.companyLogo,
            totalCount
        }
    }
}