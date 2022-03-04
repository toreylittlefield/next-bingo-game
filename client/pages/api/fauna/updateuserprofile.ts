/* code from functions/todos-create.js */
import faunadb, { Collection, Create } from 'faunadb'; /* Import faunaDB sdk */
import type { NextApiRequest, NextApiResponse } from 'next';

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  domain: 'db.fauna.com',
  scheme: 'https',
  secret: process.env.FAUNADB_SERVER_KEY as string,
});

type Data = {
  message: string | object;
};

interface Message {
  userName: string;
  message: string;
}

/* export our lambda function as named "handler" export */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const {
      aborted,
      body,
      complete,
      cookies,
      env,
      destroyed,
      headers,
      httpVersion,
      httpVersionMajor,
      httpVersionMinor,
      socket,
      query,
      rawHeaders,
      rawTrailers,
    } = req;
    /* parse the string body into a useable JS object */
    // const { message, userName }: Message = req.body;
    // console.log(req);
    // console.log(req.netlifyFunctionParams);
    // const {
    //   //@ts-ignore
    //   netlifyFunctionParams: {
    //     context: { clientContext },
    //   },
    // } = req;
    let readReq: Record<string, string> = {};
    for (let key of Object.values(req)) {
      if (typeof key !== 'function') {
        readReq[key] = key;
      }
    }
    console.log(
      JSON.stringify({
        rawHeaders: req.rawHeaders,
        cookies: req.cookies,
        //@ts-expect-error
        netlifyFunctionParams: req.netlifyFunctionParams,
        headers: req.headers,
        readReq,
      }),
    );
    //@ts-expect-error
    return res.status(200).json({ message: JSON.stringify(req.netlifyFunctionParams) });
  } catch (error) {
    console.log('error', error);
    res.status(400).json({ message: JSON.stringify(error) });
  }
}
