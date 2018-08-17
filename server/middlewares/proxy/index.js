'use strict';

var ScopeContainer = require('./lib/scopeContainer');
const url = require('url');
const zlib = require('zlib');
const rp = require('request-promise');
const { isUnset } = require('./lib/utils')

const CONTENT_TYPES = {
  json: [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report'
  ],
  form: [
    'application/x-www-form-urlencoded',
  ],
  formData: [
    'multipart/form-data',
  ],
  text: [
    'text/plain',
    'text/xml'
  ]
}

// 解析host
function parseHost(container) {
  const ctx = container.ctx;
  const options = container.params.options;
  let host = container.params.host;

  // 如果没有指定协议则默认是
  if (!/http(s)?:\/\//.test(host)) {
    host = 'http://' + host;
  }

  const parsed = url.parse(host);
  const ishttps = options.https || parsed.protocol === 'https:';
  return ({
    hostname: parsed.hostname,
    port: parsed.port || (ishttps ? 443 : 80),
    protocol: parsed.protocol
    
  })
}
/**
 * 解析代理配置，方便后续处理
 * @param {*} container 
 */
function buildProxyReq(container) {
  const ctx = container.ctx;
  const { options, host } = container.params;
  const { headers, method, path, query } = ctx;
  // console.log(query);
  // 解析host
  const hostParam = parseHost(container);

  //  请求参数
  const optsHeaders = options.headers || {}
  const reqOpt = {
    // ...hostParam,
    headers: {
      ...ctx.headers,
      ...optsHeaders,
    },
    url: `${hostParam.protocol}//${hostParam.hostname}:${hostParam.port}${path}`,
    method,
    qs: query,
    // gzip: true,
    encoding: null,
    timeout: 15000,
    resolveWithFullResponse: true,
  }
  // 保护session
  if (options.preserveReqSession) {
    reqOpt.session = ctx.session;
  }

  container.proxy.reqOpt = reqOpt;

  return Promise.resolve(container);
}

/**
 * 发送之前修改代理请求参数
 * 课修改的参数， path，method，header，host，port
 * @param {*} container 
 */
function decorateProxyReqOpts(container) {
  const reqOpt = container.proxy.reqOpt;
  let proxyReqOptDecorator = container.params.options.proxyReqOptDecorator;

  if (!isUnset(proxyReqOptDecorator) && typeof proxyReqOptDecorator === 'function') {
    const processedReqOpts = proxyReqOptDecorator(reqOpt, container.ctx);
    if (processedReqOpts) {
      container.proxy.reqOpt = processedReqOpts;
    }
  }
  return Promise.resolve(container);
}

/**
 * 发送请求
*/

function sendProxyRequest(container) {
  var ctx = container.ctx;
  var reqOpt = container.proxy.reqOpt;
  var options = container.params.options;
  return new Promise(function(resolve, reject) {

    if (ctx.is(CONTENT_TYPES.form)) {
      reqOpt.form = ctx.request.body
    }
    if (ctx.is(CONTENT_TYPES.formData)) {
      reqOpt.body = ctx.req;
    }
    if (ctx.is(CONTENT_TYPES.json)) {
      reqOpt.json = true;
      reqOpt.body = ctx.request.body;
    }

    // console.log(reqOpt);
    // 临时的处理办法，有些网站给了host会有问题
    delete reqOpt.headers.host;
    // resolve(container);
    const proxyReq = rp(reqOpt).then((res) => {
      container.proxy.res = res;
      container.proxy.req = proxyReq;
      // console.log(res.headers);
      resolve(container);
    }).catch((err) => {
      // Object.keys(err.headers).forEach((key) => {
      //   ctx.set(key, err.headers[key])
      // });
      resolve(container);
      // reject(err);
    })
  })
}

/**
 * 
 * @param {*} userOptions 
 */

 function sendUserResp (container) {
  if (!container.ctx.headerSent && container.ctx.status !== 504) {
    const { body, headers, statusCode } = container.proxy.res;
    const { reqOpt } = container.proxy;

    const ctx = container.ctx;
    ctx.status = statusCode;
    if (!reqOpt.withCookie && headers['set-cookie']) {
      delete headers['set-cookie'];
    }
    if (headers['transfer-encoding']) {
      delete headers['transfer-encoding'];
    }
    ctx.set({ ...headers });
    container.ctx.body = container.proxy.res.body;
  }
  return Promise.resolve(container);
 }

module.exports = function proxy(userOptions) {
  return async (ctx, next) => {
    var container = new ScopeContainer(ctx, userOptions);
    container = await buildProxyReq(container);
    container = await sendProxyRequest(container);
    await sendUserResp(container);
    // ctx.body = 'Hello World';
    // await next();
    // container = await decorateProxyReqOpts(container);
  };
};