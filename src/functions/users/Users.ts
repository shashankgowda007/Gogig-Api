import { Knex } from "knex";
import { users } from "./types";

export class Users {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }

  async save(payload: users)  {
    try {
      await this.knexInstance('Users').insert(payload)
    }
    catch (error) {
      throw error;
    }
  }

  async get(userId: string) {
    try {
      return await this.knexInstance('Users')
        .select()
        .where('userId', userId)
    } catch (error) {
      throw error;
    }
  }
}