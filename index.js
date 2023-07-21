require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Database and functions
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
let shortSchema = new mongoose.Schema({
  url: String,
  _id: Number
});
let short = mongoose.model('short', shortSchema);

// Check if the http url is valid
function isValidHttpUrl(urlString) {
  try {
    let url = new URL(urlString);
    console.log("protocol: " + url.protocol);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}
// Get random number for id
function getRandomNum() {
  return Math.floor(Math.random() * 1000);
}
// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/shorturl', (req, res) => {
  console.log(req.body.url);
  let post_url = req.body.url;
  if (isValidHttpUrl(req.body.url)) {
    let urlNew = new short({
      url: post_url,
      _id: getRandomNum()
    });
    urlNew.save().then(() => {
      console.log("post_url: " + post_url);
      console.log("short_url: " + urlNew._id);
      res.json({ original_url: post_url, short_url: urlNew._id });
    }).catch((err) => {
      console.log(err);
    });
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  let shortId = parseInt(req.params.id);
  console.log("id: " + shortId);
  short.findById(shortId).then((urlInfo) => {
    res.redirect(urlInfo.url);
  }).catch((err) => {
    console.log(err);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
