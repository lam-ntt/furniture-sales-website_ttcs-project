const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authClient = (req, res, next) => {
  const {token} = req.cookies;
  if(token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const id = decoded.userId;
      req.userId = id;
      res.locals.isAuth = true;
    } catch(err) {
      console.log(err);
    }
  } else {
    res.locals.isAuth = false;
  }
  next();
}

const authManager = async (req, res, next) => {
  const {token} = req.cookies;
  if(token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const id = decoded.userId;

      const user = await User.findOne({_id: id});
      if(user.isAdmin) {
        req.userId = id;
        res.locals.isAuth = true;
      } else {
        res.locals.isAuth = false;
      }
    } catch(err) {
      console.log(err);
    }
  } else {
    res.locals.isAuth = false;
  }
  next();
}

module.exports = {authClient, authManager}