const fastify = require('fastify')({ logger: false });

const GetAccountsFilterHandler = require('./get_accounts_filter_handler.js');

module.exports = class WebServer {
  constructor(webConfig, data) {
    this.webConfig = webConfig;
    this.data = data;
  }
  
  start() {
    fastify.get('/accounts/filter/', this.callHandler(GetAccountsFilterHandler))

    try {
      fastify.listen(this.webConfig.port, this.webConfig.host)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }

  callHandler(klass) {
    return async (request, reply) => {
      const handler = new klass(request, reply, this.data)
      return handler.call()
    }
  }
}