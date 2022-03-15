import type { AppMetaData, RandomPhotoUnsplash } from '../../types/types';
import fetch from 'node-fetch';
import { NETLIFY_ROLE } from '../../lib/constants/constants';
import { HandlerResponse } from '@netlify/functions';

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

/**
 * - if role is user_account then return statusCode 200 with any modify app_meta_data
 * - else return 401 for unauthorized
 */
export function hasValidRole(app_metadata: AppMetaData): HandlerResponse {
  if (!app_metadata?.roles.includes(NETLIFY_ROLE))
    return {
      statusCode: 401,
      body: 'Forbidden: Invalid Role',
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
