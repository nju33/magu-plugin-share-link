import fs from 'fs';
import magu from 'magu';
import shareLink from '../dist/magu-plugin-share-link';

magu({}, [shareLink({
  imageDest: './example/dist/',
  publicImageDir: '/dist/'
})])
  .process(`${__dirname}/example.md`)
  .then(result => {
    console.log(result.html);
    fs.writeFileSync(`${__dirname}/index.html`, result.html, 'utf-8');
  });
