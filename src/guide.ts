import type { ParsedAnswer, Answer, Conf } from '../type'
import type { PathDescriptor } from 'line-column-path'
import { join } from 'path'
import { cli, IPromptOptions } from 'cli-ux'
import { promises as fs } from 'fs'
import slugify from 'slugify'
import { format } from 'date-fns'
import * as mkdir from 'make-dir'
import { safeDump } from 'js-yaml'
import * as open from 'open-editor'

async function promptWithPrefill<T=string> (prefill: T | undefined, question: string, options?: IPromptOptions): Promise<T> {
  if (typeof prefill === 'undefined') {
    return await cli.prompt(question, options)
  }

  return prefill
}

export const guide = async (prefill: Answer): Promise<string> => {
  const conf = await ensureConf()

  const title = await promptWithPrefill(prefill.title, 'Blog Title *')
  const slug = await promptWithPrefill(prefill.slug, 'Blog Slug *', { default: slugify(title).toLowerCase() })
  const tags = await promptWithPrefill(prefill.tags, 'Tags (Optional, separate by comma<,>)', { required: false })
  const date = await promptWithPrefill(prefill.date, 'Date', { default: new Date().toISOString() })

  const answer: ParsedAnswer = {
    title,
    slug,
    tags: tags.split(/,|，/),
    date
  }

  const blogFile = await writeBlogFile(conf, answer)

  open([blogFile])

  return blogFile.file
}

const ensureConf = async (): Promise<Conf> => {
  const confPath = join(process.cwd(), '.write-blog.json')

  return await fs.readFile(confPath, 'utf8')
    .then(confLiteral => JSON.parse(confLiteral.toString()) as Conf)
    .catch(async () => await createConfGuide(confPath))
}

const writeBlogFile = async (conf: Conf, answer: ParsedAnswer): PathDescriptor => {
  const blogDir = join(conf.dir, format(new Date(answer.date), conf.timeFormatString))
  await mkdir(blogDir)

  const blogFilePath = join(blogDir, `${answer.slug}.${conf.ext}`)

  const content = [
    '---',
    safeDump(answer),
    '---',
    ''
  ].join('\n')

  await fs.writeFile(blogFilePath, content, { encoding: 'utf8', flag: 'wx' })

  return {
    file: blogFilePath,
    line: content.split('\n').length + 1,
    column: 0
  }
}

const createConfGuide = async (confPath: string): Promise<Conf> => {
  const dir = await cli.prompt('[> conf] blog file source directory')
  const ext = await cli.prompt('[> conf] markdown file extension', { default: 'mdx' })
  const timeFormatString = await cli.prompt('[> conf] time format string', { default: 'yyyy/MM' })

  const conf = {
    dir, ext, timeFormatString
  }

  await fs.writeFile(confPath, JSON.stringify(conf, null, 2), { encoding: 'utf8', flag: 'wx' })

  return conf
}
