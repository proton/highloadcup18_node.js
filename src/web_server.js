const fastify = require('fastify')({ logger: false });

const GetAccountsFilterHandler = require('./request_handlers/get_accounts_filter_handler.js');
const GetAccountsGroupHandler = require('./request_handlers/get_accounts_group_handler.js');
const GetAccountsRecommendHandler = require('./request_handlers/get_accounts_recommend_handler.js');
const GetAccountsSuggestHandler = require('./request_handlers/get_accounts_suggest_handler.js');
const PostAccountsCreateHandler = require('./request_handlers/post_accounts_create_handler.js');
const PostAccountsUpdateHandler = require('./request_handlers/post_accounts_update_handler.js');

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
    fastify.post('/accounts/:user_id/', this.callHandler(PostAccountsUpdateHandler));

    try {
      fastify.listen(this.webConfig.port, this.webConfig.host);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }

  callHandler(klass) {
    return async (request, reply) => {
      const handler = new klass(request, reply, this.data);
      try {
        return handler.call()
      } catch (err) {
        console.log(['Error', request.raw.url]);
        console.log(err);
      }
    }
  }
};