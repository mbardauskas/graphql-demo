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
    films: {
      type: new GraphQLList(FilmType),
      resolve: (char, args, context) => context.filmByUrlLoader.loadMany(char.films)
    }
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
      resolve: (film, args, context) => context.charLoader.loadMany(film.characters)
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
      //resolve: (root, args) => args.ids.map(id => get(`http://swapi.co/api/films/${id}/`))
      resolve: (root, args, context) => context.filmLoader.loadMany(args.ids)
    }
  }),
});

const app = express();

const filmMap = new Map();
const filmLoader = new DataLoader(
  ids => Promise.all(ids.map((id) => get(`http://swapi.co/api/films/${id}/`))),
  {
    cacheKeyFn: key => `http://swapi.co/api/films/${key}/`,
    cacheMap: filmMap,
  }
);

const filmByUrlLoader = new DataLoader(
  ids => Promise.all(ids.map(get)),
  {cacheMap: filmMap}
);

const charLoader = new DataLoader(
  urls => Promise.all(urls.map(get))
);

app.use('/graphql', graphqlHTTP({
  context: {
    charLoader,
    filmLoader,
    filmByUrlLoader,
  },
  schema: new GraphQLSchema({
    query: QueryType,
  }),
  graphiql: true
}));

app.listen(3000);

