import mongoose from 'mongoose';
require('dotenv').config();

import * as models from '../models';
import * as data from './data';

mongoose.connect(process.env.DB_HOST);

const { users, userFriends, posts } = data;

const convertData = () => {
  users.map((row, i) => {
    const _id = mongoose.Types.ObjectId(row._id);
    users[i]._id = _id;  
  });

  userFriends.map((row, i) => {
    const _id = mongoose.Types.ObjectId(row._id);
    const user_id_a =  mongoose.Types.ObjectId(row.user_id_a);
    const user_id_b =  mongoose.Types.ObjectId(row.user_id_b);
    userFriends[i]._id = _id;
    userFriends[i].user_id_a = user_id_a;
    userFriends[i].user_id_b = user_id_b;
  });

  posts.map((row, i) => {
    const _id = mongoose.Types.ObjectId(row._id);
    const user_id = mongoose.Types.ObjectId(row.user_id);
    posts[i]._id = _id;
    posts[i].user_id = user_id;
  });
};

const insertData = async () => {
  try {
    await models.User.insertMany(users);
    console.log('inserData -> Users:', { success: true });
    await models.UserFriend.insertMany(userFriends);
    console.log('inserData -> UserFriends:', { success: true });
    await models.Post.insertMany(posts);
    console.log('inserData -> Posts:', { success: true });
    console.log('Successfully inserted rows to database!');
  } catch(err) {
    console.log('ERROR:', err.message);
  }

  return process.exit();
};

convertData();
insertData();