module.exports = class WebRequestHandler {
  constructor(request, reply, data) {
    this.request = request;
    this.reply = reply;
    this.data = data;

    this.limit = Number(this.request.query.limit);

    this.bindMethods();
  }

  bindMethods() { }

  hasPremium(account) {
    return account.premium &&
           account.premium.start <= this.data.ts &&
           account.premium.finish >= this.data.ts;
  }
};