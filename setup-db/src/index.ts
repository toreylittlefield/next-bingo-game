import setupFaunaDB from './launch/dbsetup.js';
import dotenv from 'dotenv';
dotenv.config();
const ADMIN_KEY = process.env.FAUNADB_ADMIN_KEY as string;
console.log({ ADMIN_KEY });

setupFaunaDB(ADMIN_KEY)
  .then((res) => console.log({ res }, 'done'))
  .catch((err) => console.log(err.message, 'failure'));
