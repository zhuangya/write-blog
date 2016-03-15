'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');

const lib = require('../lib');

const entryTitle = process.argv.slice(2).join(' ');

try {
  mkdirp.sync('_posts');
  fs.writeFileSync(lib.generateFilename(entryTitle), lib.writeSkeleton(entryTitle));
} catch (e) {
  console.error(e);
  process.exit(1);
}
