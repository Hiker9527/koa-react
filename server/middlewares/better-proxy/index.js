'use strict'

const ScopeContainer = require('./lib/scopeContainer');
const assert = require('assert');

const buildProxyReq                 = require('./step/buildProxyReq');
const decorateProxyReqOpts          = require('./step/decorateProxyReqOpts');
const sendProxyRequest              = require('./step/sendProxyRequest');
const resolveProxyHost              = require('./step/resolveProxyHost');
const resolveProxyReqPath           = require('./step/resolveProxyReqPath');
const prepareProxyReq               = require('./step/prepareProxyReq');
const sendUserRes                   = require('./step/sendUserRes');
const decorateUserRes               = require('./step/decorateUserRes');
const copyProxyResHeadersToUserRes  = require('./step/copyProxyResHeadersToUserRes');
const decorateProxyReqBody          = require('./step/decorateProxyReqBody');

module.exports = function proxy(host, userOptions) {
  assert(host, 'Host should not be empty');
  return function (ctx, next) {
    const container = new ScopeContainer(ctx, host, userOptions);

    if (!container.options.filter(ctx)) {
      return Promise.resolve(null).then(next);
    }

    return buildProxyReq(container)
      .then(resolveProxyHost)
      .then(decorateProxyReqOpts)
      // 修改请求路径，默认为原来的
      .then(resolveProxyReqPath)
      .then(decorateProxyReqBody)
      // 准备请求体
      .then(prepareProxyReq)
      // 准备就绪，正式发送请求
      .then(sendProxyRequest)
      .then(copyProxyResHeadersToUserRes)
      .then(decorateUserRes)
      .then(sendUserRes)
      .then((container) => {
        // console.log(container);
      })
      .then(next);
  }
}