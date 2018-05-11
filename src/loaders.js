import mongoose from 'mongoose';

import * as models from './models';

// define collection names object 
const collectionNames = {
  USER: models.User.collection.name,
  USERFRIEND: models.UserFriend.collection.name,
  POST: models.Post.collection.name
};

// split node id which is a combination of
// collection name and row _id
const splitNodeId = (nodeId) => {
  const [collectionName, dbId] = nodeId.split(':');
  return { collectionName, dbId };
};

// merge user's friends ids from UserFriend's collection
const mergeUserFriends = (arrayA, arrayB, collectionName) => {
  const listA = arrayA.map((row) => ({
    user_id: row.user_id_b,
    __collectionName: collectionName
  }));

  const listB = arrayB.map((row) => ({
    user_id: row.user_id_a,
    __collectionName: collectionName
  }));

  return [ ...listA, ...listB ];
};

// combine collection name and row _id to form node id
export const dbIdToNodeId = (dbId, collectionName) => {
  return `${collectionName}:${dbId}`;
};

// get row from collection by its node id
export const getNodeById = async (nodeId) => {
  const { collectionName, dbId } = splitNodeId(nodeId);
  let model;

  // find what collection the node belongs
  switch (collectionName) {
    case collectionNames.USER: {
      model = models.User;
      break;
    }
    case collectionNames.USERFRIEND: {
      model = models.UserFriend;
      break;
    }
    case collectionNames.POST: {
      model = models.Post;
    }
  }

  // find row by id, set private collectionName
  // then return row
  const item = await model.findById(dbId);
  item.__collectionName = collectionName;

  return item;
};

// query user with friends field included
export const getUserNodeWithFriends = async (nodeId) => {
  const { collectionName, dbId } = splitNodeId(nodeId);
  const model = models.User;

  // find the User by _id and its friends from UserFriend's collection
  const items = await model.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(dbId) }
    }, {
      $lookup: {
        from: models.UserFriend.collection.name,
        localField: '_id',
        foreignField: 'user_id_a',
        as: 'friendsA'
      }
    }, {
      $lookup: {
        from: models.UserFriend.collection.name,
        localField: '_id',
        foreignField: 'user_id_b',
        as: 'friendsB'        
      }
    }
  ]);  

  // if there are no matching rows then return null
  if (items.length === 0) { return null; }

  // create new object by the getting items first entry
  // add its collection's name and friends, then return
  const source = {
    _id: items[0]._id,
    first_name: items[0].first_name,
    last_name: items[0].last_name,
    created_at: items[0].created_at,
    updated_at: items[0].updated_at,
    __collectionName: collectionName,
    __friends: mergeUserFriends(items[0].friendsA, items[0].friendsB, collectionName)
  };

  return source;
};

// for friends within friends query
// get and return the User's friends ids
export const getFriendIdsForUser = async (source) => {
  const model = models.User;
  // find the User by _id and its friends from UserFriend's collection
  const items = await model.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(source._id) }
    }, {
      $lookup: {
        from: models.UserFriend.collection.name,
        localField: '_id',
        foreignField: 'user_id_a',
        as: 'friendsA'
      }
    }, {
      $lookup: {
        from: models.UserFriend.collection.name,
        localField: '_id',
        foreignField: 'user_id_b',
        as: 'friendsB'        
      }
    }, {
      $project: {
        friendsA: {
          level: 0, created_at: 0, updated_at: 0
        }
      }
    }
  ]);
  
  return mergeUserFriends(items[0].friendsA, items[0].friendsB, collectionNames.USER); 
};

// get all post (id) from a specific user
export const getPostIdsForUser = async (userSource, args) => {
  // set mongodb model
  const model = models.Post;
  // set query to find Post by user_id 
  const query = {
    user_id: mongoose.Types.ObjectId(userSource._id)
  };
  // get after and first arguments if supplied
  let { after, first } = args;  

  // if first is not defined then default it to 2
  if (!first) { first = 2; }

  // declare items for query
  // and check if after is supplied
  let items;
  if (after) {
    // split after to get post id and date (create_at)
    const [id, created_at] = after.split(':');
    // set query to get rows greated than 'created_at' date
    query.created_at = { $gte: new Date(created_at) };

    // execute mongoose query
    items = await model.find(query, { created_at: 1 })
      .sort({ created_at: 1 });
    
    // set start of items by matching id from 'after'
    // then slice it to limit results
    let i = 0;
    items.forEach((row, index) => {
      if (row._id.toString() === id) {
        i = index;
      }
    });

    items = items.slice(i + 1, first + 1);
  } else {
    // execute mongoose query, order by date and limit results
    items = await model.find(query, { created_at: 1 })
      .sort({ created_at: 1 })
      .limit(first + 1);
  }
  
  // set results to current batch
  const currentItems = items.slice(0, first);

  // set each item's private collectioName and its cursor
  currentItems.forEach((row) => {
    row.__collectionName = collectionNames.POST;
    row.__cursor = `${row._id}:${row.created_at}`;
  });

  // the reason limit (first) above has a '+ 1' is to check
  // if there are still row(s) past the limit
  const hasNextPage = items.length > first;
  const hasPreviousPage = false;

  // set pageInfo object to return
  const pageInfo = {
    hasNextPage,
    hasPreviousPage
  };

  // if currentItems has rows then declare object
  // and return it as PostsConnection
  if (currentItems.length > 0) {
    pageInfo.startCursor = currentItems[0].__cursor;
    pageInfo.endCursor = currentItems[currentItems.length - 1].__cursor;
  }

  console.log('currentItems', currentItems);

  return { pageInfo, currentItems };
};