import netlifyIdentity from 'netlify-identity-widget';
import GoTrue from './gotrue';

export type UserNameStates = 'loading' | 'sent' | 'ready' | 'sub';

export type UserProfile = netlifyIdentity.User;

export type GoTrueProps = {
  gotrue: GoTrue;
};
export type NetlifyGoTrueIdentity = GoTrueProps & Omit<typeof netlifyIdentity, 'netlifyGoTrue'>;

declare module 'netlify-identity-widget' {
  export const netlifyGoTrue: NetlifyGoTrueIdentity;
}
