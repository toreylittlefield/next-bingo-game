import { Expr, query } from 'faunadb';
const q = query;
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
  resource: Expr;
  actions: {
    call: boolean;
  };
};

type RoleType = {
  name: query.ExprArg;
  membership?: query.ExprArg[];
  privileges: Privileges[];
};

// A convenience function to either create or update a role.
function CreateOrUpdateRole(obj: RoleType) {
  return If(
    Exists(Role(obj.name)),
    Update(Role(obj.name), { membership: obj.membership, privileges: obj.privileges }),
    CreateRole(obj),
  );
}

export const CreateRoleUserBingoBoards = CreateOrUpdateRole({
  name: 'Role_User_Bingo_Boards',
  membership: [{ resource: Collection('users') }],
  privileges: [
    {
      resource: q.Function('create_board'),
      actions: {
        call: true,
      },
    },
  ],
});
