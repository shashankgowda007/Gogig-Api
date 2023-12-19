import { Knex } from "knex";
import { duplicateEntry, foreignKeyError, response } from "src/utils/responseHandler";
import { responseObject } from "src/utils/responseObject";
import { Acceptance, AcceptanceId, GigSeekerIdAcceptanceId } from "./types";

export class Acceptances {
    knexInstance: Knex<any, any[]>;
    constructor(knexInstance: Knex) {
        this.knexInstance = knexInstance;
    }

    async save(payload: Acceptance): Promise<responseObject> {
        try {
            const [duplicate, foreignKey1, foreignKey2] = await Promise.all([
                this.knexInstance('AcceptanceDetails')
                    .select()
                    .where('gigSeekerId', payload.gigSeekerId)
                    .andWhere('visibilityId', payload.visibilityId),

                this.knexInstance('GigSeekerDetails')
                    .select()
                    .where('gigSeekerId', payload.gigSeekerId),

                this.knexInstance('VisibilityDetails')
                    .select()
                    .where('visibilityId', payload.visibilityId),
            ]);

            if (duplicate.length > 0) {
                return duplicateEntry();
            }
            if (foreignKey1.length === 0 || foreignKey2.length === 0) {
                return foreignKeyError();
            }

            await this.knexInstance('AcceptanceDetails').insert(payload);
            return response(await this.knexInstance('AcceptanceDetails')
                .select()
                .where('acceptanceId', payload.acceptanceId));
        }
        catch (error) {
            throw error;
        }
    }

    async getByAcceptanceId(payload: GigSeekerIdAcceptanceId) {
        return await this.knexInstance('AcceptanceDetails')
            .select()
            .where('acceptanceId', payload.acceptanceId);
    }

    async getByGigSeekerId(payload: GigSeekerIdAcceptanceId) {
        return await this.knexInstance('AcceptanceDetails')
            .select()
            .where('gigSeekerId', payload.gigSeekerId);
    }

    async getAcceptanceIdByGigIdAndGigSeekerId(gigId: string, gigSeekerId: string) {
        return await this.knexInstance
            .select(
                'V.*',
                'CD.*',
                'G.status as gigStatus',
                'G.totalCompleted as totalVendorsCompleted',
                'G.*',
                'A.totalCompleted as totalVendorsCompletedByUser',
                'A.*',
            )
            .from('AcceptanceDetails as A')
            .join('VisibilityDetails as V', 'A.visibilityId', 'V.visibilityId')
            .join('GigDetails as G', 'V.gigId', 'G.gigId')
            .join('CompanyDetails as CD', 'G.companyId', 'CD.companyId')
            .where('A.gigSeekerId', gigSeekerId)
            .andWhere('G.gigId', gigId);
    }

    async removeAcceptance(payload: AcceptanceId) {
        return await this.knexInstance('AcceptanceDetails')
            .where('acceptanceId', payload.acceptanceId)
            .delete();
    }

    async statusUpdater(payload: GigSeekerIdAcceptanceId) {
        try {
            if (payload.gigSeekerId) {
                await this.knexInstance('AcceptanceDetails as AD')
                    .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
                    .join('GigDetails as GD', 'GD.gigId', 'VD.gigId')
                    .where('AD.gigSeekerId', payload.gigSeekerId)
                    .andWhere('GD.gigStartDate', '<=', this.knexInstance.fn.now())
                    .andWhere('AD.status', '!=', 'completed')
                    .update('AD.status', 'onGoing');

                await this.knexInstance('AcceptanceDetails as AD')
                    .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
                    .join('GigDetails as GD', 'GD.gigId', 'VD.gigId')
                    .where('AD.gigSeekerId', payload.gigSeekerId)
                    .andWhere('GD.gigEndDate', '<=', this.knexInstance.fn.now())
                    .andWhere('AD.status', 'onGoing')
                    .update('AD.status', 'completed');
            }
        } catch (error) {
            throw error;
        }
    }

    // async markStatus(payload: Status) {
    //     return await this.knexInstance('AcceptanceDetails')
    //         .where('gigSeekerId', payload.gigSeekerId)
    //         .andWhere('gigId', payload.gigId)
    //         .update('status', payload.status);
    // }

    async getAllGigsAcceptedByGigSeeker(payload: GigSeekerIdAcceptanceId) {
        return await this.knexInstance
            .select(
                'V.*',
                'CD.*',
                'G.status as gigStatus',
                'G.totalCompleted as totalVendorsCompleted',
                'G.*',
                'A.totalCompleted as totalVendorsCompletedByUser',
                'A.*',
            )
            .from('AcceptanceDetails as A')
            .join('VisibilityDetails as V', 'A.visibilityId', 'V.visibilityId')
            .join('GigDetails as G', 'V.gigId', 'G.gigId')
            .join('CompanyDetails as CD', 'G.companyId', 'CD.companyId')
            .where('A.gigSeekerId', payload.gigSeekerId);
    }

    async markComplete(acceptanceId: string) {
        await this.knexInstance('AcceptanceDetails')
            .where('acceptanceId', acceptanceId)
            .update({
                'status': 'completed',
                'isVerified': 0,
            });
    }

    async preAcceptanceForm(gigId: string) {
        const acceptanceFormResult = await this.knexInstance('GigDetails')
            .select('preAcceptanceForm')
            .where('gigId', gigId)
        return acceptanceFormResult[0].preAcceptanceForm;
    }

    async createTransactionEntry(payload) {
        await this.knexInstance('Transactions').insert(payload);
    }

    async dates(acceptanceId: string) {
        const AcceptanceRow = await this.knexInstance('AcceptanceDetails')
            .select()
            .where('acceptanceId', acceptanceId);
        const gigSeekerId = AcceptanceRow[0].gigSeekerId;
        const gigId = await this.getGigId(AcceptanceRow[0].visibilityId);
        const earningRows = await this.knexInstance('DailyEarning')
            .select()
            .where('gigSeekerId', gigSeekerId)
            .andWhere('gigId', gigId)
            .orderBy('createdAt', 'asc');
        if(earningRows.length === 0) {
            return `no work done`;
        }

        return {
            startDate: JSON.stringify(earningRows[0].createdAt).split(`T`)[0].split(`"`)[1],
            endDate: JSON.stringify(earningRows[earningRows.length - 1].createdAt).split(`T`)[0].split(`"`)[1]
        }
    }

    async getGigId(visibilityId: string): Promise<string> {
        const row = await this.knexInstance('VisibilityDetails')
            .select()
            .where('visibilityId', visibilityId);
        return row[0].gigId;
    }
}