

const check = (req, res, next) => {
  if (req.session && req.session.isReferred) {
    next()
  } else {
    res.render('./error')
  }
}

module.exports = check