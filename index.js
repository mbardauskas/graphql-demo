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

const get = (url) => {
  console.log('REQUEST TO:', url);
  return fetch(url).then(res => res.json());
};

const CharacterType = new GraphQLObjectType({
  name: 'Character',
  fields: () => ({
    name: {type: GraphQLString},
    height: {type: GraphQLString},
    mass: {type: GraphQLString},
    hair_color: {type: GraphQLString},
    films: {type: new GraphQLList(GraphQLString)}
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
      resolve: (film) =>
        Promise.all(film.characters.map((charUrl) => get(charUrl))),
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allFilms: {
      type: new GraphQLList(FilmType),
      resolve: () => get('http://swapi.co/api/films?format=json').then(json => json.results),
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

