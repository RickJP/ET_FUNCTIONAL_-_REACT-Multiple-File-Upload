const express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  {v4: uuidv4} = require('uuid'),
  router = express.Router();

const DIR = './public';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, uuidv4() + '-' + filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpeg and .jpeg formats allowed'));
    }
  },
});

const User = require('../models/User');

router.post(
  '/upload-images',
  upload.array('imgCollection', 6),
  (req, res, next) => {
    const reqFiles = [];
    const url = req.protocol + '://' + req.get('host');
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + '/public/' + req.files[i].filename);
    }

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      imgCollection: reqFiles,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'Done upload!',
          userCreated: {
            _id: result._id,
            imgCollection: result.imgCollection,
          },
        });
      })
      .catch((err) => {
        console.log(err),
          nullres.status(500).json({
            error: err,
          });
      });
  },
);

router.get('/', (req, res, next) => {
  User.find().then((data) => {
    res.status(200).json({
      message: 'User list retrieved successfully!',
      users: data,
    });
  });
});

module.exports = router;
