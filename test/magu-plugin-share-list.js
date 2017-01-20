import fs from 'fs';
import test from 'ava';
import marked from 'marked';
import cheerio from 'cheerio';
import del from 'del';
import shareLink from '../dist/magu-plugin-share-link';

test.beforeEach(t => {
  t.context.md = fs.readFileSync(`${__dirname}/fixtures.md`, 'utf-8');
  t.context.$ = cheerio.load(marked(t.context.md));
});

test.afterEach(async () => {
  await del('./test/images/');
});

test('shareLink', async t => {
  const result = await shareLink({
    imageDest: './test/images/'
  })(t.context.$, cheerio);

  const html = result.html();
  const $ = cheerio.load(html);
  t.is($('script').length, 1);
  t.is($('.share-link__block').length, 1);

  t.regex(html, /<script>/);
  t.regex(html, /\.share-link__block/);
  t.regex(html, /\.share-link__section/);
  t.regex(html, /\.share-link__image/);
  t.regex(html, /\.share-link__meta/);
  t.regex(html, /\.share-link__title/);
  t.regex(html, /\.share-link__description/);
});
