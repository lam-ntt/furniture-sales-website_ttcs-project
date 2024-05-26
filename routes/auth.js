const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {authClient} = require("../helpers/authJwt");
const mailTransport = require("../helpers/mailTrainsport");

const User = require('../models/User');

const route = express.Router();
route.use(authClient);

route.get('/register', (req, res) => {
  return res.render('./auth/register');
});

route.post('/register', async (req, res) => {
  let {name, email, phone, address, password} = req.body;

  let error = {}, ok = true;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  if(name === '' || email === '' || phone === '' || address === '' || password === ''){
    if(name === '') error.name = "Please fill out this field!";
    if(email === '') error.email = "Please fill out this field!";
    if(phone === '') error.phone = "Please fill out this field!";
    if(address === '') error.address = "Please fill out this field!";
    if(password === '') error.password = "Please fill out this field!";
    ok = false;
  }

  if(email !== '' && !emailRegex.test(email)) {
    error.email = "Invalid email format!";
    email = '';
    ok = false
  }
  if(phone !== '' && !phoneRegex.test(phone)) {
    error.phone = "Invalid phone format!";
    phone = '';
    ok = false;
  }
  if(password !== '' && password.length < 8) {
    error.password = "Length of password must longger than 8 characters";
    password = '';
    ok = false;
  }

  const user = await User.findOne({email:email});
  if(user) {
    error.email = "This email was taken!";
    email = '';
    ok = false;
  }

  if(ok) {
    const hashPassword = bcrypt.hashSync(password, 10);
    await User.create({name, email, phone, address, password: hashPassword});

    req.flash('success', 'Your account has been created successfully!')
    return res.redirect('/login');
  } else {
    password = '';
    const user = {name, email, phone, address, password};
    return res.render('./auth/register', {user, error});
  }

})

route.get('/login', (req, res) => {
  return res.render('./auth/login');
})

route.post('/login', async (req, res) => {
  let {email, password} = req.body;

  let error = {};
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if(email === ''){
    error.email = "Please fill out this field!";
  } else if(!emailRegex.test(email)) {
    error.email = "Invalid email format!";
    email = '';
  } else {
    const user = await User.findOne({email:email});
    if(!user) {
      error.email = "This email is not exist!";
      email = '';
    } else {
      if(password === '') {
        error.password = "Please fill out this field!";
      } else {
        if(bcrypt.compareSync(password, user.password)) {
          const token = jwt.sign(
            {userId: user._id}, 
            process.env.SECRET_KEY, 
            {
              algorithm: 'HS256',
              expiresIn: '1d'
            }
          );
  
          res.cookie(
            'token', token, 
            {httpOnly: true}
          );
          res.locals.isAuth = true;
          return res.redirect('/');
        } else {
          error.password = "Wrong password!";
        }

      }
    }
  }

  password = '';
  const user = {email, password};
  return res.render('./auth/login', {user, error});

})

route.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.locals.isAuth = false;
  return res.redirect('/');
})

route.get('/send-request', (req, res) => {
  return res.render('./auth/send-request');
})

route.post('/send-request', async (req, res) => {
  let {email} = req.body;

  let error = {};
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if(email === '') {
    error.email = "Please fill out this field!";
  } else if(!emailRegex.test(email)) {
    error.email = "Invalid email format!";
    email = '';
  } else {
    const user = await User.findOne({email:email});

    if(user){
      const token = jwt.sign(
        {userId: user._id}, 
        process.env.SECRET_KEY, 
        {expiresIn: '5m'}
      );

      const url = new URL(`http://localhost:3000/reset-password/${token}`);
      mailTransport.sendMail({
        from: 'noreply@gmail.com',
        to: user.email,
        subject: 'Reset Password',
        html: `<h2>Dear, ${user.name}!</h2>` + 
        `<p>We already have received a request to reset your password.</p>` + 
        `<p>If it were you, follow this link below to make a new password, else ignore this mail.</p>` + 
        `<a href="${url}">Reset password here</a>`
      });

      req.flash('success', 'Reset link has already sent to your email!')
      return res.redirect('/send-request');
    } else {
      error.email = "This email is not exist!";
      email = '';
    }

  }

  const user = {email}
  return res.render('./auth/send-request', {user, error});
})

route.get('/reset-password/:token', (req, res) => {
  const {token} = req.params;
  return res.render('./auth/reset-password', {token});
})

route.post('/reset-password/:token', async (req, res) => {
  const {token} = req.params;
  let {password, confirmPassword} = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const id = decoded.userId;

    let error = {};
    if(password === '') {
      error.password = "Please fill out this field!";
    } else if(password.length < 8) {
      error.password = "Length of password must longger than 8 characters";
      password = '';
    } else  {
      if(confirmPassword === '') {
        error.confirmPassword = "Please fill out this field!";
      } else if(confirmPassword !== password) {
        error.confirmPassword = "Confirm password does not match!";
      } else {
        await User.findByIdAndUpdate(
          {_id: id}, 
          {password: bcrypt.hashSync(password, 10)}
        )
  
        req.flash('success', 'Password has been updated successfully!');
        return res.redirect('/login');
      }
    }

    confirmPassword = '';
    const user = {password, confirmPassword};
    return res.render('./auth/reset-password', {user, error, token});
  } catch (err) {
    console.log(err);
    req.flash('fail', 'Reset link is expired!');
    return res.redirect('/send-request');
  }

})

module.exports = route;