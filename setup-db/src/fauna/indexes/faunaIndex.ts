import faunadb from 'faunadb';
import { bingoBoardCollections } from '../collections/collectionnames.js';
import { indexAllBingoBoardsByRef } from './faunaIndexesNames.js';

const q = faunadb.query;

const { Collection, CreateIndex } = q;

/* Indexes */
export const CreateIndexAllBingoBoards = CreateIndex({
  name: indexAllBingoBoardsByRef.name,
  source: Collection(bingoBoardCollections.name),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  values: [
    // By including the 'created' we order them by time.
    // We could have used ts but that would have updated by 'updated' time instead.
    {
      field: ['data', 'created'],
      reverse: true,
    },
    {
      field: ['ref'],
    },
  ],
  // We'll be using these indexes in the logic of our application so it's safer to set serialized to true
  // That way reads will always reflect the previous writes.
  serialized: true,
});
