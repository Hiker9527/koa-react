'use strict';

const as = require('../lib/as');

function getContentLength(body) {
  let result;
  if (Buffer.isBuffer(body)) {
    result = body.length;
  } else if (typeof body === 'string') {
    result = Buffer.byteLength(body);
  }
  
  return result;
}


function prepareProxyReq(container) {
  return new Promise(function(resolve) {
    let bodyContent = container.proxy.bodyContent;
    const reqOpt = container.proxy.reqBuilder;

    if (bodyContent) {
      bodyContent = container.options.reqAsBuffer ?
        as.buffer(bodyContent, container.options) :
        as.bufferOrString(bodyContent);
    
      reqOpt.headers['content-length'] = getContentLength(bodyContent);

      if (container.options.reqBodyEncoding) {
        reqOpt.headers['accept-charset'] = container.options.reqBodyEncoding;
      }
    }

    container.proxy.bodyContent = bodyContent;
    resolve(container);
  });
}

module.exports = prepareProxyReq;