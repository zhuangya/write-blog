'use strict';

const moment = require('moment');
const fs = require('fs');
const mkdirp = require('mkdirp');

function normalize (wat) {
  return wat.split(' ').join('-');
}

function generateFilename (title) {
  title = title || 'blah';
  return `_posts/${moment().format('YYYY-MM-DD')}-${normalize(title)}.md`;
}

function writeSkeleton (title, type) {
  type = type || 'post';
  return [
    '---',
    `layout: ${type}`,
    `title: ${title}`,
    '---',
    '',
    ''
  ].join('\n');
}

module.exports = {
  normalize: normalize,
  generateFilename: generateFilename,
  writeSkeleton: writeSkeleton
};
