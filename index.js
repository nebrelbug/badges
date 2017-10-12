var express = require('express')
var app = express()
var swig = require('swig')
var path = require('path')
'use strict';
var PDFDocument = require('pdfkit');
let doc = new PDFDocument({size: 'A4', layout: 'landscape'});

// Attempt to use a particular font.
// callback: (optional) takes an error if it failed.
function loadFont(path, callback) {
  try {
    doc = doc.font(path);
    if (callback) { callback(null); }
  } catch(err) {
    doc = doc.font('Helvetica-Bold');
    if (callback) { callback(err); }
  }
}

doc = doc.fontSize(11);

function measure(str) {
  return doc.widthOfString(str);
}

module.exports = measure;
module.exports.loadFont = loadFont;
//End of that file

function escapeXml(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}
function addEscapers(data) {
  data.escapeXml = escapeXml;
  data.capitalize = capitalize;
}


app.get('/badge/:left/:right/:color', function (req, res) {
  let textWidth1 = (measure(req.params.left)|0);
  let textWidth2 = (measure(req.params.right)|0);
  var data = {
    format: 'svg',
    template: 'plastic',
    text: [req.params.left, req.params.right]
  };
  data.logoWidth = +data.logoWidth || (data.logo? 14: 0);
  console.log("data.logoWidth: " + data.logoWidth);
  data.logoPadding = (data.logo? 3: 0);
  data.widths = [textWidth1 + 10 + data.logoWidth + data.logoPadding, textWidth2 + 10]
  console.log("data.widths" + data.widths);
  addEscapers(data);

  var badge = swig.renderFile(path.join(__dirname, 'badge.svg'), data);

  res.writeHead(200, {"Content-Type": "image/svg+xml"})
  res.write(badge);
  res.end();
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Badge generator listening at http://%s:%s', host, port);
});
