import test from 'ava';
import CssBuilder from '../dist/css-builder';

test('build', async t => {
  const cssBuilder = new CssBuilder({hoge: 'hoge'});

  t.truthy(cssBuilder.root);
  t.truthy(cssBuilder.rules.hoge);
  t.is(cssBuilder.rules.hoge.selector, '.hoge');

  cssBuilder.rules.hoge.append(
    cssBuilder.decl({prop: 'color', value: 'orange'})
  );
  t.is(await cssBuilder.build(), '.hoge{color:orange}');
});
