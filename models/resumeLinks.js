import mongoose from 'mongoose';

const resumeLinksSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userinfo',
    required: true
  },
  
  links: [String]
}, {
  timestamps: true
});

const resumeLinks= mongoose.model('resumelink', resumeLinksSchema);

export default resumeLinks;
