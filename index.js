const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const fetch = require('node-fetch');
const DataLoader = require('dataloader');

const {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = graphql;

const get = (url) => {
  console.log('REQUEST TO:', url);
  return fetch(`${url}?format=json`).then(res => res.json());
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: new GraphQLSchema({
    query: QueryType,
  }),
  graphiql: true
}));

app.listen(3000);

