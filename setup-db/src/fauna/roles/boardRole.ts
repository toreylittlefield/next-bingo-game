import faunadb from 'faunadb';
import { bingoBoardCollections, usersCollection } from '../collections/collectionnames.js';
import { indexAllBingoBoardsByRef } from '../indexes/faunaIndexesNames.js';
import { createBoardUDFname } from '../udfs/udfnames.js';
import { functionsBingoBoardsRole, userBingoBoardRole } from './rolenames.js';
const q = faunadb.query;
const {
  Select,
  Indexes,
  Collections,
  CreateRole,
  Paginate,
  Roles,
  Role,
  Lambda,
  Delete,
  Var,
  Collection,
  Index,
  If,
  Exists,
  Update,
  Union,
  Query,
  Let,
  CurrentIdentity,
  Equals,
  Get,
} = q;

type Privileges = {
  resource: faunadb.Expr;
  actions?: {
    call?: boolean;
    read?: true;
    write?: true;
    create?: true;
    delete?: true;
  };
};

type RoleType = {
  name: faunadb.ExprArg;
  membership: faunadb.ExprArg[];
  privileges: Privileges[];
};

const ROLE_FUNCTIONS_BINGO_BOARDS: RoleType = {
  name: functionsBingoBoardsRole.name,
  membership: [],
  privileges: [],
};
const ROLE_USER_BINGO_BOARDS: RoleType = {
  name: userBingoBoardRole.name,
  membership: [{ resource: Collection(usersCollection.name) }],
  privileges: [],
};

// A convenience function to either create or update a role.
function CreateOrUpdateRole(obj: RoleType) {
  return If(
    Exists(Role(obj.name)),
    Update(Role(obj.name), { membership: obj.membership, privileges: obj.privileges }),
    CreateRole(obj)
  );
}

export const CreateRoleFunctionBingoBoards = CreateOrUpdateRole({
  ...ROLE_FUNCTIONS_BINGO_BOARDS,
});

export const CreateRoleUserBingoBoards = CreateOrUpdateRole({
  ...ROLE_USER_BINGO_BOARDS,
});

export const UpdateRoleUserBingoBoards = CreateOrUpdateRole({
  ...ROLE_USER_BINGO_BOARDS,
  privileges: [
    {
      resource: q.Function(createBoardUDFname.name),
      actions: {
        call: true,
      },
    },
  ],
});
export const UpdateRoleFunctionBingoBoards = CreateOrUpdateRole({
  ...ROLE_FUNCTIONS_BINGO_BOARDS,
  privileges: [
    {
      resource: Collection(usersCollection.name),
      actions: {
        read: true,
      },
    },
    {
      resource: Collection(bingoBoardCollections.name),
      actions: {
        read: true,
        write: true,
        create: true,
        delete: true,
      },
    },
    {
      resource: Index(indexAllBingoBoardsByRef.name),
      actions: {
        read: true,
      },
    },
    {
      resource: q.Function(createBoardUDFname.name),
      actions: {
        call: true,
      },
    },
  ],
});
