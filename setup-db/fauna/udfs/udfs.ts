import { query } from 'faunadb';
import { createBoard } from '../queries/boards';
const q = query;
const { Var, Query, Lambda, Exists, If, Update, Select, Get, CreateFunction, Role, CurrentIdentity } = q;

// A convenience function to either create or update a function.
type UDF = {
  name: query.ExprArg;
  body: query.ExprArg;
  role: query.ExprArg;
};

function CreateOrUpdateFunction(obj: UDF) {
  return If(
    Exists(q.Function(obj.name)),
    Update(q.Function(obj.name), { body: obj.body, role: obj.role }),
    CreateFunction({ name: obj.name, body: obj.body, role: obj.role }),
  );
}

export const createBoardUDF = CreateOrUpdateFunction({
  name: 'create_board',
  body: Query(Lambda(['title', 'board'], createBoard(Var('title'), Var('board')))),
  role: Role('Role_User_Bingo_Boards'),
});
