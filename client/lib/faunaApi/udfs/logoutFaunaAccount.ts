import faunadb from 'faunadb';
const { Call } = faunadb.query;

export async function logoutFaunaAccount(faunaRefreshClient: faunadb.Client): Promise<boolean | undefined> {
  try {
    return (await faunaRefreshClient.query(Call('logout', true))) as boolean;
  } catch (error) {
    console.error(error);
    return false;
  }
}
