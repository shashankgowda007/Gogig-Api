import { Knex } from "knex";
import { GigSeeker_GET, GigSeeker_POST, GigSeeker_REMOVE, GigSeeker_UPDATE } from "./types";
import { responseObject } from "src/utils/responseObject";
import { duplicateEntry, response } from "src/utils/responseHandler";

export class GigSeekers {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async get(payload: GigSeeker_GET) {
    await this.updateEarning(payload.gigSeekerId);
    return await this.knexInstance('GigSeekerDetails')
      .select()
      .where('gigSeekerId', payload.gigSeekerId);
  }

  async updateEarning(gigSeekerId: string) {
    const earningsResult = await this.knexInstance('AcceptanceDetails')
      .sum('earned as totalEarned')
      .where('gigSeekerId', gigSeekerId)
      .andWhere('isVerified', 1)
      .andWhere('status', 'completed')
      .first();
    const totalEarnings = earningsResult.totalEarned;
    await this.knexInstance('GigSeekerDetails')
      .where('gigSeekerId', gigSeekerId)
      .update('totalEarned', totalEarnings);
  }

  async save(payload: GigSeeker_POST): Promise<responseObject> {
    try {
      const [duplicate] = await Promise.all([
        this.knexInstance('GigSeekerDetails')
          .select()
          .where('gigSeekerId', payload.gigSeekerId),
      ]);

      if (duplicate.length > 0) {
        return duplicateEntry();
      }
      await this.knexInstance('GigSeekerDetails').insert(payload);
      return response(await this.knexInstance('GigSeekerDetails')
        .select()
        .where('gigSeekerId', payload.gigSeekerId));
    } catch (error) {
      throw error;
    }
  }

  async allColumns() {
    try {
      return Object.keys(await this.knexInstance('GigSeekerDetails').columnInfo());
    } catch (error) {
      throw error;
    }
  }

  async update(payload: GigSeeker_UPDATE) {
    if (payload.email || payload.firstName || payload.lastName || payload.phone) {
      await this.knexInstance('GigSeekerDetails')
        .where('gigSeekerId', payload.gigSeekerId)
        .update('isVerified', 0);
    }
    return await this.knexInstance('GigSeekerDetails')
      .where('gigSeekerId', payload.gigSeekerId)
      .update(payload);
  }


  async remove(payload: GigSeeker_REMOVE) {
    return await this.knexInstance('GigSeekerDetails')
      .where('gigSeekerId', payload.gigSeekerId)
      .delete();
  }

  async seekerProfilePhotoUpload(filePath: string, gigSeekerId: string) {
    await this.knexInstance('GigSeekerDetails')
      .where('gigSeekerId', gigSeekerId)
      .update('profileUrl', filePath);
    return await this.knexInstance('GigSeekerDetails')
      .select('profileUrl')
      .where('gigSeekerId', gigSeekerId);
  }
}