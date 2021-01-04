import { Command, flags } from '@oclif/command'
import slugify from 'slugify'

import { guide } from './guide'

import type { Answer } from '../type'

class ZhuangyaWriteBlog extends Command {
  static description = 'it\'s time to write blog'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    slug: flags.string({ char: 's', description: 'slug' }),
    tags: flags.string({ char: 'l', description: 'tags' }),
    date: flags.string({ char: 'd', description: 'date' })
  }

  static args = [{ name: 'title' }]

  async run (): Promise<void> {
    const { args, flags } = this.parse(ZhuangyaWriteBlog)

    const prefill: Answer = {
      date: flags.date ?? new Date().toISOString(),
      slug: slugify(flags.slug ?? '').toLowerCase(),
      tags: flags.tags ?? '',
      title: args.title
    }

    await guide(prefill)
  }
}

export = ZhuangyaWriteBlog
