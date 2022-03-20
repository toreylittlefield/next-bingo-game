import faunadb from 'faunadb';
import { bingoBoardCollections, usersCollection } from '../collections/collectionnames.js';
const q = faunadb.query;
const {
  IsBoolean,
  ToDate,
  Or,
  TimeDiff,
  TimeAdd,
  TimeSubtract,
  If,
  LT,
  Var,
  Ref,
  Now,
  Select,
  Get,
  Delete,
  CurrentIdentity,
  Let,
  Create,
  Collection,
  Update,
  Paginate,
  Documents,
} = q;

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
          lastUpdated: false,
        },
      }),
    },
    Var('createUser')
  );
  return FQLStatement;
}

export function UpdateUser(name: faunadb.Expr, alias: faunadb.Expr, icon: faunadb.Expr): faunadb.Expr {
  const FQLStatementUpdate = Let(
    {
      userRef: Ref(Collection('users'), '326203504610771537'),
      userProfile: Get(Var('userRef')),
      lastUpdated: Select(['data', 'lastUpdated'], Var('userProfile')),
      isBool: IsBoolean(Var('lastUpdated')),
      nowDate: ToDate(TimeAdd(Now(), 0, 'days')),
      fakeUserDate: ToDate(TimeSubtract(Now(), 0, 'days')),
      compareDates: TimeDiff(If(Var('isBool'), Var('fakeUserDate'), ToDate(Var('lastUpdated'))), Var('nowDate'), 'day'),
    },
    {
      result: If(
        Or(Var('isBool'), LT(120, Var('compareDates'))),
        Update(Var('userRef'), {
          data: {
            lastUpdated: ToDate(Now()),
          },
        }),
        false
      ),
      compareDates: Var('compareDates'),
    }
  );
  const FQLStatement = Let(
    {
      accountRef: CurrentIdentity(),
      userRef: Select(['data', 'user'], Get(Var('accountRef'))),
      updateUser: Update(Var('userRef'), {
        data: {
          name: name,
          alias: alias,
          icon: icon,
          lastUpdated: ToDate(Now()),
        },
      }),
    },
    Var('updateUser')
  );
  return FQLStatementUpdate;
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
