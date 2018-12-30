const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsSuggestHandler extends WebRequestHandler {
  call() {
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.orm.findAccount(user_id);

    if (!this.myAccount)
      return this.replyNotFound();
    if (isNaN(this.limit) || this.limit < 1 || this.limit > 20)
      return this.replyError();

    let accounts = this.filterAccounts();
    return { accounts: accounts.map(this.asJson) };
  }

  bindMethods() {
    this.asJson = this.asJson.bind(this);
  }

  asJson(account) {
    if (account.premium_start) {
      account.premium = {
        start: account.premium_start,
        finish: account.premium_finish
      };
      delete account.premium_start;
      delete account.premium_finish;
    }

    for (const key in account)
      if (account[key] === null)
        delete account[key];

    return account;
  }

  filterAccounts() {
    const current_ts = this.data.ts;

    const builder0 = new QueryBuilder(this.orm);

    builder0.from = 'account_likes AS simular_account_likes';
    builder0.joins.push(`INNER JOIN account_likes AS my_likes ON simular_account_likes.like_id = my_likes.like_id AND my_likes.account_id = ${this.myAccount.id}`);

    builder0.selects.add('simular_account_likes.account_id, simular_account_likes.like_id, ABS(AVG(my_likes.ts) - AVG(simular_account_likes.ts)) AS likes_diff');
    builder0.groups.push('simular_account_likes.account_id');
    builder0.groups.push('simular_account_likes.like_id');

    const builder = new QueryBuilder(this.orm);
    const accounts_query = new AccountsQuery(builder, this.request.query, current_ts);
    accounts_query.call();

    builder.from = `(${builder0.sql()}) AS simular_likes`;
    // builder.selects.add('simular_likes.like_id');
    // builder.selects.add('SUM(1 / simular_likes.likes_diff) AS simularity');
    builder.groups.push('simular_likes.like_id');
    builder.orders.push('SUM(1 / simular_likes.likes_diff) DESC');
    builder.orders.push('simular_likes.like_id DESC');

    builder.joins.push(`INNER JOIN accounts ON accounts.id = simular_likes.like_id`);

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.selects.add('accounts.status');
    builder.selects.add('accounts.fname');
    builder.selects.add('accounts.sname');
    builder.selects.add('accounts.birth');
    builder.selects.add('accounts.premium_start');
    builder.selects.add('accounts.premium_finish');


    // let q = builder.call();
    // console.log(builder.sql());
    // let r = q.all();
    // console.log(r);

    return builder.call().all();
  }
};