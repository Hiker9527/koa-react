const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
/**
 * 解析方法以及路径
 * @param {string} url 
 */
function routerParse (url) {
  const urlArr = url.trim().toLowerCase().split(' ');
  const [ method, routePath = '' ] = urlArr;
  if (!['get', 'post', 'put', 'patch', 'del', 'all'].includes(method)) {
    throw new Error(`invalid URL:${url}`)
  }
  return {
    method,
    routePath,
  }
}

/**
 * 将配置好的路由添加到router实例上
 * @param {object} router      koa-router 路由实例
 * @param {object} mapping     具体的路由配置
 */

function addMapping(router, mapping) {
  const { namespace, headers, routes } = mapping;
  for (let url in routes) {
    const { method, routePath } = routerParse(url);
    let completePath = routePath || '';
    if (namespace && typeof namespace === 'string') {
      completePath = `/${namespace}/${completePath}`;
    }
    const dealFn = routes[url];
    if (typeof dealFn !== 'function') {
      throw new Error(`${completePath} 处理方法必须是函数`);
      return;
    }
    router[method](completePath, routes[url])
  }
}

function addControllers(router, controllers_dir) {
  var filePath = path.resolve(__dirname, '../../app', controllers_dir);
  var files = fs.readdirSync(filePath);
  var js_files = files.filter((f) => {
    return f.endsWith('.js');
  });
  for (var f of js_files) {
    // console.log(`process controller:${f}...`);
    let mapping = require(filePath + "/" + f);
    addMapping(router, mapping);
  }
}

module.exports = function(dir) {
  let
    controllers_dir = dir || 'controller', // 如果不传参数，扫描目录名默认为'controllers'
    router = new Router();
  addControllers(router, controllers_dir);
  return router.routes();
};