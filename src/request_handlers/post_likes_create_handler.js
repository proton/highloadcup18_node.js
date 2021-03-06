const WebRequestHandler = require('../web_request_handler.js');

module.exports = class PostLikesCreateHandler extends WebRequestHandler {
  call() {
    const likes = this.request.body.likes;

    // if(!likes || !likes.length)
    //   return this.replyError();

    if (likes.length) this.orm.addLikes(likes);
    this.reply.code(202).type('text/plain').send('{}');
  }
};