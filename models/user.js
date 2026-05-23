import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },

  mobile:{
    type: String,
    default: "9999999999"
  }, 
  location:{
    type: String,
  },
  sub:{
    type: String,
    default: null

  },
  picture:{
    type: String,
    default: null


  },
  given_name:{
    type: String,
    default: null

  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },

  permissions: [
    { type: String }
  ],

}, {
  timestamps: true
});

export const User = mongoose.model('Userinfo', userSchema);
