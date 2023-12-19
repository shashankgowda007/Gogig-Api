import { Knex } from "knex";
import {UserQuery } from "./types";
export class UserHelp {
  knexInstance: Knex<any, any[]>;
  constructor(knexInstance: Knex) {
    this.knexInstance = knexInstance;
  }
  
  async addUserQuery(payload: UserQuery) {
    return await this.knexInstance('QueryHistory').insert(payload);
}
}