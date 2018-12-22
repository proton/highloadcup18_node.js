module.exports = class WebRequestHandler {
  constructor(request, reply, data) {
    this.request = request;
    this.reply = reply;
    this.data = data;
    
    this.bindMethods();
  }
}