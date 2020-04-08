import type { Conf, Answer, BlogPath } from '../type';
import { join } from 'path';
import slugify from 'slugify';
import * as chalk from 'chalk';
import { format } from 'date-fns';

export const required = (input:string): boolean => input.length > 0;

export const getBlogPathByConf = (conf: Conf) => (slug: string, date: string):BlogPath => {
  const { ext, dir, timeFormatString='yyyy/MM' } = conf;
  const base = `${slug}.${ext}`;

  const time = new Date(date);

  return {
    dir: join(dir, format(time, timeFormatString)),
    base
  }
};

export const oops = (msg: string) => console.error(chalk.red(msg));

export const getBlogQuestions = (prefilledAnswers: Answer) => {
   return [{
    name: 'title',
    type: 'input',
    message: 'Blog Title*',
    validate: required,
    when: !Boolean(prefilledAnswers.title),
  }, {
    name: 'slug',
    type: 'input',
    message: 'slug*',
    validate: required,
    default: slugify(prefilledAnswers.title || ''),
    transformer: (input: string) => slugify(input),
    filter: (input: string) => slugify(input),
    when: !Boolean(prefilledAnswers.slug),
  }, {
    name: 'tags',
    type: 'input',
    message: 'tags, separate by comma (optional)',
    when: !Boolean(prefilledAnswers.tags),
  }, {
    name: 'date',
    type: 'input',
    message: 'date*',
    default: new Date().toISOString(),
    when: !Boolean(prefilledAnswers.date),
  }];
};
