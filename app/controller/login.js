const path = require('path');

module.exports = {
  namespace: 'login',
  headers: {},
  routes: {
    'GET': async(ctx) => {
      await ctx.render('index.html');
    },
    'POST submit': async (ctx) => {
      const res = JSON.stringify({name: 'shawnwang'})
      ctx.body = {name: 'shawnwang'};
    }
  }
};