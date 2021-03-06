const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');
const Utils = require('../utils.js');

module.exports = class GetAccountGroupHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    this.query_builder = new QueryBuilder(this.orm);
  }

  call() {
    if (isNaN(this.limit) || this.limit < 1 || this.limit > 50)
      return this.replyError();
    const order = this.request.query.order;
    if(order !== '1' && order !== '-1')
      return this.replyError();
    
    const accounts_query = new AccountsQuery(this.query_builder, this.request.query, this.data.ts);
    accounts_query.call();

    const groups = this.countGroups();

    return { groups: groups };
  }

  countGroups() {
    const order = (this.request.query.order === '1') ? 'ASC' : 'DESC';
    const keys = this.request.query.keys.split(',');
    if (keys.some(key => !Utils.accountAttrsExtended.has(key))) throw 'bad_data';

    this.query_builder.selects.add('COUNT(*) AS `count`');
    this.query_builder.orders.push(`COUNT(*) ${order}`);

    for (const key of keys) {
      switch (key) {
        case 'sex':
        case 'status':
        case 'city':
        case 'country':
        case 'sname':
        case 'phone':
        case 'email':
          this.query_builder.selects.add(`accounts.${key}`);
          this.query_builder.groups.push(`accounts.${key}`);
          this.query_builder.orders.push(`accounts.${key} ${order}`);
          break;
        case 'interests':
          this.query_builder.selects.add(`account_interests.interest AS "interests"`);
          this.query_builder.groups.push(`account_interests.interest`);
          this.query_builder.orders.push(`account_interests.interest ${order}`);
          this.query_builder.join_interests = true;
          break;
        default:
          console.log(['key', key]);
          throw 'bad_data';
      }
    }
    
    const groups = this.query_builder.call().all();
    if (groups.length === 1 && groups[0].count === 0) return [];

    for (const group of groups) {
      this.removeNullFields(group);
    }
    return groups;
  }
};