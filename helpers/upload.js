const multer = require('multer')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/imeg': 'imeg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const isValid = FILE_TYPE_MAP[file.mimetype]
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype]

    cb(null,`${filename.slice(0, filename.length - 4)}-${Math.floor(Math.random() * 900) + 100}.${extension}`)
  }
})

const upload = multer({ storage: storage })

module.exports = upload