const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsFilterHandler extends WebRequestHandler {
  call() {
    if (isNaN(this.limit) || this.limit < 1)
      return this.replyError();
      
    const accounts = this.filterAccounts();
    return { accounts: accounts.map(this.accountAsJson) };
  }

  bindMethods() {
    this.accountAsJson = this.accountAsJson.bind(this);
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