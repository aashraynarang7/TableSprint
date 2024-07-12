const User = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('crypto').pbkdf2Sync; 
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); 

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
  });

  const mailOptions = {
    from: 'your_email@example.com', 
    to: email,
    subject: 'Your One-Time Password (OTP)',
    text: `Your OTP for login is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error('Error sending OTP email');
  }
};

const generatePasswordHash = (password) => {
  const salt = uuidv4();
  const hash = bcrypt(password, salt, 10000, 64, 'sha512').toString('hex');
  return {
    salt,
    hash,
  };
};

const createUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const { salt, hash } = generatePasswordHash(password);
    const otp = Math.floor(100000 + Math.random() * 900000); 
    const otpExpiresAt = Date.now() + 30 * 60 * 1000; 

    const newUser = new User({ email, passwordHash: hash, otp, otpExpiresAt });
    await newUser.save();

    await sendOTP(email, otp);

    res.status(201).json({ message: 'User created successfully. Check your email for OTP' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const authenticateUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or OTP' });
    }

    if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
      return res.status(401).json({ message: 'Invalid OTP or expired' });
    }

    const isValidPassword = bcrypt(req.body.password, user.salt, 10000, 64, 'sha512').toString('hex') === user.passwordHash;
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or OTP' });
    }

    const secret = process.env.JWT_SECRET; 
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '30m' }); 

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  authenticateUser,
};
