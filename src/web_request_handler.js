module.exports = class WebRequestHandler {
  constructor(request, reply, data, orm) {
    this.request = request;
    this.reply = reply;
    this.data = data;
    this.orm = orm;

    this.limit = Number(this.request.query.limit);

    this.bindMethods();
  }

  bindMethods() { }

  accountAsJson(account) {
    if (account.premium_start) {
      account.premium = {
        start: account.premium_start,
        finish: account.premium_finish
      };
      delete account.premium_start;
      delete account.premium_finish;
    }
    this.removeNullFields(account);

    return account;
  }

  removeNullFields(obj) {
    for (const key in obj)
      if (obj[key] === null)
        delete obj[key];
  }

  replyNotFound() {
    this.reply.code(404).type('text/html').send('Not Found');
  }

  replyError() {
    this.reply.code(400).type('text/html').send('Error');
  }
};