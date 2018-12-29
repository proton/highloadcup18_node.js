const WebRequestHandler = require('../web_request_handler.js');
const Utils = require('../utils.js');

// const allowedFields = new Set(['sex', 'status', 'country', 'city', 'interests']);

module.exports = class GetAccountGroupHandler extends WebRequestHandler {
  call() {
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');
    const order = this.request.query.order;
    if(order != '1' && order != '-1')
      return this.reply.code(400).type('text/html').send('Error');

    const asc = (this.request.query.order == '1');

    const accounts = this.filterAccounts();
    const keys = this.request.query.keys.split(',');

    const counter = {};
    accounts.forEach(account => {
      const superKey = keys.map(key => key + '@' + account[key]).join('#');
      if (!counter[superKey]) {
        counter[superKey] = {
          cnt: 0,
          values: keys.map(key => account[key])
        }
      }
      counter[superKey].cnt += 1;
    });
    let groups = Object.keys(counter)
      .sort((a,b) => {
        return asc ? (counter[a].cnt - counter[b].cnt) : (counter[b].cnt - counter[a].cnt)
      })
      .slice(0, this.limit)
      .map( superKey => {
        let group = keys.reduce((acc, key, i) => {
          acc[key] = counter[superKey].values[i];
          return acc;
        }, {});
        group['count'] = counter[superKey].cnt;
        return group;
      }); 
    return { groups: groups };
  }

  bindMethods() {
    this.matchesQuery = this.matchesQuery.bind(this);
  }

  matchesQuery(account) {
    return Object.entries(this.request.query).every( ([key, value]) => {
      switch (key) {
        case 'sex':
        case 'status':
        case 'city':
        case 'country':
        case 'status':
          return (account[key] == value);
        case 'likes': return (account.likes && account.likes.some(h => h.id == value));
        case 'interests': return (account.interests && account.interests.includes(value));
        case 'joined':
        case 'birth':
          return (value == Utils.timeToYear(account[key]));
      }
      return true;
    });
  }
  
  filterAccounts() {
    return this.data.accounts.filter(this.matchesQuery);
  }
}