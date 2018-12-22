const fastify = require('fastify')({ logger: false });

const GetAccountsFilterHandler = require('./get_accounts_filter_handler.js');
const GetAccountsGroupHandler = require('./get_accounts_group_handler.js');
const GetAccountsRecommendHandler = require('./get_accounts_recommend_handler.js');
const GetAccountsSuggestHandler = require('./get_accounts_suggest_handler.js');
const PostAccountsCreateHandler = require('./post_accounts_create_handler.js');

module.exports = class WebServer {
  constructor(webConfig, data) {
    this.webConfig = webConfig;
    this.data = data;
  }
  
  start() {
    fastify.get('/accounts/filter/', this.callHandler(GetAccountsFilterHandler));
    fastify.get('/accounts/group/', this.callHandler(GetAccountsGroupHandler));
    fastify.get('/accounts/:user_id/recommend/', this.callHandler(GetAccountsRecommendHandler));
    fastify.get('/accounts/:user_id/suggest/', this.callHandler(GetAccountsSuggestHandler));
    fastify.post('/accounts/new/', this.callHandler(PostAccountsCreateHandler));

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