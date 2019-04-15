/// context.js 对常用的 request 和 response 方法进行挂载和代理，通过 context.query  直接代理 context.request.query 
/// context.body 和 context.status 代理了 context.response.body 与 context.response.status
/// context.request, context.response 会在 application.js 中挂载

const proto = {}

function delegateSet(property, name) {
  proto.__defineSetter__(name, function(val) {
    this[property][name] = val
  })
}

function delegateGet(property, name) {
  proto.__defineGetter__(name, function() {
    return this[property][name]
  })
}

let requestSet = []
let requestGet = ['header', 'url', 'path', 'query']

let responseSet = ['body', 'status']
let responseGet = responseSet

requestSet.forEach(ele => {
  delegateSet('request', ele)
})

requestGet.forEach(ele => {
  delegateGet('request', ele)
})

responseSet.forEach(ele => {
  delegateSet('response', ele)
})

responseGet.forEach(ele => {
  delegateGet('response', ele)
})

module.exports = proto
