/** FAUNA */
export const PWS = process.env.FAUNADB_PASSWORD as string;
export const FAUNADB_SERVER_KEY = process.env.FAUNADB_SERVER_KEY as string;

export const UNSPLASH_CLIENT_KEY = process.env.UNSPLASH_CLIENT_KEY as string;

export const FAUNA_COLLECTION_NAMES = {
  accounts: 'accounts',
  users: 'users',
};

export const NETLIFY_ROLE = 'user_account';
