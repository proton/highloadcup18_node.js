const WebRequestHandler = require('../web_request_handler.js');
const Utils = require('../utils.js');
const QueryBuilder = require('../query_builder.js');

const quiredFieldIgnore = () => {};
const quiredFieldEq = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -3);
  builder.selects.add(field);
  builder.wheres.push(`${field} = @${key}`);
};
const quiredFieldNeq = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -4);
  builder.selects.add(field);
  builder.wheres.push(`${field} != @${key}`);
};
const quiredFieldAny = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -4);
  builder.selects.add(field);
  const values = value.split(',').map(s => `'${Utils.escapeString(s)}'`).join(', ');
  builder.wheres.push(`${field} IN (${values})`);
};
const quiredFieldLt = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -3);
  builder.selects.add(field);
  builder.wheres.push(`${field} < @${key}`);
};
const quiredFieldGt = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -3);
  builder.selects.add(field);
  builder.wheres.push(`${field} > @${key}`);
};
const quiredFieldNull = (key, value, builder) => {
  const field = 'accounts.' + key.slice(0, -5);
  builder.selects.add(field);
  if (value === '1' ) builder.wheres.push(`${field} IS NULL`);
  else builder.wheres.push(`${field} IS NOT NULL`);
};
const quiredEmailHaveDomain = (_key, value, builder) => {
  const field = 'accounts.' + 'email';
  builder.selects.add(field);
  builder.wheres.push(`${field} LIKE '%@${Utils.escapeString(value)}'`);
};
const quiredSnameStarts = (_key, value, builder) => {
  const field = 'accounts.' + 'sname';
  builder.selects.add(field);
  builder.wheres.push(`${field} LIKE '${Utils.escapeString(value)}%'`);
};
const quiredPhoneCode = (_key, value, builder) => {
  const field = 'accounts.' + 'phone';
  builder.selects.add(field);
  builder.wheres.push(`${field} LIKE '%(${Utils.escapeString(value)})%'`);
};
const quiredPremiumNull = (_key, value, builder) => {
  builder.selects.add('premium_start');
  builder.selects.add('premium_finish');
  if (value === '1' ) builder.wheres.push(`premium_start IS NULL AND premium_finish IS NULL`);
  else builder.wheres.push(`premium_start IS NOT NULL OR premium_finish IS NOT NULL`);
};
const quiredPremiumNow = (_key, value, builder, current_ts) => {
  builder.selects.add('premium_start');
  builder.selects.add('premium_finish');
  if (value === '1' ) builder.wheres.push(`premium_start <= ${current_ts} AND premium_finish >= ${current_ts}`);
  else builder.wheres.push(`premium_start >= ${current_ts} OR premium_finish < ${current_ts}`);
};
const quiredBirthYear = (_key, value, builder) => {
  const field = 'accounts.' + 'birth';
  builder.selects.add(field);
  const tss = Utils.yearToTimestamps(value);
  builder.wheres.push(`${field} >= ${tss.from} AND ${field} < ${tss.to}`);
};

const quiredFieldsMapping = {
  'sex_eq': quiredFieldEq,
  'email_domain': quiredEmailHaveDomain,
  'email_lt': quiredFieldLt,
  'email_gt': quiredFieldGt,
  'status_eq': quiredFieldEq,
  'status_neq': quiredFieldNeq,
  'fname_eq': quiredFieldEq,
  'fname_any': quiredFieldAny,
  'fname_null': quiredFieldNull,
  'sname_eq': quiredFieldEq,
  'sname_starts': quiredSnameStarts,
  'sname_null': quiredFieldNull,
  'phone_code': quiredPhoneCode,
  'phone_null': quiredFieldNull,
  'country_eq': quiredFieldEq,
  'country_null': quiredFieldNull,
  'city_eq': quiredFieldEq,
  'city_any': quiredFieldAny,
  'city_null': quiredFieldNull,
  'birth_lt': quiredFieldLt,
  'birth_gt': quiredFieldGt,
  'birth_year': quiredBirthYear,
  // 'interests_contains': quiredFieldIgnore,
  // 'interests_any': quiredFieldIgnore,
  // 'likes_contains': quiredFieldIgnore,
  'premium_now': quiredPremiumNow,
  'premium_null': quiredPremiumNull,
  'query_id': quiredFieldIgnore,
  'limit': quiredFieldIgnore
};


//         case 'email_domain': return (account.email && account.email.split('@')[1] == value);
//         case 'email_lt': return (account.email < value);
//         case 'email_gt': return (account.email > value);
//         case 'status_eq': return (account.status == value);
//         case 'status_neq': return (account.status != value);
//         case 'fname_eq': return (account.fname == value);
//         case 'fname_any': return value.split(',').includes(account.fname);
//         case 'fname_null': return (value == '1' ? !account.fname : account.fname);
//         case 'sname_eq': return (account.sname == value);
//         case 'sname_starts': return (account.sname && account.sname.startsWith(value));
//         case 'sname_null': return (value == '1' ? !account.sname : account.sname);
//         case 'phone_code': return (account.phone && account.phone.includes(`(${value})`));
//         case 'phone_null': return (value == '1' ? !account.phone : account.phone);
//         case 'country_eq': return (account.country == value);
//         case 'country_null': return (value == '1' ? !account.country : account.country);
//         case 'city_eq': return (account.city == value);
//         case 'city_any': return value.split(',').includes(account.city);
//         case 'city_null': return (value == '1' ? !account.city : account.city);
//         case 'birth_lt': return (value - account.birth > 0);
//         case 'birth_gt': return (value - account.birth < 0);
//         case 'birth_year': return (value == Utils.timeToYear(account.birth));
//         case 'interests_contains': return (account.interests && value.split(',').every(v => account.interests.includes(v)));
//         case 'interests_any': return (account.interests && value.split(',').some(v => account.interests.includes(v)));
//         case 'likes_contains': return (account.likes && value.split(',').every(v => account.likes.some(h => h.id == v)));
//         case 'premium_now': return this.hasPremium(account);
//         case 'premium_null': return (value == '1' ? !account.premium : account.premium);

module.exports = class GetAccountsFilterHandler extends WebRequestHandler {
  call() {
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');
    if(!Object.keys(this.request.query).every(key => quiredFieldsMapping[key]))
      return this.reply.code(400).type('text/html').send('Error');
      
    const accounts = this.filterAccounts();
    return { accounts: accounts.map(this.asJson) };
  }

  bindMethods() {
    this.asJson = this.asJson.bind(this);
  }

  asJson(account) {
    return account;
    // return this.displayedFields().reduce((acc, key) => {
    //   acc[key] = account[key];
    //   return acc;
    // }, {})
  }


  // displayedFields() {
  //   if(!this.displayed_fields) {
  //     this.displayed_fields = Object.keys(this.request.query)
  //                                   .map(key => dispayedFieldsMapping[key])
  //                                   .filter(key => key);
  //     this.displayed_fields = this.displayed_fields.concat(['id', 'email'])
  //   }
  //   return this.displayed_fields;
  // }

  buildQuery() {
    const builder = new QueryBuilder(this.orm);
    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.order = 'accounts.id DESC';
    builder.limit = this.limit;
    builder.bindings = Object.assign(builder.bindings, this.request.query);

    for (const [key, value] of Object.entries(this.request.query)) {
      try {
        quiredFieldsMapping[key](key, value, builder, this.data.ts);
      } catch (e) {
        console.log(key, quiredFieldsMapping[key]);
      }
    }

    return builder.call();
  }

  filterAccounts() {
    const query = this.buildQuery();
    const filteredAccounts = query.all();
    return filteredAccounts;
  }
};