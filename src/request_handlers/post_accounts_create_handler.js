const WebRequestHandler = require('../web_request_handler.js');

module.exports = class PostAccountsCreateHandler extends WebRequestHandler {
  call() {
    const account = this.request.body;

    if(!account.id)
      return this.replyError();
    if(this.orm.isAccountExists(account.id))
      return this.replyError();

    this.orm.addAccount(account);
    this.reply.code(201).type('text/plain').send('{}');
  }
};