'use strict';

function defaultDecorator(proxyReqOptBuilder /*, userReq */) {
  return proxyReqOptBuilder;
}

function decorateProxyReqOpt(container) {
  const resolverFn = container.options.proxyReqOptDecorator || defaultDecorator;

  return Promise
    .resolve(resolverFn(container.proxy.reqBuilder, container.user.ctx))
    .then(function (processedReqOpts) {
      delete processedReqOpts.param;
      container.proxy.reqBuilder = processedReqOpts;
      return Promise.resolve(container);
    })
}

module.exports = decorateProxyReqOpt;