'use strict';

const moment = require('moment');
const mkdirp = require('mkdirp');

function normalize (wat) {
  return wat.split(' ').join('-');
}

function generateFilename (title='blah', publishTime=new Date()) {
  return `_posts/${moment(publishTime).format('YYYY-MM-DD')}-${normalize(title)}.md`;
}

function writeSkeleton (title, publishTime=new Date(), type='post') {
  return `
---
layout: ${type}
title: ${title}
date: ${moment(publishTime).format('YYYY-MM-DD HH:mm:ss ZZ')}
categories: __CHANGE_ME__
---
`
}

module.exports = {
  normalize,
  generateFilename,
  writeSkeleton
};
