/** NETLIFY SITE URL */
export const NETLIFY_SITE_URL = process.env.NETLIFY_SITE_URL as string;

/** FAUNA PWS */
export const PWS = process.env.FAUNADB_PASSWORD as string;

/** FAUNA SERVER  KEY*/
export const FAUNADB_SERVER_KEY = process.env.FAUNADB_SERVER_KEY as string;

/** UNSPLASH KEY */
export const UNSPLASH_CLIENT_KEY = process.env.UNSPLASH_CLIENT_KEY as string;

/** FAUNA COLLECTION NAMES */
export const FAUNA_COLLECTION_NAMES = {
  accounts: 'accounts',
  users: 'users',
};

/** NETLIFY ROLE FOR REGISTERED USERS */
export const NETLIFY_ROLE = 'user_account';
