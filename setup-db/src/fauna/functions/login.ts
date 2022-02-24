import faunadb from 'faunadb';
import { indexAllAccountsById } from '../indexes/faunaIndexesNames.js';
import {
  ACCESS_TOKEN_LIFETIME_SECONDS,
  CreateAccessAndRefreshToken,
  REFRESH_TOKEN_LIFETIME_SECONDS,
} from './tokens.js';

const q = faunadb.query;
const { Let, Var, Select, Match, Index, If, Get, Identify, Exists, And } = q;

export function LoginAccount(
  id: faunadb.ExprArg,
  password: faunadb.ExprArg,
  accessTtlSeconds: number = ACCESS_TOKEN_LIFETIME_SECONDS,
  refreshTtlSeconds: number = REFRESH_TOKEN_LIFETIME_SECONDS
) {
  return If(
    // First check whether the account exists and the account can be identified with the id/password
    And(VerifyAccountExists(id), IdentifyAccount(id, password)),
    CreateTokensForAccount(id, password, accessTtlSeconds, refreshTtlSeconds),
    // if not, return false
    false
  );
}

function GetAccountById(id: faunadb.ExprArg) {
  return Get(Match(Index(indexAllAccountsById.name), id));
}

function VerifyAccountExists(id: faunadb.ExprArg) {
  return Exists(Match(Index(indexAllAccountsById.name), id));
}

function IdentifyAccount(id: faunadb.ExprArg, password: faunadb.ExprArg) {
  return Identify(Select(['ref'], GetAccountById(id)), password);
}

function CreateTokensForAccount(
  id: faunadb.ExprArg,
  password: faunadb.ExprArg,
  accessTtlSeconds: number,
  refreshTtlSeconds: number
) {
  return Let(
    {
      account: GetAccountById(id),
      accountRef: Select(['ref'], Var('account')),
      // Verify whether our login credentials are correct with Identify.
      // Then we make an access and refresh in case authentication succeeded.
      tokens: CreateAccessAndRefreshToken(Var('accountRef'), accessTtlSeconds, refreshTtlSeconds),
      user: Select('data', Get(Select(['data', 'user'], Var('account')))),
    },
    {
      tokens: Var('tokens'),
      user: Var('user'),
    }
  );
}
