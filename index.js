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

const CharacterType = new GraphQLObjectType({
  name: 'Character',
  fields: () => ({
    name: {type: GraphQLString},
    height: {type: GraphQLString},
    mass: {type: GraphQLString},
    hair_color: {type: GraphQLString},
  }),
});

const FilmType = new GraphQLObjectType({
  name: 'Film',
  fields: () => ({
    title: {type: GraphQLString},
    producer: {type: GraphQLString},
    release_date: {type: GraphQLString},
    director: {type: GraphQLString},
    episode_id: {type: GraphQLString},
    characters: {
      type: new GraphQLList(CharacterType),
      resolve: (film, args, context) => film.characters.map(get)
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    films: {
      type: new GraphQLList(FilmType),
      args: {
        ids: {type: new GraphQLList(GraphQLString)}
      },
      resolve: (root, args) => args.ids.map(id => get(`http://swapi.co/api/films/${id}/`))
    }
  }),
});

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: new GraphQLSchema({
    query: QueryType,
  }),
  graphiql: true
}));

app.listen(3000);

