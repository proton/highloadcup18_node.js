const WebRequestHandler = require('./web_request_handler.js')

module.exports = class PostAccountsCreateHandler extends WebRequestHandler {
  call() {
    const account = this.request.body;
    this.data.accounts[account.id] = account;
    this.reply.code(201).type('text/plain').send('{}');
  }
}