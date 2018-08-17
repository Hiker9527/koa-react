'use strict'

const requestOptions = require('../lib/requestOptions');

function buildProxyReq(Container) {
  const ctx = Container.user.ctx;
  const options = Container.options;
  const host = Container.proxy.host;
  
  const parseBody = (!options.parseReqBody) ? Promise.resolve(null) : requestOptions.bodyContent(ctx, options);
  const createReqOptions = requestOptions.create(ctx, options, host);

  return Promise
    .all([parseBody, createReqOptions])
    .then(function (responseArray) {
      // request body
      Container.proxy.bodyContent = responseArray[0];
      // request headers
      Container.proxy.reqBuilder = responseArray[1];
      return Container;
    })
}

module.exports = buildProxyReq;