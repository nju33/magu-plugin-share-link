# magu-plugin-share-link

[Magu](https://github.com/nju33/magu) plugin that generate a link for sharing or introduction

[![Build Status](https://travis-ci.org/nju33/magu-plugin-share-link.svg?branch=master)](https://travis-ci.org/nju33/magu-plugin-share-link) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## Install

```bash
yarn add magu-plugin-share-link
npm install magu-plugin-share-link
```

## Usage

```js
magu({}, [shareLink({
  //
  // The following is the default setting
  //

  // Selector to be processed
  selector: 'share-link',

  // `List of classes used in alternativeElement
  classNames: {
    block: 'share-link__block',
    section: 'share-link__section',
    image: 'share-link__image',
    meta: 'share-link__meta',
    title: 'share-link__title',
    description: 'share-link__description'
  },

  // HTML to replace selector
  alternativeElement: `...`,

  // Pageres options
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

  // sizes for pageres.src
  imageSizes: ['1366x844'],

  // output dir for pageres.dest
  imageDest: null,

  // Dirname of image on server
  publicImageDir: '/'
})])
  .process(`${__dirname}/markdown.md`)
  .then(result => console.log(result.html));

```

## Example

If it is markdown like this

```md
<share-link href="https://github.com/"></share-link>

<share-link></share-link>
```

It will be

```html
<script>
  var style = document.createElement('style');
  style.innerHTML = '.share-link__block{display:block;text-decoration:none;color:inherit}.share-link__section{min-height:8em;position:relative}.share-link__image {position:absolute;width:320px;height:100%;background-size:cover}.share-link__meta{font-size:.9em;padding:.5em 1em .5em calc(320px + .5em)}.share-link__title{font-weight:700}.share-link__description{font-size:.8em}';
  document.head.appendChild(style);
</script>
<p>
  <a class="share-link__block" href="https://github.com/">
    <section class="share-link__section">
      <div class="share-link__image" style="background-image: url(/2017-01-20 - github.com-1366x844-cropped.png)"></div>
      <div class="share-link__meta">
        <div class="share-link__title">How people build software &#xB7; GitHub</div>
        <p class="share-link__description"></p>
      </div>
    </section>
  </a>
</p>
```

An href attribute is mandatory for the `<share-link/>` element. Please write the URL you want to share as href value. If there is no href attribute, delete the `<share-link/>` element without replacing it.

## License

The MIT License (MIT)

Copyright (c) 2016 nju33 <nju33.ki@gmail.com>
