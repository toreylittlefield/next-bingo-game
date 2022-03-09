import {
  AppMetaData,
  LoggedInResponse,
  RandomPhotoUnsplash,
  UserAppMetaData,
  UserLoginDataRes,
  UserMetaData,
} from '../../types/types';
import fetch from 'node-fetch';
import { NETLIFY_ROLE } from '../../lib/constants/constants';
import { HandlerResponse } from '@netlify/functions';

const randomuser = () => ['boarofWar', 'boarCoder', 'codeSmell', 'sniffNation'][Math.floor(Math.random() * 4)];
const randomNum = () => Math.random().toString(36).slice(2);
/** select a random user name from a list */
export const getRandomUserName = () => `${randomuser()}_${randomNum()}🐗`;

/** - fetchs a random thumbnail image of a boar from unsplash */
export const getUserAvatar = async (apiKey: string) => {
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

export function combineMetaData(prevAppMetaData: AppMetaData, prevUserMetaData?: UserMetaData) {
  return function newMetaData({ user, tokens }: LoggedInResponse): UserAppMetaData {
    return {
      app_metadata: {
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
      },
    };
  };
}

/**
 * - if faunadb_tokens then return statusCode 200
 * - else return 403 for unauthorized
 */
export function hasValidFaunaTokens(app_metadata: UserLoginDataRes['app_metadata']): HandlerResponse {
  if (!app_metadata?.faunadb_tokens)
    return {
      statusCode: 403,
      body: 'Forbidden',
    };

  return {
    statusCode: 200,
    body: JSON.stringify({ app_metadata }),
  };
}

export function isTokenExpired(ttl: string | number) {
  let timestamp = ttl;
  if (typeof timestamp === 'string') {
    timestamp = Date.parse(timestamp);
  }
  if (Date.now() >= timestamp) return false;
  return true;
}

/** - returns 403 statusCode Not Authorized */
export function notAuthorizedHandlerResponse(): HandlerResponse {
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
}
