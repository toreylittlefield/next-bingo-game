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

interface NetlifyAppMetaData extends netlifyIdentity.User {
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

interface NetlifyUserMetaData extends netlifyIdentity.User {
  ['user_metadata']: {
    avatar_url: string;
    full_name: string;
    [key: string]: any;
  };
}

interface LoggedInResponse {
  user: {
    data: { name: string; alias: string; icon: string };
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
}

type AppMetaData = NetlifyAppMetaData['app_metadata'];
type UserMetaData = NetlifyUserMetaData['user_metadata'];

type UserAppMetaData = { user_metadata: UserMetaData; app_metadata: AppMetaData };

type UserLoginDataRes = UserAppMetaData | { user_metadata: null; app_metadata: null };

type CombineMetaDataFunction = ({ user, tokens }: LoggedInResponse) => UserAppMetaData;

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

function combineMetaData(prevAppMetaData: AppMetaData, prevUserMetaData: UserMetaData) {
  return function newMetaData({ user, tokens }: LoggedInResponse) {
    const user_metadata: UserMetaData = {
      ...prevUserMetaData,
      alias: user.data.alias,
      avatar_url: user.data.icon,
      full_name: user.data.name,
    };

    const app_metadata: AppMetaData = {
      ...prevAppMetaData,
      roles: [NETLIFY_ROLE],
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
    };
    console.log({ user_metadata, app_metadata }, '----> COMBINE METADATA <----');
    return { user_metadata, app_metadata };
  };
}

async function createAccount(
  userId: string,
  password: string,
  userName: string,
  userAlias: string,
  userIcon: string,
  combineCallback: CombineMetaDataFunction,
): Promise<UserLoginDataRes> {
  try {
    const res = (await serverClient.query(
      Call('register', userId, password, userName, userAlias, userIcon),
    )) as LoggedInResponse;

    const { user, tokens } = res;
    console.log({ user, tokens }, '---> create account, user & login registration');
    const result = combineCallback({ user, tokens });
    console.log(JSON.stringify(result, null, 2), 'result of combined function');
    const { app_metadata, user_metadata } = result;
    return { app_metadata: app_metadata, user_metadata: user_metadata };
  } catch (error) {
    return { app_metadata: null, user_metadata: null };
  }
}

async function loginAccountAndGetTokens(
  userId: string,
  password: string,
  combineCallback: CombineMetaDataFunction,
): Promise<UserLoginDataRes> {
  try {
    const { user, tokens } = (await serverClient.query(Call('login', [userId, password]))) as LoggedInResponse;

    return combineCallback({ user, tokens });
  } catch (error) {
    console.error(error);
    return { app_metadata: null, user_metadata: null };
  }
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
    const { app_metadata: prevAppMetaData, user_metadata: prevUserMetaData, id } = payload.user as NetlifyAppMetaData;

    /** email validation event */
    if (eventType === 'validate' && prevAppMetaData?.provider === 'email') {
      return {
        statusCode: 200,
        body: '',
      };
    }

    const combineMetaDataCallback = combineMetaData(prevAppMetaData, prevUserMetaData);

    /** login event, and user should already have a NETLIFY_ROLE in their roles && faunadb refresh && access token */
    if (
      prevAppMetaData.roles?.includes(NETLIFY_ROLE) &&
      prevAppMetaData.faunadb_tokens &&
      prevAppMetaData.faunadb_tokens.accessTokenData.accessToken &&
      prevAppMetaData.faunadb_tokens.refreshTokenData.refreshToken
    ) {
      //** check refresh && access token expiration */
      const { app_metadata = null, user_metadata = null } = await loginAccountAndGetTokens(
        id,
        PWS,
        combineMetaDataCallback,
      );
      console.log({ app_metadata, user_metadata }, 'login account data');

      if (!app_metadata?.faunadb_tokens)
        return {
          statusCode: 401,
          body: 'Unauthorized',
        };

      return {
        statusCode: 200,
        body: JSON.stringify({ app_metadata, user_metadata }),
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

      const userAvatarURL = prevUserMetaData?.avatar_url || (await getUserAvatar(UNSPLASH_CLIENT_KEY));

      const { app_metadata, user_metadata } = await createAccount(
        id,
        PWS,
        prevUserMetaData.full_name || '',
        username,
        userAvatarURL,
        combineMetaDataCallback,
      );

      console.log({ app_metadata, user_metadata }, 'create account data');

      if (!app_metadata?.faunadb_tokens)
        return {
          statusCode: 401,
          body: 'Unauthorized',
        };

      return {
        statusCode: 200,
        body: JSON.stringify({ app_metadata, user_metadata }),
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
