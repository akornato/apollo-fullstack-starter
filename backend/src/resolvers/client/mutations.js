const { graphqlMongodbProjection } = require('graphql-mongodb-projection');
const { getUserId } = require('../utils');
const pick = require('lodash/pick');

module.exports = {
  async addMyClient(_, { entityName }, ctx, info) {
    const userId = getUserId(ctx);

    const client = await ctx.db.Client.create({ owner: userId, entity: { entityName } });

    return pick(client.toJSON(), Object.keys(graphqlMongodbProjection(info)));
  },

  async updateMyClient(_, { id, data }, ctx, info) {
    const userId = getUserId(ctx);

    const client = await ctx.db.Client.findById(id).exec();
    if (!client) {
      throw new Error(`client id ${id} not found`);
    }
    if (client.owner !== userId) {
      throw new Error(`You are not the owner of client id ${id}`);
    }

    Object.assign(client, data);
    await client.save();

    return pick(client.toJSON(), Object.keys(graphqlMongodbProjection(info)));
  },

  async deleteMyClient(_, { id }, ctx, info) {
    const userId = getUserId(ctx);

    const client = await ctx.db.Client.findById(id, 'owner').exec();
    if (!client) {
      throw new Error(`client id ${id} not found`);
    }
    if (client.owner !== userId) {
      throw new Error(`You are not the owner of client id ${id}`);
    }

    await ctx.db.Client.findByIdAndDelete(id).exec();

    return pick(client.toJSON(), Object.keys(graphqlMongodbProjection(info)));
  },
};
