const WebRequestHandler = require('../web_request_handler.js')

const displayedFields = ['id', 'email', 'status', 'fname', 'sname', 'birth', 'premium'];

const statuses = {
  'свободны': 3,
  'всё сложно': 2,
  'занятые': 1
}

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.data.accounts[user_id];
  }
  
  call() {
    if(!this.myAccount)
      return this.reply.code(404).type('text/html').send('Not Found');
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');
    
    let accounts = this.filterAccounts()
                       .sort(this.compareAccounts)
                       .slice(0, this.limit);
    return { accounts: accounts.map(this.asJson) };
  }

  compareAccounts(b, a) {
    if(this.hasPremium(a) != this.hasPremium(b)) return this.hasPremium(a) ? 1 : -1
    if(a.status != b.status) return statuses[a.status] - statuses[b.status];
    const aCommonInterests = this.commonInterestsCount(a);
    const bCommonInterests = this.commonInterestsCount(b);
    if(aCommonInterests != bCommonInterests) return aCommonInterests - bCommonInterests;
    const aAgeDiff = Math.abs(a.birth - this.myAccount.birth);
    const bAgeDiff = Math.abs(b.birth - this.myAccount.birth);
    if(aAgeDiff != bAgeDiff) return bAgeDiff - aAgeDiff;
    return b.id - a.id;
  }

  commonInterestsCount(account) {
    if(!account.interests) return 0;
    if(!this.myInterestsSet) this.myInterestsSet = new Set(this.myAccount.interests);
    return account.interests.reduce((sum, obj) => this.myInterestsSet.has(obj) ? sum + 1 : sum, 0);
  }

  matchesQuery(account) {
    if(this.myAccount.sex == account.sex) return false;
    if(this.request.query.city && this.request.query.city != account.city) return false;
    if(this.request.query.country && this.request.query.country != account.country) return false;
    if(this.commonInterestsCount(account) == 0) return false;
    return true;
  }

  bindMethods() {
    this.compareAccounts = this.compareAccounts.bind(this);
    this.asJson = this.asJson.bind(this);
    this.matchesQuery = this.matchesQuery.bind(this);
  }

  asJson(account) {
    return displayedFields.reduce((acc, key) => {
      acc[key] = account[key];
      return acc;
    }, {})
  }
  
  filterAccounts() {
    return this.data.accounts.filter(this.matchesQuery);
  }
}