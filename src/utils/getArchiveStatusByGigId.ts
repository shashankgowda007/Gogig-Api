import { Knex } from 'knex';

export const getArchiveStatusByGigId = async (knexInstance: Knex, gigId: string): Promise<number | null> => {
    try {
      const result = await knexInstance('Gig')
        .where('gigId', gigId)
        .select('archive')
        .first(); // Retrieve the first result (assuming gigId is unique)
  
      if (result) {
        return result.archive;
      } else {
        return null; // No matching gigId found
      }
    } catch (error) {
      throw error; // Propagate the error to the caller
    }
  }
  