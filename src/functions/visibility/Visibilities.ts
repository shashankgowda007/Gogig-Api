import { Knex } from "knex";
import { VisibilityDetails_POST, VisibilityDetails_GET_GigID } from "./types";
import { responseObject } from "src/utils/responseObject";
import { duplicateEntry, foreignKeyError, response } from "src/utils/responseHandler";


export class Visibilities {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async save(payload: VisibilityDetails_POST): Promise<responseObject> {
    try {
      const [duplicate1, duplicate2, foreignKey] = await Promise.all([
        this.knexInstance('VisibilityDetails')
          .select()
          .where('gigId', payload.gigId),

        this.knexInstance('VisibilityDetails')
          .select()
          .where('visibilityId', payload.visibilityId),

        this.knexInstance('GigDetails')
          .select()
          .where('gigId', payload.gigId)
      ]);

      if (duplicate1.length > 0 || duplicate2.length > 0) {
        return duplicateEntry();
      }
      if (foreignKey.length === 0) {
        return foreignKeyError();
      }

      await this.knexInstance('VisibilityDetails').insert(payload);
      return response(this.knexInstance('VisibilityDetails')
        .select()
        .where('visibilityId', payload.visibilityId));
    }
    catch (error) {
      throw error;
    }
  }

  async publishGig(payload: VisibilityDetails_GET_GigID) {
    await this.knexInstance('GigDetails')
      .where('gigId', payload.gigId)
      .update({
        status: 'published',
        publishedAt: this.knexInstance.fn.now()
      });
  }

  async get() {
    const currentDateAndTime = new Date();
    const gigIdResults = await this.knexInstance
      .select('G.gigId')
      .from('VisibilityDetails as V')
      .innerJoin('GigDetails as G', 'V.gigId', 'G.gigId');
    const gigIds = gigIdResults.map((row) => row.gigId);

    for (const gigId of gigIds) {
      await this.updateVacancies(gigId);
    }
    return await this.knexInstance('VisibilityDetails as V')
      .select('CD.*', 'V.*', 'G.*')
      .join('GigDetails as G', 'G.gigId', 'V.GigId')
      .join('CompanyDetails as CD', 'CD.companyId', 'G.companyId')
      .where('G.status', 'published')
      .andWhere('G.isVerified', 1)
      .andWhere('G.gigEndDate', '>=', currentDateAndTime)
      .orderBy('G.publishedAt', 'desc')
      .limit(12);
  }

  async updateVacancies(gigId: string) {
    const countResult = await this.knexInstance
      .from('AcceptanceDetails')
      .whereIn('visibilityId', function () {
        this
          .select('visibilityId')
          .from('VisibilityDetails')
          .where('gigId', gigId);
      })
      .count('* as count');

    const count = countResult[0].count;

    return await this.knexInstance('VisibilityDetails')
      .where('gigId', gigId)
      .update('numberOfApplicants', count);
  }

  async getCount() {
    const [VisibilityDetails] = await this.knexInstance('VisibilityDetails').count('* as count');
    const [GigSeekerDetails] = await this.knexInstance('GigSeekerDetails').count('* as count');
    const [CompanyDetails] = await this.knexInstance('CompanyDetails').count('* as count');
    const [GigsVisibleAndPast] = await this.knexInstance('GigDetails')
      .where('status', 'published')
      .count('* as count');
    return [VisibilityDetails.count, GigSeekerDetails.count, CompanyDetails.count, GigsVisibleAndPast.count];
  }
}