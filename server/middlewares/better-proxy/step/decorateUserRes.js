'use strict';

const as = require('../lib/as.js');
const zlib = require('zlib');

// 判断是否是 gzip 压缩
function isResGzipped(res) {
  return res.header['content-encoding'] === 'gzip';
}

// 如果是压缩过的就解压
function zipOrUnzip (method) {
  return function (rspData, res) {
    return (isResGzipped(res)) ? zlib[method](rspData) : rspData;
  }
}

const maybeUnzipResponse = zipOrUnzip('gunzipSync');
const maybeZipResponse = zipOrUnzip('gzipSync');

function verifyBuffer(rspd, reject) {
  if (!Buffer.isBuffer(rspd)) {
    return reject
  }
}

function updateHeaders(ctx, rspdBefore, rspdAfter, reject) {
  if (!ctx.headerSent) {
    ctx.set('content-length', rspdAfter.length);
  } else if (rspdAfter.length !== rspdBefore.length) {
    const error = '"Content-length" is already sent, ' +
      'the length of response data can not be changed';
    return reject(new Error(error));
  }
}

function decorateProxyResBody(container) {
  if (container.user.ctx.status === 504) {
    // 如果是 504 直接返回
    return Promise.resolve(container);
  }

  const resolverFn = container.options.userResDecorator;
  if (!resolverFn) {
    // 如果没有提供修改 res 的参数，直接返回
    return Promise.resolve(container);
  }

  const proxyResData = maybeUnzipResponse(container.proxy.resData, container.proxy.res);
  const proxyRes = container.proxy.res;
  const ctx = container.user.ctx;

  return Promise
    .resolve(resolverFn(proxyRes, proxyResData, ctx))
    .then(function (modifiedResData) {
      return new Promise(function(resolve, reject) {
        const rspd = as.buffer(modifiedResData, container.options);
        verifyBuffer(rspd, reject);
        updateHeaders(ctx, proxyResData, rspd, reject);
        container.proxy.resData = maybeZipResponse(rspd, container.proxy.res);
        resolve(container);
      })
    })
}

module.exports = decorateProxyResBody;