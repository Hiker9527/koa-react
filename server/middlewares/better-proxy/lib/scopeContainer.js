'use strict'

const resolveOptions = require('../lib/resolveOptions');

function Container(ctx, host, userOptions) {
  return {
    user: {
      ctx: ctx,
    },
    proxy: {
      req: {},
      res: {},
      resData: undefined, // from proxy res
      bodyContent: undefined, // for proxy req
      reqBuilder: {},
    },
    options: resolveOptions(userOptions),
    params: {
      host: host,
      userOptions: userOptions
    }
  };
}

module.exports = Container;