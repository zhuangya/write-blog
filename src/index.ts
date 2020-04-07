import { promises as fs, copyFile } from 'fs';
import { join } from 'path';

import {Command, flags} from '@oclif/command'
import {safeDump} from 'js-yaml';
import slugify from 'slugify';
import { prompt } from 'inquirer';
import * as makedir from 'make-dir';

import type { Conf, Answer, BlogPath } from '../type';
import { oops, required, getBlogPathByConf, getBlogQuestions } from './lib';

const promptQuestions = async (prefilledAnswers: Answer): Promise<Answer> => {
  const promptAnswers = await prompt(getBlogQuestions(prefilledAnswers));

  return {
    ...prefilledAnswers,
    ...promptAnswers,
  };
};

const writeConfGuide = async ():Promise<Conf> => {
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

const fetchConf = async (): Promise<Conf> => {
  try {
    const confPath = join(process.cwd(), '.write-blog.json');
    const conf = await fs.readFile(confPath, { encoding: 'utf8' });

    return JSON.parse(conf.toString());
  } catch (e) {
    throw new Error('conf not exist or broken');
  }
};

class ZhuangyaWriteBlog extends Command {
  static description = 'it\'s time to write blog';

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    slug: flags.string({char: 's', description: 'slug'}),
    tags: flags.string({char: 'l', description: 'tags'}),
    date: flags.string({char: 'd', description: 'date'}),
  };

  static args = [{name: 'title'}];

  async run() {
    const {args, flags} = this.parse(ZhuangyaWriteBlog)

    let conf = {} as Conf;

    try {
      conf = await fetchConf();
    } catch (e) {
      oops('Conf file not exist');
      conf = await writeConfGuide();
    }

    const getBlogPath = getBlogPathByConf(conf);

    const prefilledAnswers:Answer = {
      date: flags.date,
      slug: slugify(flags.slug || ''),
      tags: flags.tags || '',
      title: args.title,
    };

    const frontmatter = await promptQuestions(prefilledAnswers);

    const { title, slug } = frontmatter;

    const { dir, base } = getBlogPath(slug);

    await makedir(dir);

    const content = ['---', safeDump(frontmatter), '---', ''].join('\n');

    await fs.writeFile(join(dir, base), content, { encoding: 'utf8', flag: 'wx' });

    this.log(join(dir, base));
  }
}

export = ZhuangyaWriteBlog;
