const { graphqlMongodbProjection } = require('graphql-mongodb-projection');
const { getUserId } = require('../utils');

module.exports = {
  async myClientList(_, args, ctx, info) {
    const userId = getUserId(ctx);

    return ctx.db.Client.find({ owner: userId }, graphqlMongodbProjection(info)).exec();
  },

  async myClient(_, { id }, ctx, info) {
    const userId = getUserId(ctx);

    const client = await ctx.db.Client.findById(id, graphqlMongodbProjection(info)).exec();
    if (!client) {
      throw new Error(`client id ${id} not found`);
    }
    if (client.owner !== userId) {
      throw new Error(`You are not the owner of client id ${id}`);
    }

    return client;
  },
};
