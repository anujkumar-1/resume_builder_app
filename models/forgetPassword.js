import mongoose from 'mongoose';

const forgetPasswordSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ForgetPassword = mongoose.model('ForgetPassword', forgetPasswordSchema);

export default ForgetPassword;
