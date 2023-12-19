import { Knex } from 'knex';
import { GigSeekerId, GigSeekerIdFileName, UserDocument } from './types';

class FileAttachment {
    knexInstance: Knex<any, any[]>;
    constructor(knexInstance: Knex) {
        this.knexInstance = knexInstance;
    }

    async getFilesByGigSeekerId(payload: GigSeekerId) {
        return await this.knexInstance('FileAttachment')
            .select('filePath')
            .where('gigSeekerId', payload.gigSeekerId);
    }

    async getByName(payload: GigSeekerIdFileName) {
        return await this.knexInstance('FileAttachment')
            .select('filePath')
            .where('gigSeekerId', payload.gigSeekerId)
            .andWhere('fileName', 'like', `%${payload.fileName}%`);
    }

    async uploadFile(payload: UserDocument) {
        await this.knexInstance('FileAttachment').insert(payload);
        return await this.knexInstance('FileAttachment')
            .select()
            .where('fileId', payload.fileId);
    }

    async createTableFromFile(tableName: string) {
        return await this.knexInstance.schema.hasTable(tableName)
            .then(async (exists) => {
                if (exists) {
                    return true;
                } else {
                    await this.knexInstance.schema.createTable(tableName, (table) => {
                        table.string('gigId', 50);
                        table.string('vendorId', 50).primary();
                        table.json('vendorInformation');
                        table.enum('assignmentStatus', ['assigned', 'unassigned', 'success', 'marked', 'failed']).defaultTo('unassigned');
                        table.timestamp('createdAt').defaultTo(this.knexInstance.fn.now());
                        table.specificType('updatedAt', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
                        table.string('gigSeekerId', 50).defaultTo(null);
                        table.enu('callStatus', ['busy', 'unreachable', 'invalid', 'be right back', 'success', 'not attempted']).defaultTo('not attempted');
                        table.integer('retry').defaultTo(0);
                        table.json('questionaireResponse');
                        table.tinyint('isAnswerInvalid').defaultTo(null);
                        table.foreign('gigSeekerId').references('GigSeekerDetails.gigSeekerId');
                    });
                    return false;
                }
            })
    }

    async modifyClientTable(tableName: string, columns: string[]) {
        await this.knexInstance.schema.alterTable(tableName, (table: Knex.AlterTableBuilder) => {
            columns.forEach((columnName) => {
                table.string(columnName, 100).defaultTo('null');
            });
        })
    }

    async getColumnNames(tableName: string) {
        return await this.knexInstance.raw(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`, [tableName])
            .then((result) => {
                const columnNames = result[0].map((row) => row.COLUMN_NAME);
                return columnNames;
            });
    }

    async insertData(tableName: string, results: any) {
        await this.knexInstance(tableName).insert(results);
        return await this.knexInstance(tableName).select();
    }

    async removecsv(gigId: string) {
        await this.knexInstance('ClientList')
            .where('gigId', gigId)
            .delete();
    }

    async updateTotalVendors(gigId: string) {
        const totalNumberOfVendorsResult = await this.knexInstance('VendorDetails')
            .count('* as count')
            .where('gigId', gigId)
            .first();
        await this.knexInstance('GigDetails')
            .where('gigId', gigId)
            .update('totalVendors', totalNumberOfVendorsResult.count);
    }
}

export default FileAttachment;