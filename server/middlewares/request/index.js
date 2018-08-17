/**
 * request 方法暂时只考虑支持JSON REAST API
 */

const rp = require('request-promise');

const HEADERS = {
    'Content-Type': 'application/json;charset=utf-8',
    Accept: 'application/json, text/javascript',
  };

module.exports = function (app) {

    
    app.request = function (options) {
        
        return {
            get(uri, data, headers, options) {
                const opt = {
                    uri,
                    headers: {
                        ...HEADERS,
                        ...headers,
                    },
                    qs: { ...data },
                    json: true,
                }
                return rp(opt)
            },
            post(uri, data, headers, options) {
                const opt = {
                    method: 'POST',
                    uri,
                    headers: {
                        ...HEADERS,
                        ...headers,
                    },
                    body: {
                        ...data,
                    },
                    json: true,
                }
                return rp(opt)
            }
        }
    }
}

