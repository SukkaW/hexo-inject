'use strict';

const Register = {
  register() {
    const { hexo } = this;
    const { filter } = hexo.extend;
    hexo.inject = this;
    filter.register('after_render:html', this._transform.bind(this));
    filter.register('after_init', () => {
      hexo.log.debug('[hexo-inject] firing inject_ready');
      hexo.execFilter('inject_ready', this, { context: hexo });
    });
    this.router.register();
  }
};

module.exports = Register;
