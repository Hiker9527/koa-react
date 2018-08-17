'use strict';

const isUnset = require('../lib/isUnset');

function resolveBodyEncoding(reqBodyEncoding) {
  /**
   * 如果是 null，就将这个值传递过去，如果是 undefined 就默认指定 utf-8
   */
  return reqBodyEncoding !== undefined ? reqBodyEncoding : 'utf-8';
}

function resolveOptions(options) {
  // resolve user argument to program usable options
  options = options || {};

  return {
    proxyReqPathResolver: options.proxyReqPathResolver,
    proxyReqOptDecorator: options.proxyReqOptDecorator,
    proxyReqBodyDecorator: options.proxyReqBodyDecorator,
    userResDecorator: options.userResDecorator,
    filter: options.filte || defaultFilter,

    parseReqBody: isUnset(options.parseReqBody) ? true : options.parseReqBody,
    reqBodyEncoding: resolveBodyEncoding(options.reqBodyEncoding),
    headers: options.headers,
    preserveReqSession: options.preserveReqSession,
    https: options.https,
    port: options.port,
    reqAsBuffer: options.reqAsBufferm,
    timeout: options.timeout,
    limit: options.limit,
  }
}

// 默认返回true，允许所有的请求
function defaultFilter () {
  return true;
}

module.exports = resolveOptions;