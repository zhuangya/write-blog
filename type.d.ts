export interface Answer {
  date: string;
  tags?: string;
  slug: string;
  title: string;
}

export interface Conf {
  dir: string;
  ext: string;
  timeFormatString: string;
}

export interface BlogPath {
  dir: string;
  base: string;
}
