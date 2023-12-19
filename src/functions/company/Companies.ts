import { Knex } from "knex";
import { CompanyDetails, CreatedById, CompanyDetailsUpdate } from "./types";
import { duplicateEntry, response } from "src/utils/responseHandler";
import { responseObject } from "src/utils/responseObject";

export class Companies {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async save(payload: CompanyDetails): Promise<responseObject> {
    try {
      const duplicate = await this.knexInstance('CompanyDetails')
        .select()
        .where('companyId', payload.companyId);

      if (duplicate.length > 0) {
        return duplicateEntry();
      }

      await this.knexInstance('CompanyDetails').insert(payload);
      return response(await this.knexInstance('CompanyDetails')
        .select()
        .where('companyId', payload.companyId));
    } catch (error) {
      throw error;
    }
  }

  async get(payload: CreatedById) {
    return await this.knexInstance('CompanyDetails')
      .select()
      .where('createdBy', payload.createdBy);
  }

  async update(payload: CompanyDetailsUpdate) {
    if (payload.companyName || payload.contactEmail || payload.contactNumber) {
      await this.knexInstance('CompanyDetails')
        .where('companyId', payload.companyId)
        .update('isVerified', 0);
    }
    const { companyId, ...updateData } = payload;
    return await this.knexInstance('CompanyDetails')
      .where('createdBy', payload.createdBy)
      .andWhere('companyId', payload.companyId)
      .update(updateData);
  }

  async logoUpload(filePath: string, companyId: string) {
    await this.knexInstance('CompanyDetails')
      .where('companyId', companyId)
      .update('companyLogo', filePath);
    return await this.knexInstance('CompanyDetails')
      .where('companyId', companyId)
      .select('companyLogo');
  }
}