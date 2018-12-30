const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  call() {
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.orm.findAccount(user_id);

    if (!this.myAccount)
      return this.replyNotFound();
    if (isNaN(this.limit) || this.limit < 1 || this.limit > 20)
      return this.replyError();

    let accounts = this.filterAccounts();
    return { accounts: accounts.map(this.accountAsJson) };
  }

  bindMethods() {
    this.accountAsJson = this.accountAsJson.bind(this);
  }
  
  filterAccounts() {
    const builder = new QueryBuilder(this.orm);
    const current_ts = this.data.ts;

    const accounts_query = new AccountsQuery(builder, this.request.query, current_ts);
    accounts_query.call();
    builder.bindings.my_sex = this.myAccount.sex;
    builder.wheres.push('accounts.sex != @my_sex');

    builder.orders.push(`(premium_start <= ${current_ts} AND premium_finish >= ${current_ts}) DESC`);
    builder.orders.push("CASE accounts.status WHEN 'свободны' THEN 3 WHEN 'всё сложно' THEN 2 WHEN 'занятые' THEN 1 END DESC");
    builder.orders.push('COUNT(account_interests.interest) DESC');
    builder.orders.push(`ABS(accounts.birth - ${this.myAccount.birth}) ASC`);

    builder.join_interests = true;
    builder.groups.push('accounts.id');
    builder.wheres.push(`account_interests.interest IN (SELECT interest FROM account_interests WHERE account_id = ${this.myAccount.id})`);

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.selects.add('accounts.status');
    builder.selects.add('accounts.fname');
    builder.selects.add('accounts.sname');
    builder.selects.add('accounts.birth');
    builder.selects.add('accounts.premium_start');
    builder.selects.add('accounts.premium_finish');

    return builder.call().all();
  }
};