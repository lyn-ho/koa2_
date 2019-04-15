const http = require('http')
const context = require('./context')
const request = require('./request')
const response = require('./response')

class Application {
  constructor() {
    this.middlewares = []
    this.context = context
    this.request = request
    this.response = response
  }

  listen(port) {
    const server = http.createServer(this.callback())
    server.listen(port)
  }

  use(middleware) {
    this.middlewares.push(middleware)
  }

  // 通过 Object.create 创建 ctx, 并将 request 和 response 挂载到 ctx 上
  // 将原生的 req 和 res 挂载到 ctx 的子属性上
  createContext(req, res) {
    const ctx = Object.create(this.context)

    ctx.request = Object.create(this.request)
    ctx.response = Object.create(this.response)
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res

    return ctx
  }

  compose() {
    return async ctx => {
      function createNext(middleware, oldNext) {
        return async () => {
          await middleware(ctx, oldNext)
        }
      }

      const len = this.middlewares.length
      let next = async () => {
        return Promise.resolve()
      }

      for (let i = len - 1; i >= 0; i--) {
        let currentMiddleware = this.middlewares[i]
        next = createNext(currentMiddleware, next)
      }

      await next()
    }
  }

  callback() {
    return (req, res) => {
      let ctx = this.createContext(req, res)
      let response = () => this.responseBody(ctx)
      let onerror = err => this.onerror(err, ctx)
      let fn = this.compose()
      return fn(ctx)
        .then(response)
        .catch(onerror)
    }
  }

  responseBody(ctx) {
    const content = ctx.body

    if (typeof content === 'string') {
      ctx.res.end(content)
    } else if (typeof content === 'object') {
      ctx.res.end(JSON.stringify(content))
    }
  }

  onerror(err, ctx) {
    if (err.code === 'ENOENT') {
      ctx.status = 404
    } else {
      ctx.status = 500
    }

    const msg = err.message || 'Internal error'
    ctx.res.end(msg)
    this.emit('error', err)
  }
}

module.exports = Application
