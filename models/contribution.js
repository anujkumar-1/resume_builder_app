import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userinfo',
    required: true
  },
  idempotent_key:{
    type:String,
    unique: true, 
  },
  payment_status: {
    type: String,
    default: "pending",
    enum: ['pending', 'success', 'failed'], 
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

