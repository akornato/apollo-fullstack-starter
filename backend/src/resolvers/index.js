const GraphQLJSON = require('graphql-type-json');

module.exports = {
  JSON: GraphQLJSON,
  Query: {
    ...require('./user/queries'),
    ...require('./client/queries'),
  },
  Mutation: {
    ...require('./auth/mutations'),
    ...require('./user/mutations'),
    ...require('./client/mutations'),
  },
};
