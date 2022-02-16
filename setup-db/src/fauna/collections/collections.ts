import fauna from 'faunadb';
import { bingoBoardCollections, usersCollection } from './collectionnames.js';
const q = fauna.query;

const { CreateCollection, Collection, Exists, If, Index } = q;

const CreateUsersCollection = CreateCollection(usersCollection);
const CreateBingoBoardsCollection = CreateCollection(bingoBoardCollections);

async function createCollections(faunaClient: fauna.Client) {
  await faunaClient.query(If(Exists(Collection(usersCollection.name)), true, CreateUsersCollection));
  await faunaClient.query(If(Exists(Collection(bingoBoardCollections.name)), true, { CreateBingoBoardsCollection }));
  //   await faunaClient.query(If(Exists(Index('all_fweets')), true, CreateIndexAllFweets));
  //   await faunaClient.query(If(Exists(Index('fweets_by_author')), true, CreateIndexFweetsByAuthor));
  //   await faunaClient.query(If(Exists(Index('fweets_by_tag')), true, CreateIndexFweetsByTag));
  //   await faunaClient.query(If(Exists(Index('fweets_by_reference')), true, CreateIndexFweetsByReference));
  //   await faunaClient.query(If(Exists(Index('fweets_by_hashtag_ref')), true, CreateIndexFweetsByHashtagRef));
}

export { createCollections };
