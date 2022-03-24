import type { Handler } from '@netlify/functions';
import type { Context } from '@netlify/functions/dist/function/context';
import * as netlifyIdentity from 'netlify-identity-widget';
import GoTrue from './gotrue';

export type UserNameStates = 'loading' | 'sent' | 'ready' | 'sub';

declare module 'netlify-identity-widget' {
  declare let gotrue: GoTrue;

  export { gotrue };
}

export interface LoggedInUser extends NetlifyAppMetaData {
  faunaUser: FaunaLoggedInResponse['user'];
  fauna_access_token: FaunaLoggedInResponse['tokens']['access'];
}

export type UserProfile = {
  user: LoggedInUser;
};

export interface RandomPhotoUnsplash {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  promotedAt?: null;
  width?: number;
  height?: number;
  color?: string;
  blurHash?: string;
  description?: null;
  altDescription?: string;
  urls?: Urls;
  links?: JSONLinks;
  categories?: any[];
  likes?: number;
  likedByUser?: boolean;
  currentUserCollections?: any[];
  sponsorship?: null;
  topicSubmissions?: TopicSubmissions;
  user?: UserUnsplash;
  exif?: Exif;
  location?: Location;
  views?: number;
  downloads?: number;
}

export interface Exif {
  make?: string;
  model?: string;
  name?: string;
  exposureTime?: string;
  aperture?: string;
  focalLength?: string;
  iso?: number;
}

export interface JSONLinks {
  self?: string;
  html?: string;
  download?: string;
  downloadLocation?: string;
}

export interface Location {
  title?: string;
  name?: string;
  city?: string;
  country?: string;
  position?: Position;
}

export interface Position {
  latitude?: null;
  longitude?: null;
}

export interface TopicSubmissions {}

export interface Urls {
  raw?: string;
  full?: string;
  regular?: string;
  small?: string;
  thumb?: string;
  smallS3?: string;
}

export interface UserUnsplash {
  id?: string;
  updatedAt?: Date;
  username?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  twitterUsername?: string;
  portfolioURL?: string;
  bio?: string;
  location?: string;
  links?: UserLinks;
  profileImage?: ProfileImage;
  instagramUsername?: string;
  totalCollections?: number;
  totalLikes?: number;
  totalPhotos?: number;
  acceptedTos?: boolean;
  forHire?: boolean;
  social?: Social;
}

export interface UserLinks {
  self?: string;
  html?: string;
  photos?: string;
  likes?: string;
  portfolio?: string;
  following?: string;
  followers?: string;
}

export interface ProfileImage {
  small?: string;
  medium?: string;
  large?: string;
}

export interface Social {
  instagramUsername?: string;
  portfolioURL?: string;
  twitterUsername?: string;
  paypalEmail?: null;
}

export interface NetlifyAppMetaData extends netlifyIdentity.User {
  ['app_metadata']: {
    provider: string;
    roles: string[];
  };
}

export interface NetlifyUserMetaData extends netlifyIdentity.User {
  ['user_metadata']: {
    avatar_url: string;
    full_name: string;
    [key: string]: any;
  };
}

export interface FaunaLoggedInResponse {
  user: {
    name: string;
    alias: string;
    icon: string;
    lastUpdated: false | string;
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

export type AppMetaData = NetlifyAppMetaData['app_metadata'];
export type UserMetaData = NetlifyUserMetaData['user_metadata'];

export type UserAppMetaData = { app_metadata: AppMetaData };

export type UserLoginDataRes = UserAppMetaData | { app_metadata: null };

export type CombineMetaDataFunction = ({ user, tokens }: FaunaLoggedInResponse) => UserAppMetaData;

export interface CustomContext extends Context {
  ['clientContext']: {
    identity: Identity;
    user: ClientContextUser;
  };
}

interface ClientContextUser {
  exp: number;
  sub: string;
  email: string;
  app_metadata: Appmetadata;
  user_metadata: Usermetadata;
}

interface Usermetadata {
  full_name: string;
  avatar_url: string;
  [key: string]: any;
}

interface Appmetadata {
  faunadb_tokens: Faunadbtokens;
  provider: string;
  roles: string[];
}

interface Faunadbtokens {
  accessTokenData: AccessTokenData;
  refreshTokenData: RefreshTokenData;
}

interface RefreshTokenData {
  expiration: string;
  refreshToken: string;
}

interface AccessTokenData {
  accessToken: string;
  expiration: string;
}

interface Identity {
  url: string;
  token: string;
}

interface NfJwtCookie {
  exp: number;
  sub: string;
  email: string;
  app_metadata: Appmetadata;
  user_metadata: Usermetadata;
}

interface Usermetadata {
  full_name: string;
}

interface Appmetadata {
  faunadb_tokens: ?Faunadbtokens;
  provider: string;
  roles: string[];
}

interface Faunadbtokens {
  accessTokenData: AccessTokenData;
  refreshTokenData: RefreshTokenData;
}

interface RefreshTokenData {
  expiration: string;
  refreshToken: string;
}

interface AccessTokenData {
  accessToken: string;
  expiration: string;
}

export interface FaunaUpdateUserReqBody {
  name: string;
  alias: string;
  icon: string;
  fauna_access_token: string;
  lastUpdated: string | false;
}

export interface FaunaCreateAccountResponse {
  id: string;
  user: {
    name: string;
    alias: string;
    icon: string;
  };
}

export type UpdateFaunaSuccessRes = {
  result:
    | false
    | {
        data: {
          name: string;
          alias: string;
          icon: string;
          lastUpdated: { '@date': string } | false;
        };
      };
  compareDates: number;
};

export type UpdateFaunaSuccessNormal = {
  data: {
    name: string;
    alias: string;
    icon: string;
    lastUpdated: string | false;
  };
};

export type UpdateFaunaSuccessNormalExistingUser = {
  data: {
    name: string;
    alias: string;
    icon: string;
    lastUpdated: string;
  };
};

export type UpdateFaunaUserResponse = {
  result: UpdateFaunaSuccessNormal | false;
  compareDates: number;
};

export type UpdateFaunaExistingUserResponse = {
  result: UpdateFaunaSuccessNormalExistingUser | false;
  compareDates: number;
};

export type FaunaUpdateExistingUserApiResponse = UpdateFaunaExistingUserResponse | undefined;

export type FaunaNewUserApiResponse = UpdateFaunaUserResponse | undefined;

export type FaunaLoggedInApiResponse =
  | { faunaTokens: FaunaLoggedInResponse['tokens']; faunaUser: FaunaLoggedInResponse['user'] }
  | undefined;

export type APIServiceLoggedInResponse =
  | { fauna_access_token: FaunaLoggedInResponse['tokens']['access']; faunaUser: FaunaLoggedInResponse['user'] }
  | undefined;

export interface FaunaUpdateSuccessResponse {
  compareDates: number;
  result: {
    data: {
      alias: string;
      icon: string;
      lastUpdated: string | false;
      name: string;
    };
  };
}

interface BoardPiece {
  id: string;
  text: string;
  position: string;
}
export interface FaunaCreateBoardRequestBody {
  access_token: string;
  title: string;
  board: Array<string>;
}

interface CloudinaryUploadUserImageResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: any[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  overwritten: boolean;
  original_filename: string;
  original_extension: string;
  api_key: string;
}
