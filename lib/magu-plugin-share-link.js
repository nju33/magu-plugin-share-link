import path from 'path';
import Pageres from 'pageres';
import got from 'got';
import zip from 'lodash.zip';
import pupa from 'pupa';
import slugifyURL from 'slugify-url';
import CssBuilder from './css-builder';

const defaultOpts = {
  selector: 'share-link',
  classNames: {
    block: 'share-link__block',
    section: 'share-link__section',
    image: 'share-link__image',
    meta: 'share-link__meta',
    title: 'share-link__title',
    description: 'share-link__description'
  },
  alternativeElement: `
<a class="{classNames.block}" href="{href}">
  <section class="{classNames.section}">
    <div class="{classNames.image}" style="{imageStyle}"></div>
    <div class="{classNames.meta}">
      <div class="{classNames.title}">{title}</div>
      <p class="{classNames.description}">{description}</p>
    </div>
  </section>
</a>
  `,
  pageresOpts: {
    crop: true,
    scale: 0.23426,
    filename: (() => {
      if (process.env.NODE_ENV === 'dev') {
        return '<%=url%>';
      }
      return '<%= date %> - <%= url %>-<%= size %><%= crop %>';
    })()
  },
  imageSizes: ['1366x844'],
  imageDest: null,
  publicImageDir: '/'
};
export {defaultOpts};

export default function link(opts = {}) {
  opts = Object.assign({}, defaultOpts, opts);
  const cssBuilder = new CssBuilder(opts.classNames);
  cssBuilder.rules.block.append(
    cssBuilder.decl({prop: 'display', value: 'block'}),
    cssBuilder.decl({prop: 'text-decoration', value: 'none'}),
    cssBuilder.decl({prop: 'color', value: 'inherit'})
  );
  cssBuilder.rules.section.append(
    cssBuilder.decl({prop: 'min-height', value: '8em'}),
    cssBuilder.decl({prop: 'position', value: 'relative'})
  );
  cssBuilder.rules.image.append(
    cssBuilder.decl({prop: 'position', value: 'absolute'}),
    cssBuilder.decl({prop: 'width', value: '320px'}),
    cssBuilder.decl({prop: 'height', value: '100%'}),
    cssBuilder.decl({prop: 'background-size', value: 'cover'})
  );
  cssBuilder.rules.meta.append(
    cssBuilder.decl({prop: 'font-size', value: '.9em'}),
    cssBuilder.decl({
      prop: 'padding', value: '.5em 1em .5em calc(320px + .5em)'
    }),
  );
  cssBuilder.rules.title.append(
    cssBuilder.decl({prop: 'font-weight', value: 700})
  );
  cssBuilder.rules.description.append(
    cssBuilder.decl({prop: 'font-size', value: '.8em'})
  );

  return async ($, cheerio) => {
    const $shareLink = $(opts.selector);
    const pageres = new Pageres(opts.pageresOpts);
    pageres.dest(opts.imageDest);

    if (typeof opts.imageDest !== 'string') {
      console.log('[share-link] Specify opts.imageDest');
      $shareLink.each((idx, elem) => {
        $(elem).replaceWith('');
      });
      return $;
    }

    const $filtered = $shareLink.filter((idx, elem) => {
      const $elem = $(elem);
      const href = $elem.attr('href');
      if (!href) {
        const $parent = $elem.parent();
        if ($parent[0].name === 'p') {
          $parent.remove();
        } else {
          $elem.remove();
        }
        return false;
      }
      return href;
    });

    const requests = [];
    $filtered.each((idx, elem) => {
      const href = $(elem).attr('href');
      pageres.src(slugifyURL(href), opts.imageSizes);
      requests.push(got(href));
    });

    await Promise.all([Promise.all(requests), pageres.run()])
    .then(result => {
      const items = zip(result[0], result[1]);

      items.forEach((item, idx) => {
        const [request, capture] = item;
        const publicImagePath = path.join(
          opts.publicImageDir,
          capture.filename
        );

        const $requestBody = cheerio.load(request.body, {
          decodeEntities: false
        });
        const title = $requestBody('title').text();
        const description = $requestBody('meta[name=description]')
                              .attr('content');

        const elementString = pupa(opts.alternativeElement, {
          classNames: opts.classNames,
          href: request.requestUrl,
          title,
          description,
          imageStyle: cssBuilder.decl({
            prop: 'background-image',
            value: `url(${publicImagePath})`
          })
        });
        $($filtered.get(idx)).replaceWith(elementString);
      });
    });

    const css = await cssBuilder.build();

    $.root().prepend(`
<script>
  var style = document.createElement('style');
  style.innerHTML = '${css}';
  document.head.appendChild(style);
</script>
    `);

    return $;
  };
}
