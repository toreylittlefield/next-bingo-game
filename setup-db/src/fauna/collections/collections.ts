import fauna from 'faunadb';
import {
  CreateIndexAccessTokenByRefreshTokenRef,
  CreateIndexAllBingoBoards,
  CreateIndexByAccountId,
  CreateIndexTokensByInstance,
} from '../indexes/faunaIndex.js';
import {
  indexAccessTokenByRefreshToken,
  indexAllAccountsById,
  indexAllBingoBoardsByRef,
  indexTokensByInstance,
} from '../indexes/faunaIndexesNames.js';
import { accountsCollection, bingoBoardCollections, usersCollection } from './collectionnames.js';
const q = fauna.query;

const { CreateCollection, Collection, Exists, If, Index } = q;

/** Accounts Collection */
const CreateAccountsCollection = CreateCollection(accountsCollection);
/** Users Collection */
const CreateUsersCollection = CreateCollection(usersCollection);
/** Boards Collection */
const CreateBingoBoardsCollection = CreateCollection(bingoBoardCollections);

/** Create All Collections & Indexes Here  */
async function createCollections(faunaClient: fauna.Client) {
  /** collections */
  await faunaClient.query(If(Exists(Collection(accountsCollection.name)), true, CreateAccountsCollection));
  await faunaClient.query(If(Exists(Collection(usersCollection.name)), true, CreateUsersCollection));
  await faunaClient.query(If(Exists(Collection(bingoBoardCollections.name)), true, CreateBingoBoardsCollection));

  /** indexes */
  await faunaClient.query(If(Exists(Index(indexAllAccountsById.name)), true, CreateIndexByAccountId));
  await faunaClient.query(If(Exists(Index(indexAllBingoBoardsByRef.name)), true, CreateIndexAllBingoBoards));
  await faunaClient.query(
    If(Exists(Index(indexAccessTokenByRefreshToken.name)), true, CreateIndexAccessTokenByRefreshTokenRef)
  );
  await faunaClient.query(If(Exists(Index(indexTokensByInstance.name)), true, CreateIndexTokensByInstance));
}

export { createCollections };
