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

const q = faunadb.query;

async function setupFaunaDB(key: string) {
  const admin = new faunadb.Client({
    secret: key as string,
  });
  const promises = [
    await handleSetupError(admin.query(createCollections(admin)), 'collections'),
    await handleSetupError(admin.query(CreateRoleFunctionBingoBoards), 'Role Bingo Boards'),
    await handleSetupError(admin.query(CreateRoleUserBingoBoards), 'Role Bingo Boards'),
    await handleSetupError(admin.query(createBoardUDF), 'create_board UDF'),
    await handleSetupError(admin.query(UpdateRoleFunctionBingoBoards), 'create_board UDF'),
    await handleSetupError(admin.query(UpdateRoleUserBingoBoards), 'create_board UDF'),
  ];
  return await Promise.allSettled(promises);
}

export default setupFaunaDB;
