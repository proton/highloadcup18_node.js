const WebRequestHandler = require('../web_request_handler.js');
const QueryBuilder = require('../query_builder.js');
const AccountsQuery = require('../accounts_query.js');

module.exports = class GetAccountsSuggestHandler extends WebRequestHandler {
  call() {
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.orm.findAccount(user_id);

    if (!this.myAccount)
      return this.replyNotFound();
    if (isNaN(this.limit) || this.limit < 1 || this.limit > 200)
      return this.replyError();

    let accounts = this.filterAccounts();
    return { accounts: accounts.map(this.accountAsJson) };
  }

  bindMethods() {
    this.accountAsJson = this.accountAsJson.bind(this);
  }

  filterAccounts() {
    const current_ts = this.data.ts;

    const builder0 = new QueryBuilder(this.orm);
    const accounts_query = new AccountsQuery(builder0, this.request.query, current_ts);
    accounts_query.call();
    builder0.limit = null;

    let q = null;
    let r = null;

    // - ищем пользователей, которых лайкали те же, кто лайкал меня, сравниваем время, когда лайкали их, а когда меня

    builder0.from = 'account_likes';
    builder0.joins.push('INNER JOIN account_likes AS likes_to_me ON account_likes.account_id = likes_to_me.account_id');
    builder0.wheres.push(`likes_to_me.like_id = ${this.myAccount.id}`);
    builder0.joins.push(`INNER JOIN accounts ON accounts.id = account_likes.like_id`);
    builder0.bindings.my_sex = this.myAccount.sex;

    // likes_to_me.ts - время, когда likes_to_me.account_id лайкнул меня
    // account_likes.ts - время, когда account_likes.account_id (тот, кто лайкнул меня) лайкнул account_likes.like_id

    builder0.selects.add('account_likes.like_id AS account_id');
    builder0.selects.add('ABS((likes_to_me.ts) - (account_likes.ts)) AS likes_diff');
    ///

    // builder0.from = 'account_likes AS simular_account_likes';
    // builder0.joins.push('INNER JOIN account_likes AS my_likes ON simular_account_likes.account_id = my_likes.account_id');
    // builder0.wheres.push(`simular_account_likes.like_id != ${this.myAccount.id}`);
    // builder0.wheres.push(`my_likes.like_id = ${this.myAccount.id}`);
    //
    // builder0.selects.add('simular_account_likes.account_id');
    // builder0.selects.add('simular_account_likes.like_id');
    // builder0.selects.add('ABS(AVG(my_likes.ts) - AVG(simular_account_likes.ts)) AS likes_diff');
    // builder0.groups.push('simular_account_likes.account_id');
    // builder0.groups.push('simular_account_likes.like_id');
    //
    // // builder0.wheres.push('accounts.sex = @my_sex');
    //
    // builder0.orders.push('likes_diff ASC');
    // builder0.orders.push('likes_diff ASC');
    //
    // builder0.joins.push(`INNER JOIN accounts ON accounts.id = simular_account_likes.account_id`);
    // builder0.bindings.my_sex = this.myAccount.sex;

    // // //

    // builder0.from = 'account_likes AS simular_account_likes';
    // builder0.joins.push('INNER JOIN account_likes AS my_likes ON simular_account_likes.like_id = my_likes.like_id');
    // builder0.wheres.push(`simular_account_likes.account_id != ${this.myAccount.id}`);
    // builder0.wheres.push(`my_likes.account_id = ${this.myAccount.id}`);
    //
    // builder0.selects.add('simular_account_likes.account_id');
    // builder0.selects.add('simular_account_likes.like_id');
    // builder0.selects.add('ABS(AVG(my_likes.ts) - AVG(simular_account_likes.ts)) AS likes_diff');
    // builder0.groups.push('simular_account_likes.account_id');
    // builder0.groups.push('simular_account_likes.like_id');
    //
    // // builder0.wheres.push('accounts.sex = @my_sex');
    //
    // builder0.orders.push('likes_diff ASC');
    // builder0.orders.push('likes_diff ASC');

    // builder0.joins.push(`INNER JOIN accounts ON accounts.id = simular_account_likes.account_id`);
    // builder0.bindings.my_sex = this.myAccount.sex;
    // builder0.wheres.push('accounts.sex = @my_sex');


    // q = builder0.call();
    // console.log(builder0.sql());
    // r = q.all();
    // console.log(r);

    const builder1 = new QueryBuilder(this.orm);
    builder1.bindings = builder0.bindings;
    builder1.from = `(${builder0.sql()}) AS simular_likes`;

    builder1.selects.add('simular_likes.account_id');
    builder1.selects.add('SUM(CASE simular_likes.likes_diff WHEN 0 THEN 1 ELSE (1.0 / simular_likes.likes_diff) END) AS simularity');
    // builder1.selects.add('SUM(CASE simular_likes. WHEN 0 THEN 1 ELSE (1 / simular_likes.likes_diff) END) AS simularity');
    builder1.groups.push('simular_likes.account_id');
    builder1.orders.push('SUM(CASE simular_likes.likes_diff WHEN 0 THEN 1 ELSE (1.0 / simular_likes.likes_diff) END) DESC');

    const builder = new QueryBuilder(this.orm);
    builder.bindings = builder1.bindings;
    builder.from = `(${builder1.sql()}) AS simular_accounts`;

    builder.joins.push(`INNER JOIN account_likes ON account_likes.account_id = simular_accounts.account_id`);
    // builder.selects.add('simular_accounts.simularity');
    // builder.selects.add('simular_accounts.account_id');
    // builder.selects.add('account_likes.ts');
    builder.wheres.push(`account_likes.like_id NOT IN (SELECT like_id FROM account_likes WHERE account_id = ${this.myAccount.id})`);
    builder.wheres.push(`account_likes.like_id != ${this.myAccount.id}`);

    builder.orders.push('simularity DESC');
    builder.orders.push('account_likes.ts DESC');
    // builder.orders.push('account_likes.like_id DESC');

    builder.joins.push(`INNER JOIN accounts ON accounts.id = account_likes.like_id`);


    // builder.selects.add('accounts.sex');

    builder.selects.add('accounts.id');
    builder.selects.add('accounts.email');
    builder.selects.add('accounts.status');
    builder.selects.add('accounts.fname');
    builder.selects.add('accounts.sname');
    builder.selects.add('accounts.birth');
    builder.selects.add('accounts.premium_start');
    builder.selects.add('accounts.premium_finish');

    // builder.wheres.push('accounts.id = 9923');

    builder.limit = this.limit;

    // BODY   EXP: {"accounts":[{"status":"\u0432\u0441\u0451 \u0441\u043b\u043e\u0436\u043d\u043e","fname":"\u0418\u043d\u0435\u0441\u0441\u0430","id":9876,"email":"pehsildesaetyt@ya.ru","sname":"\u0424\u0435\u0442\u043b\u0435\u043d\u0442\u0435\u0432\u0430"},{"status":"\u0441\u0432\u043e\u0431\u043e\u0434\u043d\u044b","id":9690,"email":"otethot@mail.ru"},{"status":"\u0437\u0430\u043d\u044f\u0442\u044b","fname":"\u0422\u0430\u0442\u044c\u044f\u043d\u0430","id":9616,"email":"tinegdefecpaf@me.com","sname":"\u041b\u0435\u0431\u044b\u043a\u0430\u0442\u0438\u043d\u0430"},{"status":"\u0437\u0430\u043d\u044f\u0442\u044b","fname":"\u041c\u0438\u0440\u0440\u0430","id":9610,"email":"wenylimanitnollehe@yahoo.com","sname":"\u0414\u0430\u043d\u0443\u0448\u0443\u043d\u0430\u044f"}]}

    // q = builder.call();
    // console.log(builder.sql());
    // r = q.all();
    // console.log(r);

    ///
    //
    // console.log(this.request.query);
    // console.log(this.orm.db.prepare(`SELECT * FROM accounts WHERE id = 9972`).all());
    // console.log(this.orm.db.prepare(`SELECT * FROM account_likes WHERE account_id = 3613`).all());
    // console.log(this.orm.db.prepare(`SELECT * FROM account_likes WHERE like_id = 9972`).all());

    return builder.call().all();
  }
};