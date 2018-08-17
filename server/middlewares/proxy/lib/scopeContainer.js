'use strict';
const resolveOptions = require('./resolveOptions');
const { typeVaild } = require('./utils');

function Container(ctx, userOptions) {
  const path = ctx.path;
  let matchedHost = '';
  let matchedOpts = {};
  if (Array.isArray(userOptions) && userOptions.length) {
    const len = userOptions.length;
    for (let i = 0; i < len; i++) {
      const rule = userOptions[i].rule;
      const userHost = typeVaild(userOptions[i].host, 'function') ? userHost(ctx) : userOptions[i].host;
      const userOpts = userOptions[i].options || {};

      if (!typeVaild(userHost, 'string')) {
        throw new Error('proxy ERR: host 必须是不为空的字符串');
      }
      // rule为空，所有的都使用这个host
      if (typeVaild(rule, 'undefined')) {
        matchedHost = userHost;
        matchedOpts = userOpts;
        break;
      }
        // rule是一个函数，返回true就匹配这个host
      if (typeVaild(rule, 'function')) {
        if (rule(ctx)) {
          matchedHost = userHost;
          matchedOpts = userOpts;
          break;
        }
      }
      // rule是一个正则表达式，用路径去匹配，
      if (typeVaild(rule, 'regexp')) {
        if (rule.test(path)) {
          matchedHost = userHost;
          matchedOpts = userOpts;
        }
      }
    }
  }

  return {
    ctx: ctx,
    proxy: {
      req: {},
      res: {},
      reqOpt: {},
    },
    params: {
      host: matchedHost,
      options: resolveOptions(matchedOpts)
    }
  };
}

module.exports = Container;
