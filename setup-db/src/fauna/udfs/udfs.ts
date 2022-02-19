import faunadb from 'faunadb';
import { createBoard, createUser, deleteBoard, readAllBoards, updateBoard, UpdateUser } from '../queries/boards.js';
import { functionsBingoBoardsRole, serverAccountRole } from '../roles/rolenames.js';
import {
  createBoardUDFname,
  createUserUDFname,
  deleteBoardUDFname,
  readBoardUDFname,
  updateBoardUDFname,
  updateUserUDFname,
} from './udfnames.js';
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

/** USER MANIPULATION */
export const createUserUDF = CreateFunction({
  name: createUserUDFname.name,
  body: Query(Lambda(['name', 'alias', 'icon'], createUser(Var('name'), Var('alias'), Var('icon')))),
  role: serverAccountRole.name,
  // only the server can create the account & user
});

export const updateUserUDF = CreateFunction({
  name: updateUserUDFname.name,
  body: Query(Lambda(['name', 'alias', 'icon'], UpdateUser(Var('name'), Var('alias'), Var('icon')))),
  role: Role(functionsBingoBoardsRole.name),
});

/** -----> END USER MANIPULATION */

/** BOARDS MANIPULATION */
export const createBoardUDF = CreateOrUpdateFunction({
  name: createBoardUDFname.name,
  body: Query(Lambda(['title', 'board'], createBoard(Var('title'), Var('board')))),
  role: Role(functionsBingoBoardsRole.name),
});

/** Paginates all boards from the collection */
export const readBoardUDF = CreateOrUpdateFunction({
  name: readBoardUDFname.name,
  body: Query(Lambda(['ref'], readAllBoards(Var('title')))),
  role: Role(functionsBingoBoardsRole.name),
});

export const updateBoardUDF = CreateOrUpdateFunction({
  name: updateBoardUDFname.name,
  body: Query(Lambda(['title', 'board'], updateBoard(Var('title'), Var('board')))),
  role: Role(functionsBingoBoardsRole.name),
});
export const deleteBoardUDF = CreateOrUpdateFunction({
  name: deleteBoardUDFname.name,
  body: Query(Lambda(['ref'], deleteBoard(Var('ref')))),
  role: Role(functionsBingoBoardsRole.name),
});
