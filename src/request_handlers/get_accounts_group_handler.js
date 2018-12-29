const WebRequestHandler = require('../web_request_handler.js');
const Utils = require('../utils.js');
const QueryBuilder = require('../query_builder.js');

module.exports = class GetAccountGroupHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    this.query_builder = new QueryBuilder(this.orm);
  }

  call() {
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');
    const order = this.request.query.order;
    if(order !== '1' && order !== '-1')
      return this.reply.code(400).type('text/html').send('Error');


    this.query_builder.limit = this.limit;
    this.query_builder.bindings = Object.assign(this.query_builder.bindings, this.request.query);
    this.filterAccounts();

    const groups = this.countGroups();

    return { groups: groups };
  }

  filterAccounts() {
    for (const [key, value] of Object.entries(this.request.query)) {
      switch (key) {
        case 'sex':
        case 'status':
        case 'city':
        case 'country':
          this.query_builder.wheres.push(`${key} = @${key}`);
          break;
        case 'likes':
          var values = value;
          var sql = `accounts.id IN (SELECT DISTINCT account_id FROM account_likes WHERE account_likes.like_id IN (${values}))`;
          this.query_builder.wheres.push(sql);
          break;
        case 'interests':
          var values = value.split(',').map(s => `'${Utils.escapeString(s)}'`).join(', ');
          var sql = `accounts.id IN (SELECT DISTINCT account_id FROM account_interests WHERE account_interests.interest IN (${values}))`;
          this.query_builder.wheres.push(sql);
          break;
        case 'joined':
        case 'birth':
          const tss = Utils.yearToTimestamps(value);
          this.query_builder.wheres.push(`${key} >= ${tss.from} AND ${key} < ${tss.to}`);
          break;
        case 'query_id':
        case 'limit':
        case 'keys':
        case 'order':
          break;
        default:
          console.log(['filter', key, value])
      }
    }
  }

  countGroups() {
    const order = (this.request.query.order === '1') ? 'ASC' : 'DESC';
    const keys = this.request.query.keys.split(',');

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
        default:
          console.log(['key', key])
      }
    }
    
    const groups = this.query_builder.call().all();
    for (const group of groups) {
      for (const key in group)
        if (group[key] === null)
          delete group[key];
    }
    return groups;

    // const filteredAccounts = query.all();
    //
    // const counter = {};
    // accounts.forEach(account => {
    //   const superKey = keys.map(key => key + '@' + account[key]).join('#');
    //   if (!counter[superKey]) {
    //     counter[superKey] = {
    //       cnt: 0,
    //       values: keys.map(key => account[key])
    //     }
    //   }
    //   counter[superKey].cnt += 1;
    // });
    // let groups = Object.keys(counter)
    //   .sort((a,b) => {
    //     return asc ? (counter[a].cnt - counter[b].cnt) : (counter[b].cnt - counter[a].cnt)
    //   })
    //   .slice(0, this.limit)
    //   .map( superKey => {
    //     let group = keys.reduce((acc, key, i) => {
    //       acc[key] = counter[superKey].values[i];
    //       return acc;
    //     }, {});
    //     group['count'] = counter[superKey].cnt;
    //     return group;
    //   });
  }

  // bindMethods() {
  //   this.matchesQuery = this.matchesQuery.bind(this);
  // }
  //
  // matchesQuery(account) {
  //   return Object.entries(this.request.query).every( ([key, value]) => {
  //     switch (key) {
  //       case 'sex':
  //       case 'status':
  //       case 'city':
  //       case 'country':
  //       case 'status':
  //         return (account[key] == value);
  //       case 'likes': return (account.likes && account.likes.some(h => h.id == value));
  //       case 'interests': return (account.interests && account.interests.includes(value));
  //       case 'joined':
  //       case 'birth':
  //         return (value == Utils.timeToYear(account[key]));
  //     }
  //     return true;
  //   });
  // }
  //
  // filterAccounts() {
  //   return this.data.accounts.filter(this.matchesQuery);
  // }
};