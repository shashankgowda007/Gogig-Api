import { Knex } from "knex";
import { WalletCreds, WalletCredsUpdate } from "./types";
import { duplicateEntry, foreignKeyError } from "src/utils/responseHandler";

export class Wallet {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async getTransactions(gigSeekerId: string) {
    const [transactions, totalEarnedResult] = await Promise.all([
      this.knexInstance('AcceptanceDetails as AD')
        .select(
          'AD.*',
          'GD.gigID',
          'GD.gigTitle',
          'GD.gigStartDate',
          'GD.gigEndDate',
        )
        .where('AD.gigSeekerId', gigSeekerId)
        .andWhere('AD.isVerified', 1)
        .andWhere('AD.status', 'completed')
        .join('VisibilityDetails as VD', 'VD.visibilityId', 'AD.visibilityId')
        .join('GigDetails as GD', 'GD.gigId', 'VD.gigId'),

      this.knexInstance('AcceptanceDetails')
        .sum('earned as totalEarned')
        .where('gigSeekerId', gigSeekerId)
        .andWhere('isVerified', 1)
        .andWhere('status', 'completed')
        .first(),

    ])

    const totalEarnings = totalEarnedResult.totalEarned;
    await this.knexInstance('GigSeekerDetails')
      .where('gigSeekerId', gigSeekerId)
      .update('totalEarned', totalEarnings);
    return {
      transactions,
      totalEarnings
    }
  }

  async saveWalletCreds(payload: WalletCreds) {
    const [duplicate, foreignKey] = await Promise.all([
      this.knexInstance('WalletCredentials')
        .select()
        .where('userId', payload.userId),

      this.knexInstance('GigSeekerDetails')
        .select()
        .where('gigSeekerId', payload.userId),
    ]);

    if (duplicate.length > 0) {
      return duplicateEntry();
    }
    if (foreignKey.length === 0) {
      return foreignKeyError();
    }
    await this.knexInstance('WalletCredentials')
      .insert(payload);
  }

  async getWalletCreds(userId: string) {
    return await this.knexInstance('WalletCredentials')
      .select()
      .where('userId', userId);
  }

  async updateWalletCreds(userId: string, payload: WalletCredsUpdate) {
    await this.knexInstance('WalletCredentials')
      .where('userId', userId)
      .update(payload);
  }

  async requestWithdrawal(payload) {
    await this.knexInstance('Transactions').insert(payload);
  }

  async getAllWithdrawal(userId: string) {
    return await this.knexInstance('Transactions')
      .select()
      .where('gigSeekerId', userId)
      .andWhere('isVerified', 1);
  }
}