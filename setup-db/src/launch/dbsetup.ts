import faunadb from 'faunadb';
import { createCollections } from '../fauna/collections/collections.js';
import {
  CreateRoleAccountsBingoBoards,
  CreateRoleFunctionBingoBoards,
  UpdateRoleFunctionBingoBoards,
  UpdateRoleUserBingoBoards,
} from '../fauna/roles/roles.js';
import {
  createBoardUDF,
  createUserUDF,
  deleteBoardUDF,
  readBoardUDF,
  updateBoardUDF,
  updateUserUDF,
} from '../fauna/udfs/udfs.js';
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
    await handleSetupError(admin.query(CreateRoleAccountsBingoBoards), 'Role Users Bingo Boards'),
    /** Create UDFs */
    // user udfs
    await handleSetupError(admin.query(createUserUDF), 'create_user UDF'),
    await handleSetupError(admin.query(updateUserUDF), 'update_user UDF'),
    // board udfs
    await handleSetupError(admin.query(createBoardUDF), 'create_board UDF'),
    await handleSetupError(admin.query(readBoardUDF), 'read_board UDF'),
    await handleSetupError(admin.query(updateBoardUDF), 'update_board UDF'),
    await handleSetupError(admin.query(deleteBoardUDF), 'delete_board UDF'),
    /** ------> END Create UDFs */
    /* Update Roles Last To Attach To Valid Documents / Collections / Indexes/ UDFs with Memberships & Priveleges */
    await handleSetupError(admin.query(UpdateRoleFunctionBingoBoards), 'Update Role Function Bingo Board'),
    await handleSetupError(admin.query(UpdateRoleUserBingoBoards), 'Update Role Users Bingo Board'),
  ];
  return await Promise.allSettled(promises);
}

export default setupFaunaDB;
