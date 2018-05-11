import graphqlFields from 'graphql-fields';

import * as models from './models';
import * as loaders from './loaders';

// convert source._id as nodeId 
const resolveId = (source) => {
  if (!!source.__collectionName) {
    const nodeId = loaders.dbIdToNodeId(source._id, source.__collectionName);
    return nodeId;
  }
  return source._id;
}

// resolvers
export default {
  User: {
    _id: resolveId,
    friends: async (source) => {
      // check if query fields includes friends
      // then convert friends id to nodeId and return User row
      if (source.__friends) {        
        return source.__friends.map((row) => {
          const friendsNodeId = loaders.dbIdToNodeId(row.user_id, row.__collectionName);
          return loaders.getNodeById(friendsNodeId);
        });
      }

      // get User's friend ids then convert it to nodeId
      // and return User
      const friendsIds = await loaders.getFriendIdsForUser(source);
      return friendsIds.map((row) => {
        const friendsNodeId = loaders.dbIdToNodeId(row.user_id, row.__collectionName);
        return loaders.getNodeById(friendsNodeId);
      }); 
    },
    posts: async (source, args) => {
      // get User's post ids and pageInfo
      // declare edges with posts and cursor
      // return pageInfo and edges (contains cursor and posts)
      const { pageInfo, currentItems } = await loaders.getPostIdsForUser(source, args);      
      const edges = currentItems.map((row) => {
        const postNodeId = loaders.dbIdToNodeId(row._id, row.__collectionName);
        const cursor = row.__cursor;
        const node = loaders.getNodeById(postNodeId);
        return { cursor, node };
      });

      return { pageInfo, edges };
    }
  },
  Post: {
    _id: resolveId
  },
  Query: {
    // Node interface; check if query has friends
    // if true then return User with its friends
    // else then return User only
    // this is to decrease database queries (improves speed)
    node: (root, args, context, info) => {
      let hasFriends = false;
      const fields = graphqlFields((info), null, 2);

      Object.keys(fields).map((key) => {
        if (key.toString() === 'friends') {
          hasFriends = true;
        }
      });

      if (hasFriends) {
        return loaders.getUserNodeWithFriends(args.id);
      } else {
        return loaders.getNodeById(args.id);
      }      
    }
  },
  Mutation: {
    // create new user and return it
    createUser: async (root, args) => {
      const user = await new models.User(args).save();
      return user;
    }
  },
  Node: {
    // return User type or Post type
    __resolveType: (source) => {
      if (source.__collectionName === models.User.collection.name) {
        return 'User';
      }    
      
      return 'Post';
    }
  }
};