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
}, {
  timestamps: true
});

const User = mongoose.model('Userinfo', userSchema);

export default User;