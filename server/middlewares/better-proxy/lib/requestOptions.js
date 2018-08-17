'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const getRawBody = require('raw-body');
const isUnset = require('./isUnset');


// 这里是一个浅拷贝
function extend(obj, source, skips) {
  if (!source) {
    return obj;
  }

  for (const prop in source) {
    if (!skips || skips.indexOf(prop) === -1) {
      obj[prop] = source[prop];
    }
  }

  return obj;
}

function parseHost(Container) {
  let host = Container.params.host;
  const ctx = Container.user.ctx;
  const options = Container.options;
  host = (typeof host === 'function') ? host(ctx) : host.toString();

  if (!host) {
    return new Error('Empty host parameter');
  }

  if (!/http(s)?:\/\//.test(host)) {
    host = 'http://' + host;
  }

  const parsed = url.parse(host);

  if (!parsed.hostname) {
    return new Error('Unable to parse hostname, possibly missing protocol://?');
  }

  const ishttps = options.https || parsed.protocol === 'https:';

  return {
    host: parsed.hostname,
    port: parsed.port || (ishttps ? 443 : 80),
    module: ishttps ? https : http,
  };
}

function reqHeaders(ctx, options) {
  const headers = options.headers || {};

  const skipHdrs = [ 'connection', 'content-length' ];
  // 是否保持host，如果不保持就不赋值给 reqHdr;
  if (!options.preserveHostHdr) {
    skipHdrs.push('host');
  }

  const hds = extend(headers, ctx.headers, skipHdrs);
  hds.connection = 'close';

  return hds;
}

function createRequestoptions(ctx, options) {
  // prepare proxyRequest
  const reqOpt = {
    headers: reqHeaders(ctx, options),
    method: ctx.method,
    path: ctx.path,
  };

  if (options.preserveReqSession) {
    reqOpt.session = ctx.session;
  }

  return Promise.resolve(reqOpt);
}

function bodyContent (ctx, options) {
  const parseReqBody = isUnset(options.parseReqBody) ? true : options.parseReqBody;

  function maybeParseBody (ctx, limit) {
    if (ctx.request.body) {
      return Promise.resolve(ctx.request.body);
    } else {
      return getRawBody(ctx.req, {
        length: ctx.headers['content-length'],
        limit: limit
      });
    }
  }

  if (parseReqBody) {
    return maybeParseBody(ctx, options.limit || '1mb');
  }
}


module.exports = {
  create: createRequestoptions,
  bodyContent: bodyContent,
  parseHost: parseHost
}
