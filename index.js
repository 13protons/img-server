const express = require('express');
const Jimp = require("jimp");
const app = express();
const url = require('url');
const _ = require('lodash');
const apicache = require('apicache');
const PORT = process.env.PORT || 1337

let cache = apicache.middleware

app.get('/cover', cache('1 hour'), function (req, res) {
  // res.send('GET request to the homepage')
  if (req.query && hasValidUrl(req.query)) {
    Jimp.read(req.query.url, function (err, image) {
      if (err) {
        return res.status(400).send('Could not get url - ' + req.query.url + ' - ' + err);
      }
      let params = normalizeParams(req.query);
      console.log('covering: ', req.query.url, params);
      image.cover(params.w, params.h);

      if (params.color) {
        image.color([
          { apply: 'mix', params: ['#' + params.color, params.amount] }
        ]);
      }
      image.quality(params.q);
      image.getBuffer(Jimp.MIME_JPEG, (err, buffer)=>{
        if (err) {
          res.status(500).send('Could not process image ' + err);
        }
        res.send(buffer);
      });
    });
  } else {
    return res.status(404).send('Valid url parameter "url" not provided: ' + req.params.url);
  }
});

function normalizeParams(params) {
  let result = {};
  ints = {
    w: Jimp.AUTO,
    h: Jimp.AUTO,
    q: 70,
    amount: 0
  }

  strings = {
    color: false
  }

  _(ints).forEach((val, key) => {
    result[key] = parseInt(params[key]) || val;
  });

  _(strings).forEach((val, key) => {
    try {
      let item = params[key].toString() || val;
      console.log('item', key, val, item);
      if (item) {
        result[key] = item;
      }
    } catch(e) {

    }
  });

  return result;
}

function hasValidUrl(params) {
  if (!params.url) {
    return false;
  }
  const myURL = url.parse(params.url);
  console.log('url protocol', myURL.protocol);
  return Boolean(myURL.protocol);
}

console.log(`listening on http://localhost:${PORT}`)
app.listen(PORT);
// image.contain( w, h[, alignBits || mode, mode] );    // scale the image to the given width and height, some parts of the image may be letter boxed
// image.cover( w, h[, alignBits || mode, mode] );      // scale the image to the given width and height, some parts of the image may be clipped
// image.resize( w, h[, mode] );     // resize the image. Jimp.AUTO can be passed as one of the values.
