const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.statusCode(200);
  res.set({
    'Content-Type': 'text/html',
  });

  fs.createReadStream(path.join(__dirname, ''))
  
})