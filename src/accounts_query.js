const Utils = require('./utils.js');

const quiredFieldIgnore = () => {};
const quiredFieldEqDirect = (key, value, builder) => {
  const field = 'accounts.' + key;
  builder.wheres.push(`${field} = @${key}`);
};
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
  if (value === '1' ) builder.wheres.push(`${field} IS NULL`);
  else {
    builder.selects.add(field);
    builder.wheres.push(`${field} IS NOT NULL`);
  }
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
  else builder.wheres.push(`(premium_start IS NOT NULL OR premium_finish IS NOT NULL)`);
};
const quiredPremiumNow = (_key, value, builder, current_ts) => {
  builder.selects.add('premium_start');
  builder.selects.add('premium_finish');
  if (value === '1' ) builder.wheres.push(`premium_start <= ${current_ts} AND premium_finish >= ${current_ts}`);
  else builder.wheres.push(`(premium_start >= ${current_ts} OR premium_finish < ${current_ts})`);
};
const quiredFieldYear = (key, value, builder) => {
  const field = 'accounts.' + key;
  const tss = Utils.yearToTimestamps(value);
  builder.wheres.push(`${field} >= ${tss.from} AND ${field} < ${tss.to}`);
};
const quiredBirthYear = (_key, value, builder) => {
  builder.selects.add('accounts.birth');
  return quiredFieldYear('birth', value, builder);
};
const quiredInterestsAny = (_key, value, builder) => {
  const values = value.split(',').map(s => `'${Utils.escapeString(s)}'`).join(', ');
  builder.wheres.push(`accounts.id IN (SELECT DISTINCT account_id FROM account_interests WHERE account_interests.interest IN (${values}))`);
};
const quiredInterestsContains = (_key, value, builder) => {
  const values = value.split(',').map(s => `'${Utils.escapeString(s)}'`);
  const sql = `id IN (SELECT account_id FROM account_interests WHERE account_interests.interest IN (${values.join(', ')})
               GROUP BY account_id HAVING COUNT(DISTINCT account_interests.interest) == ${values.length})`;
  builder.wheres.push(sql);
};
const quiredLikesAny = (_key, value, builder) => {
  builder.wheres.push(`accounts.id IN (SELECT DISTINCT account_id FROM account_likes WHERE account_likes.like_id IN (${value}))`);
};
const quiredLikesContains = (_key, value, builder) => {
  const values = value.split(',');
  const sql = `id IN (SELECT account_id FROM account_likes WHERE account_likes.like_id IN (${values.join(', ')})
               GROUP BY account_id HAVING COUNT(DISTINCT account_likes.like_id) == ${values.length})`;
  builder.wheres.push(sql);
};
const quiredFilter = (_key, value, builder) => {
  builder.limit = +value;
};

const quiredFieldsMapping = {
  'sex': quiredFieldEqDirect,
  'status': quiredFieldEqDirect,
  'city': quiredFieldEqDirect,
  'country': quiredFieldEqDirect,
  'likes': quiredLikesAny,
  'interests': quiredInterestsAny,
  'joined': quiredFieldYear,
  'birth': quiredFieldYear,
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
  'interests_contains': quiredInterestsContains,
  'interests_any': quiredInterestsAny,
  'likes_contains': quiredLikesContains,
  'premium_now': quiredPremiumNow,
  'premium_null': quiredPremiumNull,
  'limit': quiredFilter,

  'query_id': quiredFieldIgnore,
  'order': quiredFieldIgnore,
  'keys': quiredFieldIgnore
};

module.exports = class AccountsQuery {
  constructor(query_builder, request_query, current_ts) {
    this.builder = query_builder;
    this.query = request_query;
    this.current_ts = current_ts;
  }

  call() {
    this.builder.bindings = Object.assign(this.builder.bindings, this.query);
    this.filterAccounts();
  }

  filterAccounts() {
    for (const [key, value] of Object.entries(this.query)) {
      const f = quiredFieldsMapping[key];
      if (!f) throw 'bad_data';
      f(key, value, this.builder, this.current_ts);
    }
  }
};