import { Knex } from "knex";
import { duplicateEntry, foreignKeyError, response } from "src/utils/responseHandler";
import { responseObject } from "src/utils/responseObject";
import { Bookmarks, GigSeekerId, BookmarkId } from "./types";

export class Bookmark {
    knexInstance: Knex<any, any[]>;
    constructor(knexInstance: Knex) {
        this.knexInstance = knexInstance;
    }

    async save(payload: Bookmarks): Promise<responseObject> {
        try {
            const [duplicate, foreignKey1, foreignKey2] = await Promise.all([
                this.knexInstance('WishlistGigs')
                    .select()
                    .where('gigId', payload.gigId)
                    .andWhere('userId', payload.userId),

                this.knexInstance('GigSeekerDetails')
                    .select()
                    .where('gigSeekerId', payload.userId),

                this.knexInstance('GigDetails')
                    .select()
                    .where('gigId', payload.gigId),
            ]);

            if (duplicate.length > 0) {
                return duplicateEntry();
            }
            if (foreignKey1.length === 0 || foreignKey2.length === 0) {
                return foreignKeyError();
            }

            await this.knexInstance('WishlistGigs').insert(payload);
            return response(await this.knexInstance('WishlistGigs').select());
        } catch (error) {
            throw error;
        }
    }

    async remove(payload: BookmarkId) {
        return await this.knexInstance('WishlistGigs')
            .where('bookmarkId', payload.bookmarkId)
            .delete();
    }

    async getBookmarksFromUserId(payload: GigSeekerId) {
        return await this.knexInstance('WishlistGigs')
            .select()
            .where('userId', payload.userId);
    }
}
