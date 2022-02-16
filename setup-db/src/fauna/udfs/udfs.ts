import faunadb from 'faunadb';
import { createBoard } from '../queries/boards.js';
import { functionsBingoBoardsRole } from '../roles/rolenames.js';
import { createBoardUDFname } from './udfnames.js';
const q = faunadb.query;
const { Var, Query, Lambda, Exists, If, Update, Select, Get, CreateFunction, Role, CurrentIdentity } = q;

// A convenience function to either create or update a function.
type UDF = {
  name: faunadb.ExprArg;
  body: faunadb.ExprArg;
  role?: faunadb.ExprArg;
};

function CreateOrUpdateFunction(obj: UDF) {
  return If(
    Exists(q.Function(obj.name)),
    Update(q.Function(obj.name), { body: obj.body, role: obj.role }),
    CreateFunction({ name: obj.name, body: obj.body, role: obj.role })
  );
}

export const createBoardUDF = CreateOrUpdateFunction({
  name: createBoardUDFname.name,
  body: Query(Lambda(['title', 'board'], createBoard(Var('title'), Var('board')))),
  role: Role(functionsBingoBoardsRole.name),
});
