import test from 'ava';
import lib from './lib';
import moment from 'moment';

test('normalize', t => {
  t.is(lib.normalize('1 2 3 4'), '1-2-3-4');
});

test('generateFilename', t => {
  const today = moment().format('YYYY-MM-DD');
  t.is(lib.generateFilename('doo'), `_posts/${today}-doo.md`);
});

test('writeSkeleton', t => {
  const publishTime = '2011-07-27 11:22:33 +0100';
  const blogEntryArray = lib.writeSkeleton('haha',publishTime).split('\n');
  const dateFiled = blogEntryArray.splice(4, 1)[0];

  t.is(blogEntryArray.join(''), '---layout: posttitle: hahacategories: __CHANGE_ME__---');
  t.ok(moment(dateFiled.split(': ')[1]).isSame(publishTime));
});
