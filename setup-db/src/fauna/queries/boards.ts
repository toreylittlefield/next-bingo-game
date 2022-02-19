import faunadb from 'faunadb';
import { bingoBoardCollections, usersCollection } from '../collections/collectionnames.js';
const q = faunadb.query;
const { Var, Ref, Now, Select, Get, Delete, CurrentIdentity, Let, Create, Collection, Update, Paginate, Documents } = q;

export function createAccount() {}

/** USER FUNCTIONS */
export function createUser(name: faunadb.Expr, alias: faunadb.Expr, icon: faunadb.Expr): faunadb.Expr {
  const FQLStatement = Let(
    {
      // accountRef: CurrentIdentity(),
      // userRef: Select(['data', 'user'], Get(Var('accountRef'))),
      createUser: Create(Collection(usersCollection.name), {
        data: {
          name: name,
          alias: alias,
          icon: icon,
        },
      }),
    },
    Var('createUser')
  );
  return FQLStatement;
}

export function UpdateUser(name: faunadb.Expr, alias: faunadb.Expr, icon: faunadb.Expr): faunadb.Expr {
  const FQLStatement = Let(
    {
      accountRef: CurrentIdentity(),
      userRef: Select(['data', 'user'], Get(Var('accountRef'))),
      updateUser: Update(Var('userRef'), {
        data: {
          name: name,
          alias: alias,
          icon: icon,
        },
      }),
    },
    Var('updateUser')
  );
  return FQLStatement;
}
/** -----> END USER FUNCTIONS */

/** Boards Functions */
export function createBoard(title: faunadb.ExprArg, board: faunadb.ExprArg) {
  const FQLStatement = Let(
    {
      accountRef: CurrentIdentity(),
      userRef: Select(['data', 'user'], Get(Var('accountRef'))),
      newBoard: Create(Collection(bingoBoardCollections.name), {
        data: {
          title: title,
          author: Var('userRef'),
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

/** update board */
export function updateBoard(title: faunadb.ExprArg, board: faunadb.ExprArg) {
  const FQLStatement = Let(
    {
      accountRef: CurrentIdentity(),
      userRef: Select(['data', 'user'], Get(Var('accountRef'))),
      newBoard: Update(Collection(bingoBoardCollections.name), {
        data: {
          title: title,
          author: Var('userRef'),
          board: board,
          // we will order by creation time, we already have 'ts' by default but updated will also update 'ts'.
        },
      }),
    },
    Var('newBoard')
  );

  return FQLStatement;
}

/** read board */
export function readAllBoards(title: faunadb.ExprArg) {
  const FQLStatement = Let(
    {
      AllBoards: Paginate(Documents(Collection(bingoBoardCollections.name))),
    },
    Var('AllBoards')
  );

  return FQLStatement;
}

/** delete board */
export function deleteBoard(ref: faunadb.ExprArg) {
  const FQLStatement = Let(
    {
      DeleteBoard: Delete(Ref(Collection(bingoBoardCollections.name), ref)),
    },
    Var('DeleteBoard')
  );

  return FQLStatement;
}
