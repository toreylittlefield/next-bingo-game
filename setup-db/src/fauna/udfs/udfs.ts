import faunadb from 'faunadb';
import { accountsCollection } from '../collections/collectionnames.js';
import { LoginAccount } from '../functions/login.js';
import {
  ACCESS_TOKEN_LIFETIME_SECONDS,
  CreateAccessAndRefreshToken,
  CreateAccessTokenWithRefreshToken,
  REFRESH_TOKEN_LIFETIME_SECONDS,
} from '../functions/tokens.js';
import { createBoard, createUser, deleteBoard, readAllBoards, updateBoard, UpdateUser } from '../queries/boards.js';
import { functionsBingoBoardsRole, serverAccountRole } from '../roles/rolenames.js';
import {
  createBoardUDFname,
  createUserUDFname,
  deleteBoardUDFname,
  loginAccountUDFname,
  logoutAndDeleteTokensAccountUDFname,
  readBoardUDFname,
  createRefreshAndAccessTokenUDFname,
  registerAccountUDFname,
  updateBoardUDFname,
  updateUserUDFname,
  createAccessTokenWithRefreshTokenUDFName,
} from './udfnames.js';
const q = faunadb.query;
const {
  Create,
  Collection,
  Var,
  Query,
  Lambda,
  Exists,
  If,
  Update,
  Logout,
  Select,
  Get,
  CreateFunction,
  Role,
  CurrentIdentity,
  Let,
  Call,
} = q;

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

/** REFRESH & ACCESS TOKEN */
export const createAccessTokenWithRefreshTokenUDF = CreateOrUpdateFunction({
  name: createAccessTokenWithRefreshTokenUDFName.name,
  body: Query(
    Lambda(['refresh_token'], {
      tokens: CreateAccessTokenWithRefreshToken(
        Var('refresh_token'),
        CurrentIdentity(),
        ACCESS_TOKEN_LIFETIME_SECONDS,
        REFRESH_TOKEN_LIFETIME_SECONDS
      ),
      account: Get(CurrentIdentity()),
    })
  ),
  role: serverAccountRole.name,
  // only the server can create the account & user
});

export const createRefreshAndAccessTokenUDF = CreateOrUpdateFunction({
  name: createRefreshAndAccessTokenUDFname.name,
  body: Query(
    Lambda([], {
      tokens: CreateAccessAndRefreshToken(
        CurrentIdentity(),
        ACCESS_TOKEN_LIFETIME_SECONDS,
        REFRESH_TOKEN_LIFETIME_SECONDS
      ),
      account: Get(CurrentIdentity()),
    })
  ),
  role: serverAccountRole.name,
  // only the server can create the account & user
});

/** CREATE | REGISTER ACCOUNT */
export const registerCreateAccountUDF = CreateOrUpdateFunction({
  name: registerAccountUDFname.name,
  body: Query(
    Lambda(
      ['id', 'password', 'name', 'alias', 'icon'],
      Let(
        {
          userRef: Call(q.Function(createUserUDFname.name), [Var('name'), Var('alias'), Var('icon')]),
          user: Select(['ref'], Var('userRef')),
          id: Var('id'),
          accountRef: Create(Collection(accountsCollection.name), {
            credentials: {
              password: Var('password'),
            },
            data: {
              id: Var('id'),
              user: Var('user'),
            },
          }),
          account: Select(['ref'], Var('accountRef')),
          login: Call(q.Function(loginAccountUDFname.name), [Var('id'), Var('password')]),
        },
        Var('login')
      )
    )
  ),
  role: serverAccountRole.name,
});

/** LOGIN ACCOUNT & CREATE USER */
export const loginAccountAndCreateUserUDF = CreateOrUpdateFunction({
  name: loginAccountUDFname.name,
  body: Query(Lambda(['id', 'password'], LoginAccount(Var('id'), Var('password')))),
  role: serverAccountRole.name,
});

//** LOGOUT ACCOUNT & DELETE TOKENS */
export const logoutDeleteTokensAccountUDF = CreateOrUpdateFunction({
  name: logoutAndDeleteTokensAccountUDFname.name,
  body: Query(Lambda(['all'], Logout(Var('all')))),
  role: serverAccountRole.name,
});

/** USER MANIPULATION */
export const createUserUDF = CreateOrUpdateFunction({
  name: createUserUDFname.name,
  body: Query(Lambda(['name', 'alias', 'icon'], createUser(Var('name'), Var('alias'), Var('icon')))),
  role: serverAccountRole.name,
  // only the server can create the account & user
});

export const updateUserUDF = CreateOrUpdateFunction({
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
