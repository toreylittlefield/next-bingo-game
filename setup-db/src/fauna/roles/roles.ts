import faunadb from 'faunadb';
import { accountsCollection, bingoBoardCollections, usersCollection } from '../collections/collectionnames.js';
import { indexAllBingoBoardsByRef } from '../indexes/faunaIndexesNames.js';
import {
  createBoardUDFname,
  createUserUDFname,
  deleteBoardUDFname,
  readBoardUDFname,
  updateBoardUDFname,
  updateUserUDFname,
} from '../udfs/udfnames.js';
import { functionsBingoBoardsRole, accountsBingoBoardRole } from './rolenames.js';
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
  Call,
  Abort,
} = q;

type Privileges = {
  resource: faunadb.Expr;
  actions?: {
    call?: boolean;
    read?: true | faunadb.Expr;
    write?: true | faunadb.Expr;
    create?: true | faunadb.Expr;
    delete?: true | faunadb.Expr;
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

/** FOR THE ACCOUNTS COLLECTION */
const ROLE_ACCOUNTS_BINGO_BOARDS: RoleType = {
  name: accountsBingoBoardRole.name,
  membership: [{ resource: Collection(accountsCollection.name) }],
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

export const CreateRoleAccountsBingoBoards = CreateOrUpdateRole({
  ...ROLE_ACCOUNTS_BINGO_BOARDS,
});

export const UpdateRoleUserBingoBoards = CreateOrUpdateRole({
  ...ROLE_ACCOUNTS_BINGO_BOARDS,
  privileges: [
    /** ALLOW THE ACCOUNTS COLLECTION TO CALL UDFs */
    /** UDFS for USERs */
    {
      resource: q.Function(createUserUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(updateUserUDFname.name),
      actions: {
        call: true,
      },
    },
    // UDFs For BOARDS
    {
      resource: q.Function(readBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(createBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(updateBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(deleteBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    /** END --> ALLOW THE ACCOUNTS COLLECTION TO CALL UDFs */

    // ------To Update profiles -------
    // Updating profiles was deliberately done via roles as an example
    // But could just as well be placed in a UDF and rely on CurrentIdentity()
    {
      // First we will get the users via the account so we need to be able
      // to get the account (which we will get via CurrentIdentity())
      resource: Collection(accountsCollection.name),
      actions: {
        // A read privilege function receives the reference that is to be read!
        read: Query(Lambda('ref', Equals(CurrentIdentity(), Var('ref')))),
      },
    },
    {
      resource: Collection(usersCollection.name),
      actions: {
        // Write only allows updates, not the creation of users.
        // When we insert a function in the write privilege we receive the actual objects
        // instead of the references. We receive both old as new data which we can use in the role to
        // validate whether the user is allowed to update it.
        write: Query(
          Lambda(
            ['oldData', 'newData', 'ref'],
            // If the reference we try to update is the same user
            // that belongs to the account that does this call, we let it through!
            Let(
              {
                // the reference of the user that tries to access
                // (retrieved via the account ref that comes out of CurrentIdentity())
                loggedInUserRef: Select(['data', 'user'], Get(CurrentIdentity())),
                name: Select(['newData', 'name'], Var('newData')),
                alias: Select(['newData', 'alias'], Var('newData')),
                icon: Select(['newData', 'icon'], Var('newData')),
              },
              If(Equals(Var('loggedInUserRef'), Var('ref')), Call(updateUserUDFname.name), [
                Var('name'),
                Var('alias'),
                Var('icon'),
                Abort('Wrong Identity Or Does Not Exist'),
              ])
            )
          )
        ),
      },
    },
  ],
});

export const UpdateRoleFunctionBingoBoards = CreateOrUpdateRole({
  ...ROLE_FUNCTIONS_BINGO_BOARDS,
  privileges: [
    {
      resource: Collection(accountsCollection.name),
      actions: {
        read: true,
      },
    },
    {
      resource: Collection(usersCollection.name),
      actions: {
        read: true,
        write: true,
        create: true,
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
    // UDFs for the USERS
    {
      resource: q.Function(createUserUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(updateUserUDFname.name),
      actions: {
        call: true,
      },
    },
    // UDFs to for manipulating the BOARDS
    {
      resource: q.Function(createBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(readBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(updateBoardUDFname.name),
      actions: {
        call: true,
      },
    },
    {
      resource: q.Function(deleteBoardUDFname.name),
      actions: {
        call: true,
      },
    },
  ],
});
