const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

// const displayedFields = ['id', 'email', 'status', 'fname', 'sname', 'birth', 'premium'];

const statuses = {
  'свободны': 3,
  'всё сложно': 2,
  'занятые': 1
};

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  // constructor(...args) {
  //   super(...args);
  //   const user_id = Number(this.request.params.user_id);
  //   this.myAccount = this.data.accounts[user_id];
  // }

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
      account.premium = {
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

  // compareAccounts(b, a) {
  //   if(this.hasPremium(a) != this.hasPremium(b)) return this.hasPremium(a) ? 1 : -1
  //   if(a.status != b.status) return statuses[a.status] - statuses[b.status];
  //   const aCommonInterests = this.commonInterestsCount(a);
  //   const bCommonInterests = this.commonInterestsCount(b);
  //   if(aCommonInterests != bCommonInterests) return aCommonInterests - bCommonInterests;
  //   const aAgeDiff = Math.abs(a.birth - this.myAccount.birth);
  //   const bAgeDiff = Math.abs(b.birth - this.myAccount.birth);
  //   if(aAgeDiff != bAgeDiff) return bAgeDiff - aAgeDiff;
  //   return b.id - a.id;
  // }
  //
  // commonInterestsCount(account) {
  //   if(!account.interests) return 0;
  //   if(!this.myInterestsSet) this.myInterestsSet = new Set(this.myAccount.interests);
  //   return account.interests.reduce((sum, obj) => this.myInterestsSet.has(obj) ? sum + 1 : sum, 0);
  // }
  //
  // matchesQuery(account) {
  //   if(this.myAccount.sex == account.sex) return false;
  //   if(this.request.c.city && this.request.query.city != account.city) return false;
  //   if(this.request.query.country && this.request.query.country != account.country) return false;
  //   if(this.commonInterestsCount(account) == 0) return false;
  //   return true;
  // }
  
  filterAccounts() {
    const builder = new QueryBuilder(this.orm);

    const accounts_query = new AccountsQuery(builder, this.request.query, this.data.ts);
    accounts_query.call();

    builder.selects.add('accounts.*');

    return builder.call().all();
  }
};