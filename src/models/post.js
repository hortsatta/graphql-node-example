import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.ObjectId;

const PostSchema = Schema({
  user_id: {
    type: ObjectId
  },
  body: {
    type: String
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

export const Post = mongoose.model('Post', PostSchema);