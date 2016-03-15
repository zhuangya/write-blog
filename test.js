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
  t.is(lib.writeSkeleton('haha'), '---\nlayout: post\ntitle: haha\n---\n\n');
});
