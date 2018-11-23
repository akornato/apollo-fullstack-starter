const mongoose = require('mongoose');

function createConnection({ dbURI, user, password }) {
  const dbConn = mongoose.createConnection(dbURI, {
    auth: user
      ? {
          user,
          password,
        }
      : undefined,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 5000,
    useNewUrlParser: true,
  });

  let connectedBefore = false;

  dbConn.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
    connectedBefore = true;
  });
  dbConn.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
  });
  dbConn.on('disconnected', function() {
    console.log('Mongoose disconnected');
    if (!connectedBefore) {
      // auto reconnect only works if first connect is successful
      console.log('Shutting down due to first connect MongoError');
      process.exit(0);
    }
  });
  function gracefulShutdown(msg, callback) {
    dbConn.close(function() {
      console.log('Mongoose disconnected through ' + msg);
      callback();
    });
  }
  // For nodemon restarts
  process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
  // For app termination
  process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
      process.exit(0);
    });
  });
  // For Heroku app termination
  process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app shutdown', function() {
      process.exit(0);
    });
  });

  return dbConn;
}

const dbConn = createConnection({
  dbURI: process.env.MONGO_URI,
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PASS,
});

module.exports = { dbConn };
