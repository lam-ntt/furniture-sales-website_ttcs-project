const {expressjwt} = require('express-jwt');

function authJwt(){
  return expressjwt({
    secret: process.env.SECRET_KEY,
    algorithms: ['HS256']
  });
}

module.exports = authJwt;