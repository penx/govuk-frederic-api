const { ApolloServer, gql } = require('apollo-server');

const { results } = require('@govuk-frederic/sample-data')
const config = require('config');

const { authenticated, authContext } = require('./auth');
const AUTH_ENABLED = config.get('AUTH_ENABLED');

const typeDefs = gql`
  type Item {
    title: String
    count: Int
  }

  type Meta {
    title: String
    items: [Item]
  }
  type Result {
    title: String
    synopsis: String
    meta: [Meta]
  }

  type ResultGroup {
    title: String
    results: [Result]
  }

  type Query {
    results: [ResultGroup]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    results: AUTH_ENABLED ? authenticated(results) : () => results
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: AUTH_ENABLED ? authContext : null
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`🚀  Server ready at ${url}`);
});
