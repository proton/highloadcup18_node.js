const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  call() {
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.orm.findAccount(user_id);

    if(!this.myAccount)
      return this.reply.code(404).type('text/html').send('Not Found');
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');

    let accounts = this.filterAccounts();
    return { accounts: accounts.map(this.asJson) };
  }

  bindMethods() {
    // this.compareAccounts = this.compareAccounts.bind(this);
    this.asJson = this.asJson.bind(this);
    // this.matchesQuery = this.matchesQuery.bind(this);
  }

  asJson(account) {
    if (account.hasOwnProperty('premium_start')) {
      if (account.premium_start) account.premium = {
        start: account.premium_start,
        finish: account.premium_finish
      };
      delete account.premium_start;
      delete account.premium_finish;
    }
    return account;
    // return displayedFields.reduce((acc, key) => {
    //   acc[key] = account[key];
    //   return acc;
    // }, {})
  }
  
  filterAccounts() {
    const builder = new QueryBuilder(this.orm);
    const current_ts = this.data.ts;

    const accounts_query = new AccountsQuery(builder, this.request.query, current_ts);
    accounts_query.call();
    builder.bindings.my_sex = this.myAccount.sex;
    builder.wheres.push('accounts.sex != @my_sex');
    builder.wheres.push(`accounts.id IN (SELECT DISTINCT account_id FROM account_interests WHERE interest IN (SELECT interest FROM account_interests WHERE account_id = ${this.myAccount.id}))`);

    builder.orders.push(`(premium_start <= ${current_ts} AND premium_finish >= ${current_ts}) DESC`);
    builder.orders.push("CASE accounts.status WHEN 'свободны' THEN 3 WHEN 'всё сложно' THEN 2 WHEN 'занятые' THEN 1 END");
    // TODO: order by commonInterestsCount desc
    builder.orders.push(`ABS(accounts.birth - ${this.myAccount.birth}) ASC`);

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.selects.add('accounts.status');
    builder.selects.add('accounts.fname');
    builder.selects.add('accounts.sname');
    builder.selects.add('accounts.birth');
    builder.selects.add('accounts.premium_start');
    builder.selects.add('accounts.premium_finish');

    // let r = builder.call().all();
    // console.log(builder.call());
    // console.log(r);

    return builder.call().all();
  }
};