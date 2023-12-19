import { Knex } from "knex";
import { EmployerDetails, EmployerId, EmployerDetailsUpdate } from "./types";
import { duplicateEntry, foreignKeyError, response } from "src/utils/responseHandler";
import { responseObject } from "src/utils/responseObject";

export class Employers {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async save(payload: EmployerDetails): Promise<responseObject> {
    try {
      let CompanyIdResult = await this.knexInstance('CompanyDetails')
        .select('companyId')
        .where('createdBy', payload.employerId);
      let companyId: string = CompanyIdResult[0].companyId;
      payload.companyId = companyId;
      const [duplicate, foreignKey1] = await Promise.all([
        this.knexInstance('EmployerDetails')
          .select()
          .where('employerId', payload.employerId),

        this.knexInstance('CompanyDetails')
          .select()
          .where('companyId', payload.companyId),

      ]);

      if (duplicate.length > 0) {
        return duplicateEntry();
      }
      if (foreignKey1.length === 0) {
        return foreignKeyError();
      }

      await this.knexInstance('EmployerDetails').insert(payload);
      return response(await this.knexInstance('EmployerDetails')
        .select()
        .where('employerId', payload.employerId));
    } catch (error) {
      throw error;
    }
  }

  async get(payload: EmployerId) {
    return await this.knexInstance('EmployerDetails')
      .select()
      .where('employerId', payload.employerId);
  }

  async update(payload: EmployerDetailsUpdate) {
    if (payload.emailId || payload.name || payload.phoneNumber) {
      await this.knexInstance('EmployerDetails')
        .where('employerId', payload.employerId)
        .update('isVerified', 0);
    }
    const { employerId, ...updateData } = payload;
    return this.knexInstance('EmployerDetails')
      .where('employerId', payload.employerId)
      .update(updateData);
  }
}