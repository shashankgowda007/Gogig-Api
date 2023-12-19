import { Knex } from "knex";
import { GetGigId, GetEmployerId, GigDetails, GigDetails_PATCH, UpdateQuestionaire, GetQuestionaire } from "./types";
import { duplicateEntry, foreignKeyError, response } from "src/utils/responseHandler";
import { responseObject } from "src/utils/responseObject";

export class Gigs {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async get(payload: GetGigId) {
    const res = await this.knexInstance
      .select('CD.*', 'V.*', 'G.*')
      .from('GigDetails as G')
      .innerJoin('CompanyDetails as CD', 'G.companyId', 'CD.companyId')
      .innerJoin('VisibilityDetails as V', 'G.gigId', 'V.gigId')
      .where('G.gigId', payload.gigId)
    const drafts = await this.knexInstance('GigDetails as G')
      .select('G.*')
      .where('G.gigId', payload.gigId)
      .andWhere('G.status', 'draft');
    return [...res, ...drafts];
  }


  async getAll() {
    return await this.knexInstance('GigDetails')
      .select()
      .where('archive', '0');
  }


  async getByEmployerId(payload: GetEmployerId) {
    const res = await this.knexInstance('GigDetails as G')
      .select()
      .join('VisibilityDetails as V', 'G.gigId', 'V.gigId')
      .join('EmployerDetails as E', 'G.postedByEmployerId', 'E.employerId')
      .where('E.employerId', payload.postedByEmployerId)
      .orWhere('G.postedByEmployerId', payload.postedByEmployerId);
    const drafts = await this.knexInstance('GigDetails')
      .select()
      .where('postedByEmployerId', payload.postedByEmployerId)
      .andWhere('status', 'draft');
    return [...res, ...drafts];
  }

  async save(payload: GigDetails): Promise<responseObject> {
    try {
      const [duplicate, foreignKey1, foreignKey2] = await Promise.all([
        this.knexInstance('GigDetails')
          .select()
          .where('gigId', payload.gigId),

        this.knexInstance('CompanyDetails')
          .select()
          .where('companyId', payload.companyId),

        this.knexInstance('EmployerDetails')
          .select()
          .where('employerId', payload.postedByEmployerId)
      ]);

      if (duplicate.length > 0) {
        return duplicateEntry();
      }
      if (foreignKey1.length === 0 || foreignKey2.length === 0) {
        return foreignKeyError();
      }
      await this.knexInstance('GigDetails').insert(payload);
      return response(await this.knexInstance('GigDetails')
        .select()
        .where('gigId', payload.gigId)
        .first());
    } catch (error) {
      throw error;
    }
  }

  async update(payload: GigDetails_PATCH) {
    await this.knexInstance('GigDetails')
      .where('gigId', payload.gigId)
      .andWhere('status', 'draft')
      .update({
        postedByEmployerId: payload.postedByEmployerId,
        ...payload
      });
    return await this.knexInstance('GigDetails')
      .select()
      .where('gigId', payload.gigId);
  }

  async postedByEmployerId(gigId) {
    const result = await this.knexInstance('GigDetails')
      .select('postedByEmployerId')
      .where('gigId', gigId);
    return result[0].postedByEmployerId;
  }

  async remove(payload: GetGigId) {
    return await this.knexInstance('GigDetails')
      .where('gigId', payload.gigId)
      .update({
        archive: '1',
      });
  }

  async updateQuestionaire(payload: UpdateQuestionaire) {
    await this.knexInstance('GigDetails')
      .where('gigId', payload.gigId)
      .andWhere('postedByEmployerId', payload.postedByEmployerId)
      .update('questionaire', payload.questionaire);
    return await this.knexInstance('GigDetails')
      .select('questionaire')
      .where('gigId', payload.gigId);
  }

  async getQuestionaire(payload: GetQuestionaire,) {
    return this.knexInstance('GigDetails')
      .select()
      .where('gigId', payload.gigId)
      .andWhere('postedByEmployerId', payload.postedByEmployerId);
  }

  async uploadFile(filePath: string, gigId: string) {
    await this.knexInstance('GigDetails')
      .where('gigId', gigId)
      .update('fileUpload', filePath);
    return await this.knexInstance('GigDetails')
      .select('fileUpload')
      .where('gigId', gigId);
  }
}

