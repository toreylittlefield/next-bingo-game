import { serverClient } from './server';
import faunadb from 'faunadb';
import { CombineMetaDataFunction, UserLoginDataRes, FaunaLoggedInResponse } from '../../types/types';
const { Call } = faunadb.query;

export async function loginAccountAndGetTokens(
  userId: string,
  password: string,
  combineCallback: CombineMetaDataFunction,
): Promise<UserLoginDataRes> {
  try {
    const { user, tokens } = (await serverClient.query(Call('login', [userId, password]))) as FaunaLoggedInResponse;

    return combineCallback({ user, tokens });
  } catch (error) {
    console.error(error);
    return { app_metadata: null };
  }
}
