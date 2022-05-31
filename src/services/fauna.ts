import { Client } from "faunadb";

if (!process.env.FAUNADB_KEY) {
  throw new Error('FAUNADB_KEY is missing')
}

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY,
});
