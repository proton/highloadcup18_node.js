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
        case 'sex_eq': return (account.sex == value);
        case 'email_domain': return (account.email && account.email.split('@')[1] == value);
        case 'email_lt': return (account.email < value);
        case 'email_gt': return (account.email > value);
        case 'status_eq': return (account.status == value);
        case 'status_neq': return (account.status != value);
        case 'fname_eq': return (account.fname == value);
        case 'fname_any': return value.split(',').includes(account.fname);
        case 'fname_null': return (value == '1' ? !account.fname : account.fname);
        case 'sname_eq': return (account.sname == value);
        case 'sname_starts': return (account.sname && account.sname.startsWith(value));
        case 'sname_null': return (value == '1' ? !account.sname : account.sname);
        // case 'phone_code': return false;  // 6	phone	code - выбрать всех, у кого в телефоне конкретный код (три цифры в скобках);
        case 'phone_null': return (value == '1' ? !account.phone : account.phone);
        case 'country_eq': return (account.country == value);
        case 'country_null': return (value == '1' ? !account.country : account.country);
        case 'city_eq': return (account.city == value);
        case 'city_any': return value.split(',').includes(account.city);
        case 'city_null': return (value == '1' ? !account.city : account.city);
        case 'birth_lt': return (value - account.birth > 0);
        case 'birth_gt': return (value - account.birth < 0);
        // case 'birth_year': return (value == (new Date(account.birth * 100)).getFullYear());
        case 'interests_any': return (account.interests && account.interests.length && value.split(',').some(v => account.interests.includes(v)));
        case 'likes_contains': return (account.likes && account.likes.length && value.split(',').some(v => account.likes.includes(v)));
        // case 'premium_now': return false;  // 12	premium	now - все у кого есть премиум на текущую дату;
        case 'premium_null': return (value == '1' ? !account.premium : account.premium);
        // case 'query_id': return true;
        // case 'limit': return true;
        // default:
        //   console.log(key, value);
        //   return true;
      }
      return true;
    });
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