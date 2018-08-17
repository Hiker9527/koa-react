'use strict';

const chunkLength = require('../lib/chunkLength');

function sendProxyRequest(Container) {
  const ctx = Container.user.ctx;
  const bodyContent = Container.proxy.bodyContent;
  const reqOpt = Container.proxy.reqBuilder;
  const options = Container.options;

  return new Promise(function (resolve, reject) {
    const protocol = Container.proxy.requestModule;

    const proxyReq = protocol.request(reqOpt, function(rsp) {
      // console.log(rsp);
      const chunks = [];
      rsp.on('data', function (chunk) { chunks.push(chunk) });
      rsp.on('end', function() {
        console.log(rsp.headers, 'end');
        Container.proxy.res = rsp;
        Container.proxy.resData = Buffer.concat(chunks, chunkLength(chunks));  // 返回一个完整的buffer
        resolve(Container);
      });
      rsp.on('error', reject);
    });

    proxyReq.on('socket', function(socket) {
      if (options.timeout) {
        socket.setTimeout(options.timeout, function() {
          proxyReq.abort();
        })
      }
    });

    proxyReq.on('error', function(err) {
      if (err.code === 'ECONNRESET') {
        ctx.set('X-Timeout-Reason', 'koa-better-http-proxy timed out your request after ');
        ctx.set('Content-Type', 'text/plain');
        ctx.status = 504;
        resolve(Container);
      } else {
        reject(err)
      }
    });

    if (options.parseReqBody) {
      if (bodyContent.length) {
        proxyReq.write(bodyContent);
      }
      proxyReq.end();
    } else {
      ctx.req.pipe(proxyReq);
    }

    ctx.req.on('aborted', function() {
      // reject?
        proxyReq.abort();
      });
  });
}

module.exports = sendProxyRequest;