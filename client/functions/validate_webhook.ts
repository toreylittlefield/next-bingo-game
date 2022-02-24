import { Handler } from '@netlify/functions';
import faunadb from 'faunadb';
import generator from 'generate-password';
import netlifyIdentity from 'netlify-identity-widget';
import { verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import { RandomPhotoUnsplash } from '../types/types';

type Key = {
  secret: string;
};

interface UserType extends netlifyIdentity.User {
  ['app_metadata']: {
    provider: string;
    roles: string[];
    faunadb_tokens: {
      accessTokenData: {
        expiration: string | Date;
        accessToken: string;
      };
      refreshTokenData: {
        expiration: string | Date;
        refreshToken: string;
      };
    };
  };
}

interface UserMetaData extends netlifyIdentity.User {
  ['user_metadata']: {
    avatar_url: string;
    full_name: string;
    [key: string]: any;
  };
}

const FAUNA_COLLECTION_NAMES = {
  accounts: 'accounts',
  users: 'users',
};

const NETLIFY_ROLE = 'user_account';

/* configure faunaDB Client with our secret */
const q = faunadb.query;

const { Call } = q;
const serverClient = new faunadb.Client({
  domain: 'db.fauna.com',
  scheme: 'https',
  secret: process.env.FAUNADB_SERVER_KEY as string,
});

// PWS
const PWS = process.env.FAUNADB_PASSWORD as string;
const UNSPLASH_CLIENT_KEY = process.env.UNSPLASH_CLIENT_KEY as string;

async function createAccount(userId: string, password: string, userName: string, userAlias: string, userIcon: string) {
  return await serverClient.query(Call('register', userId, password, userName, userAlias, userIcon));
}

type Login = {
  account: {
    data: { id: string };
  };
  tokens: {
    refresh: {
      secret: string;
      ttl: { value: string };
    };
    access: {
      secret: string;
      ttl: { value: string };
    };
  };
};

async function loginAccountAndGetTokens(userId: string, password: string): Promise<Login> {
  return await serverClient.query(Call('login', [userId, password]));
}

/** create a user in FaunaDB that can connect from the browser */
async function createUser(userId: string, password: string) {
  return await serverClient.query(
    q.Create(q.Collection(FAUNA_COLLECTION_NAMES.accounts), {
      credentials: {
        password: password,
      },
      data: {
        id: userId,
        // user_metadata: userData.user_metadata,
      },
    }),
  );
}

function obtainToken(userId: object, password: string) {
  return serverClient.query(q.Login(q.Select('ref', userId), { password }));
}

const handler: Handler = async (event, context) => {
  console.log(JSON.stringify({ event, context }, null, 2));

  /** Check webhook signature && clientContext */
  const sig = event.headers['x-webhook-signature'];
  if (!sig || !context.clientContext) {
    console.log('no clientContext', context.clientContext);
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Not Authorized' }),
    };
  }

  /** Verify the webhook JWT signature */
  const res = verify(sig, process.env.WEB_HOOK_SIG as string, function resolve(error, decoded) {
    if (error) {
      console.log('invalid  webhook signature', sig);
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Not Authorized' }),
      };
    }
    return decoded;
  });

  /** logic for user validation and signup / login */
  if (event.body && res) {
    const payload = JSON.parse(event.body);
    const eventType = payload.event;
    console.log({ payload });
    const { app_metadata, user_metadata, id } = payload.user as UserType;

    /** email validation event */
    if (eventType === 'validate' && app_metadata?.provider === 'email') {
      return {
        statusCode: 200,
        body: '',
      };
    }

    /** login event, and user should already have a NETLIFY_ROLE in their roles && faunadb refresh && access token */
    if (
      app_metadata.roles?.includes(NETLIFY_ROLE) &&
      app_metadata.faunadb_tokens &&
      app_metadata.faunadb_tokens.accessTokenData.accessToken &&
      app_metadata.faunadb_tokens.refreshTokenData.refreshToken
    ) {
      //** check refresh && access token expiration */
      return {
        statusCode: 200,
        body: '',
      };
    }

    /** Create New Account */
    try {
      const randomuser = () => ['boarofWar', 'boarCoder', 'codeSmell', 'sniffNation'][Math.floor(Math.random() * 4)];
      const randomNum = () => Math.random().toString(36).slice(2);
      const getRandomUser = () => randomuser() + randomNum();
      const username = getRandomUser();

      const getUserAvatar = async (apiKey: string) => {
        try {
          const res = await fetch(
            `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=boar&content_filter=high`,
          );
          if (res.ok) {
            const json = (await res.json()) as RandomPhotoUnsplash;
            const thumb = json.urls?.thumb;
            if (!thumb) throw Error('no thumb');
            return thumb;
          }
          throw Error(res.statusText);
        } catch (error) {
          console.error(error);
          return 'https://images.unsplash.com/photo-1550781088-fe4ae3b87430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMDQ4NzR8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDU2NjI1ODc&ixlib=rb-1.2.1&q=80&w=200';
        }
      };

      const userAvatarURL = user_metadata?.avatar_url || (await getUserAvatar(UNSPLASH_CLIENT_KEY));

      await createAccount(id, PWS, user_metadata.full_name, username, userAvatarURL);
      const { account, tokens } = await loginAccountAndGetTokens(id, PWS);

      /** Create Document in Accounts for this client */
      // const user = await createUser(id, PWS).catch((err) =>
      //   console.log('error creating user', JSON.stringify(err, null, 2), err.message),
      // );
      // console.log(JSON.stringify(user, null, 2), 'user creation log');
      // if (!user) {
      //   console.log('fauna create user error 401');
      //   return {
      //     statusCode: 401,
      //     body: 'Not Authorized',
      //   };
      // }
      // const key = (await obtainToken(user, PWS)) as Key;
      // console.log({ user, key });

      const user: Pick<UserMetaData, 'user_metadata'> = {
        user_metadata: {
          avatar_url: '',
          full_name: '',
          ...account,
        },
      };

      const appMetaData: Pick<UserType, 'app_metadata'> = {
        app_metadata: {
          faunadb_tokens: {
            accessTokenData: {
              accessToken: tokens.access.secret,
              expiration: tokens.access.ttl.value,
            },
            refreshTokenData: {
              refreshToken: tokens.refresh.secret,
              expiration: tokens.refresh.ttl.value,
            },
          },
          roles: [NETLIFY_ROLE],
          provider: app_metadata.provider,
        },
      };

      return {
        statusCode: 200,
        body: JSON.stringify({ ...appMetaData, ...user }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: 'Interval Server Error',
      };
    }
  }

  console.log('failed: theres another reason 403');
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
