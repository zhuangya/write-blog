import { promises as fs, copyFile } from 'fs';
import { join } from 'path';

import {Command, flags} from '@oclif/command'
import {safeDump} from 'js-yaml';
import slugify from 'slugify';
import { prompt } from 'inquirer';
import * as makedir from 'make-dir';
import * as open from 'open-editor';

import type { Conf, Answer, BlogPath } from '../type';
import { oops, required, getBlogPathByConf, getBlogQuestions, promptQuestions, writeConfGuide, fetchConf, writeContent } from './lib';

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

    const prefilledAnswers:Answer = {
      date: flags.date || new Date().toISOString(),
      slug: slugify(flags.slug || ''),
      tags: flags.tags || '',
      title: args.title,
    };

    let conf = {} as Conf;

    try {
      conf = await fetchConf();
    } catch (e) {
      oops('Conf file not exist');
      conf = await writeConfGuide();
    }

    const getBlogPath = getBlogPathByConf(conf);
    const frontmatter = await promptQuestions(prefilledAnswers);
    const { title, slug, date } = frontmatter;
    const { dir, base } = getBlogPath(slug, date);
    const blogFile = await writeContent(frontmatter, dir, base);

    await open([blogFile]);
  }
}

export = ZhuangyaWriteBlog;
