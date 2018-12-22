const WebRequestHandler = require('./web_request_handler.js')

const dispayedFieldsMapping = {
  'sex_eq': 'sex',
  'email_domain': 'email',
  'email_lt': 'email',
  'email_gt': 'email',
  'status_eq': 'status',
  'status_neq': 'status',
  'fname_eq': 'fname',
  'fname_any': 'fname',
  'fname_null': 'fname',
  'sname_eq': 'sname',
  'sname_starts': 'sname',
  'sname_null': 'sname',
  'phone_code': 'phone_code',
  'phone_code_null': 'phone_code',
  'country_eq': 'country',
  'country_null': 'country',
  'city_eq': 'city',
  'city_any': 'city',
  'city_null': 'city',
  'birth_lt': 'birth',
  'birth_gt': 'birth',
  'year': 'year',
  'interests_contains': 'interests',
  'interests_any': 'interests',
  'likes_contains': 'likes',
  'premium_now': 'premium',
  'premium_null': 'premium',
  'query_id': '',
  'limit': ''
}

module.exports = class GetAccountsFilterHandler extends WebRequestHandler {
  call() {
    const accounts = this.filterAccounts();
    return { accounts: accounts.map(this.asJson) };
  }

  bindMethods() {
    this.asJson = this.asJson.bind(this);
  }

  asJson(account) {
    return this.displayedFields().reduce((acc, key) => {
      acc[key] = account[key];
      return acc;
    }, {})
  }


  displayedFields() {
    if(!this.displayed_fields) {
      this.displayed_fields = Object.keys(this.request.query)
                                    .map(key => dispayedFieldsMapping[key])
                                    .filter(key => key);
      this.displayed_fields = this.displayed_fields.concat(['id', 'email'])
    }
    return this.displayed_fields;
  }

  matchesQuery(account) {
    return Object.entries(this.request.query).every( ([key, value]) => {
      switch (key) {
        case 'sex_eq': return account.sex == value;
        case 'email_domain': return false; // 2	email	domain - выбрать всех, чьи email-ы имеют указанный домен;
        case 'email_lt': return false; // lt - выбрать всех, чьи email-ы лексикографически раньше;
        case 'email_gt': return false; // lt - выбрать всех, чьи email-ы лексикографически позже;
        case 'status_eq': return false; // 3	status	eq - соответствие конкретному статусу;
        case 'status_neq': return false; // neq - выбрать всех, чей статус не равен указанному;
        case 'fname_eq': return false;  // 4	fname	eq - соответствие конкретному имени;
        case 'fname_any': return false;  // any - соответствие любому имени из перечисленных через запятую;
        case 'fname_null': return false;  // null - выбрать всех, у кого указано имя (если 0) или не указано (если 1);
        case 'sname_eq': return false;  // 5	sname	eq - соответствие конкретной фамилии;
        case 'sname_starts': return false;  // starts - выбрать всех, чьи фамилии начинаются с переданного префикса;
        case 'sname_null': return false;  // null - выбрать всех, у кого указана фамилия (если 0) или не указана (если 1);
        case 'phone_code': return false;  // 6	phone	code - выбрать всех, у кого в телефоне конкретный код (три цифры в скобках);
        case 'phone_code_null': return false;  // null - аналогично остальным полям;
        case 'country_eq': return false;  // 7	country	eq - всех, кто живёт в конкретной стране;
        case 'country_null': return false;  // null - аналогично;
        case 'city_eq': return false;  // 8	city	eq - всех, кто живёт в конкретном городе;
        case 'city_any': return false;  // any - в любом из перечисленных через запятую городов;
        case 'city_null': return false;  // null - аналогично;
        case 'birth_lt': return false;  // 9	birth	lt - выбрать всех, кто родился до указанной даты;
        case 'birth_gt': return false;  // gt - после указанной даты;
        case 'year': return false;  // year - кто родился в указанном году;
        case 'interests_contains': return false;  // 10	interests	contains - выбрать всех, у кого есть все перечисленные интересы;
        case 'interests_any': return false;  // any - выбрать всех, у кого есть любой из перечисленных интересов;
        case 'likes_contains': return false;  // 11	likes	contains - выбрать всех, кто лайкал всех перечисленных пользователей (в значении - перечисленные через запятые id);
        case 'premium_now': return false;  // 12	premium	now - все у кого есть премиум на текущую дату;
        case 'premium_null': return false;  // null - аналогично остальным;
        case 'query_id': return true;
        case 'limit': return true;
        default:
          return false;
          //console.log([key, value, account[key], 'not implemented']);
      }
      return false;
    });
  
    return true;
  }
  
  filterAccounts() {
    const limit = Number(this.request.query.limit);
    let filteredAccounts = [];
    for(let id = this.data.accounts.length - 1; id >= 1; --id) {
      const account = this.data.accounts[id];
      if (this.matchesQuery(account)) {
        filteredAccounts.push(account);
        if (filteredAccounts.length == limit) break;
      }
    }
    return filteredAccounts;
  }
}