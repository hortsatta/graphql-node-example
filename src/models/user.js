import mongoose, { Schema } from 'mongoose';

const UserSchema = Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const User = mongoose.model('User', UserSchema);