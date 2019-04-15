const url = require('url')

module.exports = {
  get header() {
    return this.req.headers
  },

  get url() {
    return this.req.url
  },

  get path() {
    return url.parse(this.req.url, true).pathname
  },

  get query() {
    return url.parse(this.req.url, true).query
  }
}
