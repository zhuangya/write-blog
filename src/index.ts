import { promises as fs, copyFile } from 'fs';
import { join } from 'path';

import {Command, flags} from '@oclif/command'
import {safeDump} from 'js-yaml';
import slugify from 'slugify';
import { prompt } from 'inquirer';
import * as chalk from 'chalk';

interface Answer {
  date?: string;
  tags?: string;
  slug: string;
  title: string;
}

interface Conf {
  markdownExtension: string;
  srcDirectory: string;
}

const required = (input:string): boolean => input.length > 0;

const promptQuestions = async (prefilledAnswers: Answer): Promise<Answer> => {
  const questions = [{
    name: 'title',
    type: 'input',
    message: 'Blog Title',
    validate: required,
  }, {
    name: 'slug',
    type: 'input',
    message: 'slug',
    validate: required,
    default: slugify(prefilledAnswers.title || ''),
  }, {
    name: 'tags',
    type: 'input',
    message: 'tags, separate by comma',
  }, {
    name: 'date',
    type: 'input',
    message: 'date',
    default: new Date().toISOString(),
  }].filter(({ name }) => Boolean(!prefilledAnswers[name as keyof Answer]));

  const promptAnswers = await prompt(questions);

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
    const conf = await fs.readFile(confPath, 'utf-8');

    return JSON.parse(conf as string);
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

    try {
      const { } = await fetchConf();
    } catch (e) {

      console.log(chalk.red('Conf file not exist'));

      await writeConfGuide();
    }

    const prefilledAnswers:Answer = {
      date: flags.date,
      slug: flags.slug || '',
      tags: flags.tags || '',
      title: args.title,
    };

    const { title, ...frontmatter } = await promptQuestions(prefilledAnswers);

    this.log(title, frontmatter);
  }
}

export = ZhuangyaWriteBlog;
