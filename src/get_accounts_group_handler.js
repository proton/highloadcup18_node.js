const WebRequestHandler = require('./web_request_handler.js')

// const allowedFields = new Set(['sex', 'status', 'country', 'city', 'interests']);

module.exports = class GetAccountGroupHandler extends WebRequestHandler {
  call() {
    const asc = (this.request.query.order == '1');
    const limit = Number(this.request.query.limit);

    const accounts = this.filterAccounts();
    const keys = this.request.query.keys.split(',');
    const counter = {};
    accounts.forEach(account => {
      const bigKey = keys.map(key => account[key]);
      counter[bigKey] = counter[bigKey] ? counter[bigKey] + 1 : 1;
    });
    let groups = Object.keys(counter)
      .sort((a,b) => {
        return asc ? (counter[a] - counter[b]) : (counter[b] - counter[a])
      })
      .slice(0, limit)
      .map( bigKey => {
        let group = bigKey.reduce((acc, value, i) => {
          const key = keys[i];
          acc[key] = value;
          return acc;
        }, {});
        group['count'] = counter[bigKey];
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
        // case 'sex_eq': return account.sex == value;
        // case 'email_domain': return false; // 2	email	domain - выбрать всех, чьи email-ы имеют указанный домен;
        // case 'email_lt': return false; // lt - выбрать всех, чьи email-ы лексикографически раньше;
        // case 'email_gt': return false; // lt - выбрать всех, чьи email-ы лексикографически позже;
        // case 'status_eq': return false; // 3	status	eq - соответствие конкретному статусу;
        // case 'status_neq': return false; // neq - выбрать всех, чей статус не равен указанному;
        // case 'fname_eq': return false;  // 4	fname	eq - соответствие конкретному имени;
        // case 'fname_any': return false;  // any - соответствие любому имени из перечисленных через запятую;
        // case 'fname_null': return false;  // null - выбрать всех, у кого указано имя (если 0) или не указано (если 1);
        // case 'sname_eq': return false;  // 5	sname	eq - соответствие конкретной фамилии;
        // case 'sname_starts': return false;  // starts - выбрать всех, чьи фамилии начинаются с переданного префикса;
        // case 'sname_null': return false;  // null - выбрать всех, у кого указана фамилия (если 0) или не указана (если 1);
        // case 'phone_code': return false;  // 6	phone	code - выбрать всех, у кого в телефоне конкретный код (три цифры в скобках);
        // case 'phone_code_null': return false;  // null - аналогично остальным полям;
        // case 'country_eq': return false;  // 7	country	eq - всех, кто живёт в конкретной стране;
        // case 'country_null': return false;  // null - аналогично;
        // case 'city_eq': return false;  // 8	city	eq - всех, кто живёт в конкретном городе;
        // case 'city_any': return false;  // any - в любом из перечисленных через запятую городов;
        // case 'city_null': return false;  // null - аналогично;
        // case 'birth_lt': return false;  // 9	birth	lt - выбрать всех, кто родился до указанной даты;
        // case 'birth_gt': return false;  // gt - после указанной даты;
        // case 'year': return false;  // year - кто родился в указанном году;
        // case 'interests_contains': return false;  // 10	interests	contains - выбрать всех, у кого есть все перечисленные интересы;
        // case 'interests_any': return false;  // any - выбрать всех, у кого есть любой из перечисленных интересов;
        // case 'likes_contains': return false;  // 11	likes	contains - выбрать всех, кто лайкал всех перечисленных пользователей (в значении - перечисленные через запятые id);
        // case 'premium_now': return false;  // 12	premium	now - все у кого есть премиум на текущую дату;
        // case 'premium_null': return false;  // null - аналогично остальным;
        case 'query_id': return true;
        case 'limit': return true;
        default:
          return true;
          //console.log([key, value, account[key], 'not implemented']);
      }
      return false;
    });
  
    return true;
  }
  
  filterAccounts() {
    return this.data.accounts.filter(this.matchesQuery);
  }
}