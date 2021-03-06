'use strict';
const map = require('lodash/map');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');

function resolve(o, ...args) {
  if (typeof o === 'function') return o(...args);
  return o;
}

const Content = {
  _resolveContent(src, { html, opts = { shouldInject: true } }) {
    html = resolve(html, src);
    const shouldInject = resolve(opts.shouldInject, src);
    return Promise.props({ html, shouldInject });
  },
  _resolveInjectionPoint(src, pos) {
    return Promise.map(this._injectors[pos], this._resolveContent.bind(this, src));
  },
  _buildHTMLTag: Promise.coroutine(function* (name, attrs, content = '', endTag, src) {
    [attrs, content] = yield Promise.all([
      Promise.props(mapValues(attrs, value => resolve(value, src))),
      resolve(content, src)
    ]);
    const attr_list = map(attrs, (value, key) => `${key}='${value}'`).join(' ');
    return `<${name} ${attr_list}>${endTag ? `${content}</${name}>` : ''}`;
  }),
  raw(pos, html, opts) {
    this._injectors[pos].push({ html, opts });
  },
  tag(pos, name, attrs, content, endTag, opts) {
    return this.raw(pos, this._buildHTMLTag.bind(this, name, attrs, content, endTag), opts);
  },
  script(pos, attrs, content, opts) {
    return this.tag(pos, 'script', attrs, content, true, opts);
  },
  style(pos, attrs, content, opts) {
    return this.tag(pos, 'style', attrs, content, true, opts);
  },
  link(pos, attrs, opts) {
    return this.tag(pos, 'link', attrs, '', false, opts);
  }
};

module.exports = Content;
