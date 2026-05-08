import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userinfo',
    required: true
  },
  payment_status: {
    type: String,
    default: "pending"
  },
  payment_id: {
    type: String,
  },
  order_id:{
    type: String,
  },
  amount: {
    type: Number,
  },
  message:{
    type: String,
  },
}, {
  timestamps: true
});

export const Contributions = mongoose.model('Contribution', contributionSchema);

