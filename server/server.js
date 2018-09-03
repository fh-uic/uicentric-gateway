'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const mime = require('mime');
const sha256 = require('crypto-js/sha256');
const multer = require('multer');
const config = require('./config');
const { USERS } = require('./users');
const { FILES } = require('./files');

const PORT = process.env.PORT || 3000;

const USER_ID = 0;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Max-Age', 1000);
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Origin, Accept, X-Requested-With, X-Auth-Token, X-File-Name, X-File-Size, X-Index, X-Total, X-Hash'
  );
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

function getUserByEmail(email) {
  return USERS.find(user => user.email === email);
}

function returnSuccess(res, msg) {
  return res.status(200).json(msg);
}

function returnError(res, msg) {
  return res.status(422).json(msg);
}

app.get('/api', function(req, res) {
  res.end('API catcher example');
});

app.get('/api/auth/check', function(req, res) {
  if (!req.get('X-Auth-Token')) {
    return returnError(res, 'Token required!');
  }

  const oldToken = req.get('X-Auth-Token');

  jwt.verify(oldToken, config.secret, function(err, decoded) {
    if (err) {
      return returnError(res, 'Failed to authenticate token.');
    }

    const newToken = jwt.sign({ id: USER_ID }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    return returnSuccess(res, { auth: { id: USER_ID, expiresIn: 86400, accessToken: newToken } });
  });
});

app.get('/api/auth/:id/profile', function(req, res) {
  if (!req.get('X-Auth-Token')) {
    return returnError(res, 'Token required!');
  }

  const token = req.get('X-Auth-Token');

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return returnError(res, 'Failed to authenticate token!');
    }
    if (typeof req.params.id === 'undefined') {
      return returnError(res, 'User ID required!');
    }
    if (typeof decoded.id === 'undefined') {
      return returnError(res, 'User data missing!');
    }

    const userId = +req.params.id;

    if (decoded.id === userId && USERS[userId]) {
      return returnSuccess(res, {
        profile: {
          id: USERS[userId].id,
          name: USERS[userId].name,
          email: USERS[userId].email
        }
      });
    } else {
      return returnError(res, 'Invalid user ID!');
    }
  });
});

app.post('/api/auth/login', function(req, res) {
  if (typeof req.body.email === 'undefined') {
    return returnError(res, 'Email required!');
  }
  if (typeof req.body.password === 'undefined') {
    return returnError(res, 'Password required!');
  }

  const user = getUserByEmail(req.body.email);

  if (!user) {
    return returnError(res, "User doesn't exist!");
  }

  const isValid = bcrypt.compareSync(req.body.password, user.password);
  if (!isValid) {
    return returnError(res, 'Password is invalid!');
  }

  const newToken = jwt.sign({ id: user.id }, config.secret, {
    expiresIn: 86400 // expires in 24 hours
  });

  return returnSuccess(res, { auth: { id: user.id, expiresIn: 86400, accessToken: newToken } });
});

app.get('/api/auth/logout', function(req, res) {
  return returnSuccess(res, 'logged out');
});

/**
 *
 *
 */
const DIR = './uploads';

function getPublicFiles() {
  return FILES.filter(file => file.type === 'PUBLIC');
}

function getUserFiles() {
  return FILES.filter(file => file.type === 'PUBLIC' || file.type === 'USER');
}

function getAdminFiles() {
  return FILES.filter(
    file => file.type === 'PUBLIC' || file.type === 'USER' || file.type === 'ADMIN'
  );
}

app.get('/api/files', function(req, res) {
  if (!req.get('X-Auth-Token') || !req.get('X-Auth-Token').length) {
    return returnSuccess(res, getPublicFiles());
  }

  const token = req.get('X-Auth-Token');

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return returnError(res, 'Failed to authenticate token!');
    }
    if (typeof decoded.id === 'undefined') {
      return returnError(res, 'User data missing!');
    }

    const userId = decoded.id;

    if (USERS[userId]) {
      const user = USERS[userId];
      if (user.admin) {
        return returnSuccess(res, getAdminFiles());
      } else {
        return returnSuccess(res, getUserFiles());
      }
    } else {
      return returnError(res, 'Invalid user ID!');
    }
  });
});

app.get('/api/files/:name', function(req, res) {
  if (typeof req.params.name === 'undefined' || !req.params.name.length) {
    return returnError(res, 'File name required!');
  }

  const uniqueName = req.params.name;

  if (req.get('X-Auth-Token') && req.get('X-Auth-Token').length) {
    const token = req.get('X-Auth-Token');

    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return returnError(res, 'Failed to authenticate token!');
      }
      if (typeof decoded.id === 'undefined') {
        return returnError(res, 'User data missing!');
      }

      const userId = decoded.id;

      if (USERS[userId]) {
        const user = USERS[userId];
        let file;
        if (user.admin) {
          file = FILES.find(
            file =>
              file.unique_name === uniqueName &&
              (file.type === 'PUBLIC' || file.type === 'USER' || file.type === 'ADMIN')
          );
        } else {
          file = FILES.find(
            file =>
              file.unique_name === uniqueName && (file.type === 'PUBLIC' || file.type === 'USER')
          );
        }

        if (!file) {
          return returnError(res, 'No file found!');
        }

        return returnSuccess(res, file);
      } else {
        return returnError(res, 'Invalid user ID!');
      }
    });
  } else {
    const file = FILES.find(file => file.unique_name === uniqueName && file.type === 'PUBLIC');

    if (!file) {
      return returnError(res, 'No file found!');
    }

    return returnSuccess(res, file);
  }
});

app.get('/api/files/:name/download', function(req, res) {
  if (typeof req.params.name === 'undefined' || !req.params.name.length) {
    return returnError(res, 'File name required!');
  }

  const uniqueName = req.params.name;

  if (req.get('X-Auth-Token') && req.get('X-Auth-Token').length) {
    const token = req.get('X-Auth-Token');

    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return returnError(res, 'Failed to authenticate token!');
      }
      if (typeof decoded.id === 'undefined') {
        return returnError(res, 'User data is missing!');
      }

      const userId = decoded.id;

      if (USERS[userId]) {
        const user = USERS[userId];
        let file;
        if (user.admin) {
          file = FILES.find(
            file =>
              file.unique_name === uniqueName &&
              (file.type === 'PUBLIC' || file.type === 'USER' || file.type === 'ADMIN')
          );
        } else {
          file = FILES.find(
            file =>
              file.unique_name === uniqueName && (file.type === 'PUBLIC' || file.type === 'USER')
          );
        }

        if (!file) {
          return returnError(res, 'No file found!');
        }

        res.download(`${DIR}/${file.unique_name}`, file.name, function(err) {
          if (err) {
            return returnError(res, err);
          }
        });
      } else {
        return returnError(res, 'Invalid user ID!');
      }
    });
  } else {
    const file = FILES.find(file => file.unique_name === uniqueName && file.type === 'PUBLIC');

    if (!file) {
      return returnError(res, 'No file found!');
    }

    res.download(`${DIR}/${file.unique_name}`, file.name, function(err) {
      if (err) {
        return returnError(res, err);
      }
    });
  }
});

function filterData(req, file, cb) {
  if (!req.get('X-File-Name')) {
    return cb(new Error('File name is missing!'));
  }
  if (!req.get('X-File-Size')) {
    return cb(new Error('File size is missing!'));
  } else {
    const size = +req.get('X-File-Size');
    if (size === 0) {
      return cb(new Error('Empty file!'));
    }
  }
  if (!req.get('X-Index')) {
    return cb(new Error('Slice index is missing!'));
  }
  if (!req.get('X-Total')) {
    return cb(new Error('Slices total is missing!'));
  }
  if (!req.get('X-Hash')) {
    return cb(new Error('Hash is missing!'));
  }

  return cb(null, true);
}

// const upload = multer({ dest: DIR }).single('piece');
const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, DIR);
    },
    filename: function(req, file, cb) {
      const fileName = req.get('X-File-Name');
      const index = +req.get('X-Index');
      const total = +req.get('X-Total');

      cb(null, `${fileName}-${index}-${total}`);
    }
  }),
  fileFilter: function(req, file, cb) {
    return filterData(req, file, cb);
  }
}).single('piece');

app.post('/api/files', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return returnError(res, err.message);
    }

    if (!req.file || !Object.keys(req.file).length) {
      return returnError(res, 'Uploading failed!');
    }

    fs.readFile(req.file.path, function(err, data) {
      if (err) {
        return returnError(res, 'No temp file!');
      }

      const fileName = req.get('X-File-Name');
      const index = +req.get('X-Index');
      const total = +req.get('X-Total');
      const hash = req.get('X-Hash');

      let binary = '';
      const bytes = new Uint8Array(data);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const hash_tmp = sha256(binary).toString();
      if (hash !== hash_tmp) {
        return returnError(res, 'Hash is invalid!');
      }

      if (index > 0) {
        const tmpFileOld = `${DIR}/${fileName}-${index - 1}-${total}`;
        fs.appendFile(tmpFileOld, data, function(err, data) {
          if (err) {
            return returnError(res, 'File modifying failed!');
          }
          fs.rename(tmpFileOld, req.file.path, function(err) {
            if (err) {
              return returnError(res, 'File renaming failed!');
            }
            if (index === total - 1) {
              fs.rename(req.file.path, `${DIR}/${fileName}`, function(err) {
                if (err) {
                  return returnError(res, 'File renaming failed!');
                }
              });
            }
          });
        });
      } else {
        if (index === total - 1) {
          fs.rename(req.file.path, `${DIR}/${fileName}`, function(err) {
            if (err) {
              return returnError(res, 'File renaming failed!');
            }
          });
        }
      }

      return returnSuccess(res, {
        filename: fileName,
        index: index,
        total: total,
        percent: Math.ceil(((index + 1) * 100) / total)
      });
    });
  });
});

app.listen(PORT, function() {
  console.log('Working on port ' + PORT);
});
