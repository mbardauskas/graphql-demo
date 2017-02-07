const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const express = require('express');
const fetch = require('node-fetch');

const {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = graphql;

const FilmType = new GraphQLObjectType({
  name: 'Film',
  fields: () => ({
    title: {type: GraphQLString},
    producer: {type: GraphQLString},
    release_date: {type: GraphQLString},
    director: {type: GraphQLString},
    episode_id: {type: GraphQLString},
    characters: {
      type: new GraphQLList(GraphQLString),
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allFilms: {
      type: new GraphQLList(FilmType),
      resolve: () =>
        fetch('http://swapi.co/api/films?format=json')
          .then(res => res.json())
          .then(json => json.results)
        ,
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

