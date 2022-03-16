import { NETLIFY_SITE_URL } from '../constants/constants';

export type TokenParams = { grantType: 'access_token' } | { grantType: 'refresh_token' } | { grantType: 'login' };

export type ApiRequestOptions = (
  | { url: '/api/fauna/auth/token'; method?: 'GET'; searchParams: TokenParams }
  | { url: '/api/fauna/userprofile/me/update'; method: 'PATCH'; searchParams?: '' }
) & { options?: RequestInit; identityAccessToken: string };

export async function apiRequest<ApiResponse>({
  url,
  searchParams = '',
  method = 'GET',
  identityAccessToken = '',
  options = {},
}: ApiRequestOptions): Promise<ApiResponse | undefined> {
  try {
    let newURL = new URL(url, process.env.NODE_ENV === 'production' ? NETLIFY_SITE_URL : 'http://localhost:8888');
    const reqOptions = {
      ...options,
      method: method,
    };
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      newURL.search = params.toString();
    }
    if (identityAccessToken) {
      reqOptions.headers = { ...reqOptions.headers, Authorization: `Bearer ${identityAccessToken}` };
    }
    const res = await fetch(newURL.toString(), reqOptions);
    if (res.ok) {
      const json = await res.json();
      return json;
    }
    throw Error(res.status.toString());
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else console.error(error);
    return undefined;
  }
}
