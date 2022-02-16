import { Collection, Create, query } from 'faunadb';
const q = query;
const { Var, Now, Select, Get, CurrentIdentity, Let } = q;

export function createBoard(title: query.ExprArg, board: query.ExprArg) {
  const FQLStatement = Let(
    {
      newBoard: Create(Collection('bingo_boards'), {
        data: {
          title: title,
          author: Select(['data', 'id'], Get(CurrentIdentity())),
          board: board,
          // we will order by creation time, we already have 'ts' by default but updated will also update 'ts'.
          created: Now(),
        },
      }),
    },
    Var('newBoard'),
  );

  return FQLStatement;
}
