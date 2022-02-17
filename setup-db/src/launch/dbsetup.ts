import faunadb from 'faunadb';
import { createCollections } from '../fauna/collections/collections.js';
import {
  CreateRoleUserBingoBoards,
  CreateRoleFunctionBingoBoards,
  UpdateRoleFunctionBingoBoards,
  UpdateRoleUserBingoBoards,
} from '../fauna/roles/boardRole.js';
import { createBoardUDF } from '../fauna/udfs/udfs.js';
import { handleSetupError } from '../fauna/utils/utils.js';

async function setupFaunaDB(key: string) {
  const admin = new faunadb.Client({
    secret: key as string,
  });
  const promises = [
    /** Create All Indexes & Collections First */
    await handleSetupError(admin.query(createCollections(admin)), 'collections'),
    /* Create Roles Second */
    await handleSetupError(admin.query(CreateRoleFunctionBingoBoards), 'Role Function Bingo Boards'),
    await handleSetupError(admin.query(CreateRoleUserBingoBoards), 'Role Users Bingo Boards'),
    /** Create UDFs */
    await handleSetupError(admin.query(createBoardUDF), 'create_board UDF'),
    /* Update Roles Last To Attach To Valid Documents / Collections / Indexes/ UDFs with Memberships & Priveleges */
    await handleSetupError(admin.query(UpdateRoleFunctionBingoBoards), 'Update Role Function Bingo Board'),
    await handleSetupError(admin.query(UpdateRoleUserBingoBoards), 'Update Role Users Bingo Board'),
  ];
  return await Promise.allSettled(promises);
}

export default setupFaunaDB;
