import faunadb from 'faunadb';
import { FAUNADB_SERVER_KEY } from '../constants/constants';

/** configure faunaDB Client with our secret */
export const serverClient = new faunadb.Client({
  domain: 'db.fauna.com',
  scheme: 'https',
  secret: FAUNADB_SERVER_KEY,
});
