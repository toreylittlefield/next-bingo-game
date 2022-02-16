import faunadb from 'faunadb';
import { bingoBoardCollections } from '../collections/collectionnames.js';
const q = faunadb.query;
const { Var, Now, Select, Get, CurrentIdentity, Let, Create, Collection } = q;

export function createBoard(title: faunadb.ExprArg, board: faunadb.ExprArg) {
  const FQLStatement = Let(
    {
      newBoard: Create(Collection(bingoBoardCollections.name), {
        data: {
          title: title,
          author: Select(['data', 'id'], Get(CurrentIdentity())),
          board: board,
          // we will order by creation time, we already have 'ts' by default but updated will also update 'ts'.
          created: Now(),
        },
      }),
    },
    Var('newBoard')
  );

  return FQLStatement;
}
