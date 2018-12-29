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

  replyNotFound() {
    this.reply.code(404).type('text/html').send('Not Found');
  }

  replyError() {
    this.reply.code(400).type('text/html').send('Error');
  }
};