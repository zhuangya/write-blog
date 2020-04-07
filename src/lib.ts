import type { Conf, Answer, BlogPath } from '../type';
import slugify from 'slugify';
import * as chalk from 'chalk';

export const required = (input:string): boolean => input.length > 0;

export const getBlogPathByConf = (conf: Conf) => (slug: string):BlogPath => {
  const { ext, dir } = conf;
  const base = `${slug}.${ext}`;

  return {
    dir,
    base
  }
};

export const oops = (msg: string) => console.error(chalk.red(msg));

export const getBlogQuestions = (prefilledAnswers: Answer) => {
   return ([{
    name: 'title',
    type: 'input',
    message: 'Blog Title*',
    validate: required,
  }, {
    name: 'slug',
    type: 'input',
    message: 'slug*',
    validate: required,
    default: slugify(prefilledAnswers.title || ''),
    transformer: (input: string) => slugify(input),
  }, {
    name: 'tags',
    type: 'input',
    message: 'tags, separate by comma (optional)',
  }, {
    name: 'date',
    type: 'input',
    message: 'date*',
    default: new Date().toISOString(),
  }].filter(({ name }) => Boolean(!prefilledAnswers[name as keyof Answer])));
};
