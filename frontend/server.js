const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const PORT = process.env.PORT || 8080;
const root = path.join(__dirname, 'build');

const app = express();

app
  .use(morgan('dev'))
  .use(compression())
  .use(express.static(root))
  .use((req, res) => res.sendFile('index.html', { root }))
  .listen(PORT, err => {
    if (err) throw err;
    console.log(`Server is listening on ${PORT}`);
  });
