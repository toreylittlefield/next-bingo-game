import faunadb from 'faunadb';
import { createCollections } from '../fauna/collections/collections.js';
import {
  CreateRoleAccountsBingoBoards,
  CreateRoleFunctionBingoBoards,
  UpdateRoleFunctionBingoBoards,
  UpdateRoleAccountsBingoBoards,
  CreateRoleRefreshToken,
  UpdateRoleRefreshToken,
} from '../fauna/roles/roles.js';
import {
  createAccessTokenWithRefreshTokenUDF,
  createBoardUDF,
  createRefreshAndAccessTokenUDF,
  createUserUDF,
  deleteBoardUDF,
  loginAccountAndCreateUserUDF,
  logoutDeleteTokensAccountUDF,
  readBoardUDF,
  registerCreateAccountUDF,
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
    await handleSetupError(admin.query(CreateRoleRefreshToken), 'Role Refresh Token'),
    /** Create UDFs */
    //login, logut, refreshtoken
    await handleSetupError(admin.query(registerCreateAccountUDF), 'register account UDF'),
    await handleSetupError(admin.query(loginAccountAndCreateUserUDF), 'login account UDF'),
    await handleSetupError(admin.query(logoutDeleteTokensAccountUDF), 'logout account and delete tokens UDF'),
    await handleSetupError(admin.query(createRefreshAndAccessTokenUDF), 'create refresh and access token UDF'),
    await handleSetupError(
      admin.query(createAccessTokenWithRefreshTokenUDF),
      'create access token with refresh token only UDF'
    ),

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
    await handleSetupError(admin.query(UpdateRoleAccountsBingoBoards), 'Update Role Users Bingo Board'),
    await handleSetupError(admin.query(UpdateRoleRefreshToken), 'Update Role Refresh Token '),
  ];
  return await Promise.allSettled(promises);
}

export default setupFaunaDB;
