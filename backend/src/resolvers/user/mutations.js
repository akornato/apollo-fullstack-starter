const { graphqlMongodbProjection } = require('graphql-mongodb-projection');
const { getUserId } = require('../utils');
const pick = require('lodash/pick');

module.exports = {
  async updateMe(_, { data }, ctx, info) {
    const id = getUserId(ctx);
    const user = await ctx.db.User.findById(id).exec();
    Object.assign(user, data);
    await user.save();
    return pick(user.toJSON(), Object.keys(graphqlMongodbProjection(info)));
  },
};
