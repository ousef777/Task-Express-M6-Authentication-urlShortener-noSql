const User = require("../../models/User");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION_MS } = require('../../config/keys');
exports.signup = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;
    const newUser = await User.create(req.body);
    console.log('exports.signup -> hashedPassword', hashedPassword);
    const token = generateToken(newUser);
    res.status(201).json({token: token});
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res) => {
  try {
    const returningUser = await User.findOne({username: req.body.username});
    const token = generateToken(returningUser);
    res.status(200).json({token: token});
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("urls");
    res.status(201).json(users);
  } catch (err) {
    next(err);
  }
};

const generateToken = (user) => {
  let payload = {
    username: user.username,
    _id: user._id,
    exp: Date.now() + parseInt(JWT_EXPIRATION_MS)
  };
  return jwt.sign(JSON.stringify(payload), JWT_SECRET);
}
