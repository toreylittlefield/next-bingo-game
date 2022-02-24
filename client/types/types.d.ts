import * as netlifyIdentity from 'netlify-identity-widget';
import GoTrue from './gotrue';

export type UserNameStates = 'loading' | 'sent' | 'ready' | 'sub';

declare module 'netlify-identity-widget' {
  declare let gotrue: GoTrue;

  export { gotrue };
}

export type UserProfile = {
  user: netlifyIdentity.User;
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
  user?: User;
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

export interface User {
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
