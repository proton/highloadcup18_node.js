const WebRequestHandler = require('../web_request_handler.js');

module.exports = class PostAccountsUpdateHandler extends WebRequestHandler {
  call() {
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.orm.findAccount(user_id);

    if (!this.myAccount)
      return this.replyNotFound();

    const updates = this.request.body;
    this.orm.updateAccount(this.myAccount, updates);

    this.reply.code(202).type('text/plain').send('{}');
  }
};