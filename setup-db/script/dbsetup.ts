import { Client } from 'faunadb';
import { CreateRoleUserBingoBoards } from '../fauna/roles/boardRole';
import { createBoardUDF } from '../fauna/udfs/udfs';
import { config } from 'dotenv';

config();

const admin = new Client({
  secret: process.env.FAUNADB_ADMIN_KEY as string,
});

async function handleError(cb: Promise<Function>, consoleMsg: string) {
  return await cb.catch((err) => console.log(consoleMsg, err.message));
}

async function setupFaunaDB() {
  await handleError(admin.query(CreateRoleUserBingoBoards), 'error in creating role for bingo board');
  await handleError(admin.query(createBoardUDF), 'error in creating create_board UDF');
}

setupFaunaDB();
