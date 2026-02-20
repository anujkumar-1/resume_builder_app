import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userinfo',
    required: true
  },
  summary: String, // Single string value
  experiences: [{ // Array of experiences
    role: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
    experienceId: String
  }],
  education: [{ // Array of education entries
    degree: String,
    field: String,
    institution: String,
    year: String,
    educationId: String
  }],
  skills: String, // Single string value
  languages: { // Single object
    name: String,
    proficiency: {
      type: String,
      enum: ['Basic', 'Intermediate', 'Fluent', 'Native'],
    }
  },
  certificates: { // Single object
    name: String,
    issuer: String,
    date: String,
    credentialId: String,
    url: String
  },
  awards: { // Single object
    title: String,
    issuer: String,
    date: String,
    description: String
  },

  intrests:String,

  projects: [{ // Array of experiences
    title: String,
    description: String,
    startDate: String,
    endDate: String,
    summary: String,
    projectId: String
  }],

}, {
  timestamps: true
});

const Resume = mongoose.model('resumebuilder', resumeSchema);

export default Resume;