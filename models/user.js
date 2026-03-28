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
    default: "India"
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

  }
}, {
  timestamps: true
});

const User = mongoose.model('Userinfo', userSchema);

export default User;