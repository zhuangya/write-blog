import type { Conf, Answer, BlogPath } from '../type';
import { join } from 'path';
import slugify from 'slugify';
import {safeDump} from 'js-yaml';
import * as chalk from 'chalk';
import * as makedir from 'make-dir';
import { format } from 'date-fns';
import * as lcp from 'line-column-path';
import { promises as fs, copyFile } from 'fs';
import { prompt } from 'inquirer';
import type { PathLike } from 'line-column-path';

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

export const promptQuestions = async (prefilledAnswers: Answer): Promise<Answer> => {
  const promptAnswers = await prompt(getBlogQuestions(prefilledAnswers));

  return {
    ...prefilledAnswers,
    ...promptAnswers,
  };
};

export const writeConfGuide = async ():Promise<Conf> => {
  const questions = [{
    name: 'dir',
    type: 'input',
    message: '[conf] blog src directory',
    validate: required,
  }, {
    name: 'ext',
    type: 'input',
    message: '[conf] markdown file extension',
    validate: required,
    default: 'mdx',
  }];

  const conf = await prompt(questions) as Conf;
  await fs.writeFile(join(process.cwd(), '.write-blog.json'), JSON.stringify(conf));

  return conf;
}

export const fetchConf = async (): Promise<Conf> => {
  try {
    const confPath = join(process.cwd(), '.write-blog.json');
    const conf = await fs.readFile(confPath, { encoding: 'utf8' });

    return JSON.parse(conf.toString());
  } catch (e) {
    throw new Error('conf not exist or broken');
  }
};

export const writeContent = async (frontmatter: Answer, dir: string, base: string) => {
  const file = join(dir, base);

  await makedir(dir);
  const content = ['---', safeDump(frontmatter), '---', ''].join('\n');
  await fs.writeFile(join(dir, base), content, { encoding: 'utf8', flag: 'wx' });

  return lcp.stringify({
    file,
    line: content.split('\n').length + 1,
    column: 0
  });
}
