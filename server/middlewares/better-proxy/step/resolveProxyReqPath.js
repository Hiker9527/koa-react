'use stirct';

const url = require('url');

function defaultProxyReqPathResolver(ctx) {
  return url.parse(ctx.url).path;
}

function resolveProxyReqPath(container) {
  const resolverFn = container.options.proxyReqPathResolver || defaultProxyReqPathResolver;

  return Promise
    .resolve(resolverFn(container.user.ctx))
    .then(function(resolvedPath) {
      container.proxy.reqBuilder.path = resolvedPath;
      return Promise.resolve(container);
    });
}

module.exports = resolveProxyReqPath;