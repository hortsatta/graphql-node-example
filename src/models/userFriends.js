import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.ObjectId;

const UserFriendSchema = Schema({
  user_id_a: {
    type: ObjectId
  },
  user_id_b: {
    type: ObjectId
  },
  level: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const UserFriend = mongoose.model('UserFriend', UserFriendSchema);

