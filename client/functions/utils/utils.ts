import { AppMetaData, LoggedInResponse, RandomPhotoUnsplash, UserAppMetaData, UserMetaData } from '../../types/types';
import fetch from 'node-fetch';
import { NETLIFY_ROLE } from '../constants/constants';

const randomuser = () => ['boarofWar', 'boarCoder', 'codeSmell', 'sniffNation'][Math.floor(Math.random() * 4)];
const randomNum = () => Math.random().toString(36).slice(2);
export const getRandomUserName = () => randomuser() + randomNum();

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
