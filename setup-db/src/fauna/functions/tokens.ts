import faunadb from 'faunadb';
import { indexAccessTokenByRefreshToken } from '../indexes/faunaIndexesNames.js';

const q = faunadb.query;
const {
  Let,
  Var,
  Create,
  Select,
  Tokens,
  Now,
  TimeAdd,
  Equals,
  Get,
  CurrentToken,
  HasCurrentToken,
  Lambda,
  Match,
  Index,
  Do,
  Delete,
  Paginate,
  And,
  Map,
} = q;

export const ACCESS_TOKEN_LIFETIME_SECONDS = 3600; // 60 minutes
export const REFRESH_TOKEN_LIFETIME_SECONDS = 86400; // 1 day(s), adapt if needed or remove ttl for eternal tokens

export function CreateAccessToken(accountRef: faunadb.ExprArg, refreshTokenRef: faunadb.ExprArg, ttlSeconds: number) {
  return Create(Tokens(), {
    instance: accountRef,
    // A  token is a document just like everything else in Fauna.
    // We will store extra metadata on the token to identify the token type.
    data: {
      type: 'access',
      // We store which refresh token that created the access tokens which allows us to easily invalidate
      // all access tokens created by a specific refresh token.
      refresh: refreshTokenRef,
    },
    // access tokens live for 10 minutes, which is typically a good livetime for short-lived tokens.
    ttl: TimeAdd(Now(), ttlSeconds || ACCESS_TOKEN_LIFETIME_SECONDS, 'seconds'),
  });
}

export function CreateRefreshToken(accountRef: faunadb.ExprArg, ttlSeconds: number) {
  return Create(Tokens(), {
    instance: accountRef,
    data: {
      type: 'refresh',
    },
    // 8 hours is a good time for refresh tokens.
    ttl: TimeAdd(Now(), ttlSeconds || REFRESH_TOKEN_LIFETIME_SECONDS, 'seconds'),
  });
}

export function CreateAccessTokenWithRefreshToken(
  refresh_token: faunadb.ExprArg,
  instance: faunadb.ExprArg,
  accessTtlSeconds: number,
  refreshTtlSeconds: number
) {
  return Let(
    {
      refresh: Get(refresh_token),
      deleteOld: Map(
        Paginate(Match(Index('access_token_by_refresh_token'), Select(['ref'], Var('refresh')))),
        Lambda(['t'], Delete(Var('t')))
      ),
      access: CreateAccessToken(instance, Select(['ref'], Var('refresh')), accessTtlSeconds),
    },
    {
      refresh: Var('refresh'),
      access: Var('access'),
    }
  );
}

export function CreateAccessAndRefreshToken(
  instance: faunadb.ExprArg,
  accessTtlSeconds: number,
  refreshTtlSeconds: number
) {
  return Let(
    {
      refresh: CreateRefreshToken(instance, refreshTtlSeconds),
      access: CreateAccessToken(instance, Select(['ref'], Var('refresh')), accessTtlSeconds),
    },
    {
      refresh: Var('refresh'),
      access: Var('access'),
    }
  );
}

function LogoutAccessTokensForRefreshToken(refreshTokenRef: faunadb.ExprArg) {
  return q.Map(
    Paginate(Match(Index(indexAccessTokenByRefreshToken.name), refreshTokenRef)),
    Lambda(['t'], Delete(Var('t')))
  );
}

export function LogoutAccessAndRefreshToken() {
  return Do(LogoutAccessTokensForRefreshToken(CurrentToken()), Delete(CurrentToken()));
}

export function IsCalledWithAccessToken() {
  return Equals(Select(['data', 'type'], Get(CurrentToken()), false), 'access');
}

export function IsCalledWithRefreshToken() {
  return And(HasCurrentToken(), Equals(Select(['data', 'type'], Get(CurrentToken()), false), 'refresh'));
}
