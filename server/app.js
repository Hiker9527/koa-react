const Koa = require("koa");
const path = require('path');
const convert = require("koa-convert");
const serve = require('koa-static');    // 静态服务
const views = require('koa-views');   // 模版
const config = require('config-lite');
// const bodyParser = require('koa-bodyparser');   // request body 解析
const koaBody = require('koa-body');
const historyFallback = require("koa2-history-api-fallback");
const proxy = require('koa-better-http-proxy');
const controllers = require('./middlewares/controller');
const myProxy = require('./middlewares/proxy');
const betterProxy = require('./middlewares/better-proxy');

const app = new Koa();

// app.use(historyFallback())
// app
// .use(koaBody({
//   multipart: true,
//   formidable: {
//     uploadDir: path.join(__dirname, '../app/uploads'),  // 上传目录
//     keepExtensions: true,                               // 保留扩展名
//   }
// }))
// app.use(koaBody())
app.use(serve(path.join(__dirname, '../app/views/public')));
app.use(views(path.resolve(__dirname, '../app/views'), {
  map: {
    html: 'ejs'
  }
}));
app.use(async (ctx, next) => {
  // console.log(ctx.url);
  await next();
})

// app.use(myProxy([{
//   // host可以是字符串，也可以是函数，函数会传入一个ctx的参数，必须返回一个字符串的host
//   host: 'https://www.baidu.com'
// }]));

/**
 * 参数说明
 * host {string|function} 若是函数，这个函数会接收 ctx 作为参数，必须返回一个字符串作为 host
 * rule {function|regexp} 如果是函数，接收ctx作为参数，返回 true 表示使用这个配置
 *      如果是一个正则表达式，会用这个正则去匹配当前请求的路径，如果匹配则使用这个配置
 * headers {object} 设置代理 header 头
 * withCookie boolean 是否携带 cookie，默认为 false。如果是 true 则返回的 header 中也会带 set-cookie字段
 *            如果有的话
 * timeout {number} 请求超时时间，毫秒值，默认15000
 */

 app.use(betterProxy('www.baidu.com', {

 }))

// app.use(controllers());

app.on('error', (err, ctx) => {
  console.error("server error", err, ctx);
})

app.listen(4000)