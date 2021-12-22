import * as netlifyIdentity from 'netlify-identity-widget';
import GoTrue from './gotrue';

export type UserNameStates = 'loading' | 'sent' | 'ready' | 'sub';

export type UserProfile = netlifyIdentity.User;

declare module 'netlify-identity-widget' {
  declare let gotrue: GoTrue;

  export { gotrue };
}
