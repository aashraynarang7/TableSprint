const mongoose = require('mongoose'); 

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB database'))
.catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  otp: { 
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
});

module.exports = mongoose.model('User', userSchema);
