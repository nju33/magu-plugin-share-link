import postcss from 'postcss';
import cssnano from 'cssnano';

export default class CssBuilder {
  constructor(classNames) {
    this.root = postcss.root();
    this.rules = {};

    Object.keys(classNames).forEach(key => {
      this.rules[key] = postcss.rule({selector: `.${classNames[key]}`});
      this.root.append(this.rules[key]);
    });
  }

  // cloneRule(rule, override) {
  //   this.rules[override.selector] = rule.cloneAfter(override);
  //   this.rules[override.selector].removeAll();
  //   return this.rules[override.selector];
  // }

  decl(obj) {
    return postcss.decl(obj);
  }

  async build() {
    const {css} = await cssnano.process(this.root.toString());
    return css;
  }
}
