const { graphqlMongodbProjection } = require('graphql-mongodb-projection');
const { getUserId } = require('../utils');

module.exports = {
  async meUser(_, args, ctx, info) {
    const userId = getUserId(ctx);
    return ctx.db.User.findById(userId, graphqlMongodbProjection(info)).exec();
  },
};
