const WebRequestHandler = require('../web_request_handler.js')

module.exports = class PostAccountsUpdateHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.data.accounts[user_id];
  }

  call() {
    if(!this.myAccount)
      return this.reply.code(404).type('text/html').send('Not Found');
    
    const updates = this.request.body;
    for (const [key, value] of Object.entries(updates)) {
      this.myAccount[key] = value;
    }

    this.reply.code(202).type('text/plain').send('{}');
  }
}