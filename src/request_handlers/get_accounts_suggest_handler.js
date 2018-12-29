const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsSuggestHandler extends WebRequestHandler {
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
    this.asJson = this.asJson.bind(this);
  }

  asJson(account) {
    if (account.premium_start) {
      account.premium = {
        start: account.premium_start,
        finish: account.premium_finish
      };
      delete account.premium_start;
      delete account.premium_finish;
    }

    for (const key in account)
      if (account[key] === null)
        delete account[key];

    return account;
  }

  filterAccounts() {
    const builder = new QueryBuilder(this.orm);
    const current_ts = this.data.ts;

    const accounts_query = new AccountsQuery(builder, this.request.query, current_ts);
    accounts_query.call();

    builder.wheres.push(`accounts.id NOT IN (SELECT like_id FROM account_likes WHERE account_id = ${this.myAccount.id})`);

    // тут по сути accounts.* join дата_моего_лайка join дата не_моего_лайка

    // builder.orders.push('simularity DESC');
    // builder.orders.push('account_likes.like_id DESC');

    // Теперь мы ищем, кого лайкают пользователи того же пола с похожими "симпатиями" и предлагаем тех, кого они недавно лайкали сами.

// Похожесть симпатий определим как функцию: similarity = f (me, account), которая вычисляется однозначно как сумма из дробей 1 / abs(my_like['ts'] - like['ts']), где my_like и like - это симпатии к одному и тому же пользователю. Если общих лайков нет, то стоит считать пользователей абсолютно непохожими с similarity = 0. Если у одного аккаунта есть несколько лайков на одного и того же пользователя с разными датами, то в формуле используется среднее арифметическое их дат.

// В ответе возвращается список тех, кого ещё не лайкал пользователь с указанным id, но кого лайкали пользователи с самыми похожими симпатиями. Сортировка по убыванию похожести, а между лайками одного такого пользователя - по убыванию id лайка.

    // builder.bindings.my_sex = this.myAccount.sex;
    // builder.wheres.push('accounts.sex != @my_sex');
    //
    // builder.orders.push(`(premium_start <= ${current_ts} AND premium_finish >= ${current_ts}) DESC`);
    // builder.orders.push("CASE accounts.status WHEN 'свободны' THEN 3 WHEN 'всё сложно' THEN 2 WHEN 'занятые' THEN 1 END DESC");
    // builder.orders.push('COUNT(account_interests.interest) DESC');
    // builder.orders.push(`ABS(accounts.birth - ${this.myAccount.birth}) ASC`);
    //
    // builder.join_interests = true;
    // builder.groups.push('accounts.id');
    // builder.wheres.push(`account_interests.interest IN (SELECT interest FROM account_interests WHERE account_id = ${this.myAccount.id})`);

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.selects.add('accounts.status');
    builder.selects.add('accounts.fname');
    builder.selects.add('accounts.sname');
    builder.selects.add('accounts.birth');
    builder.selects.add('accounts.premium_start');
    builder.selects.add('accounts.premium_finish');

    return builder.call().all();
  }
};