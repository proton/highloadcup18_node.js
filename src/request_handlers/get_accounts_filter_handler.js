const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsFilterHandler extends WebRequestHandler {
  call() {
    if (isNaN(this.limit) || this.limit < 1)
      return this.replyError();
      
    const accounts = this.filterAccounts();
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
    const builder = new QueryBuilder(this.orm);

    const accounts_query = new AccountsQuery(builder, this.request.query, this.data.ts);
    accounts_query.call();

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.orders.push('accounts.id DESC');

    return builder.call().all();
  }
};