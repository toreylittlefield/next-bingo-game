import faunadb from 'faunadb';
import { LogoutAccessAndRefreshToken } from './tokens.js';

const { Logout, If } = faunadb.query;

// Logout is called with the refresh token.
export function LogoutAccount(all: faunadb.ExprArg) {
  return If(all, Logout(true), LogoutAccessAndRefreshToken());
}
