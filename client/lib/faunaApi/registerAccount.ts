import { serverClient } from './server';
import faunadb from 'faunadb';
import type { FaunaCreateAccountResponse } from '../../types/types';
const { Call } = faunadb.query;

export async function createFaunaUserAccount(
  userId: string,
  password: string,
  userName: string,
  userAlias: string,
  userIcon: string,
): Promise<FaunaCreateAccountResponse | undefined> {
  try {
    const { user, id } = (await serverClient.query(
      Call('register', userId, password, userName, userAlias, userIcon),
    )) as FaunaCreateAccountResponse;
    return { user, id };
  } catch (error) {
    return undefined;
  }
}
