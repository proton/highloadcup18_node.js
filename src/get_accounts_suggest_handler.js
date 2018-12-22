const WebRequestHandler = require('./web_request_handler.js')

module.exports = class GetAccountsSuggestHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.data.accounts[user_id];
  }
  
  call() {
    if(!this.myAccount)
      return this.reply.code(404).type('text/html').send('Not Found');
    if(isNaN(this.limit))
      return this.reply.code(400).type('text/html').send('Error');

    return '';
    // console.log(this.request.params.user_id)
    // const accounts = this.filterAccounts();
    // return { accounts: accounts.map(this.asJson) };
  }

  // Теперь мы ищем, кого лайкают пользователи того же пола с похожими "симпатиями" и предлагаем тех, кого они недавно лайкали сами. В случае, если в запросе передан GET-параметр country или city, то искать "похожие симпатии" нужно только в определённой локации.

  // Похожесть симпатий определим как функцию: similarity = f (me, account), которая вычисляется однозначно как сумма из дробей 1 / abs(my_like['ts'] - like['ts']), где my_like и like - это симпатии к одному и тому же пользователю. Если общих лайков нет, то стоит считать пользователей абсолютно непохожими с similarity = 0. Если у одного аккаунта есть несколько лайков на одного и того же пользователя с разными датами, то в формуле используется среднее арифметическое их дат.

  // В ответе возвращается список тех, кого ещё не лайкал пользователь с указанным id, но кого лайкали пользователи с самыми похожими симпатиями. Сортировка по убыванию похожести, а между лайками одного такого пользователя - по убыванию id лайка.

  bindMethods() {
    // this.asJson = this.asJson.bind(this);
  }

  // asJson(account) {
  //   return this.displayedFields().reduce((acc, key) => {
  //     acc[key] = account[key];
  //     return acc;
  //   }, {})
  // }


  // displayedFields() {
  //   if(!this.displayed_fields) {
  //     this.displayed_fields = Object.keys(this.request.query)
  //                                   .map(key => dispayedFieldsMapping[key])
  //                                   .filter(key => key);
  //     this.displayed_fields = this.displayed_fields.concat(['id', 'email'])
  //   }
  //   return this.displayed_fields;
  // }

  // matchesQuery(account) {
  //   return Object.entries(this.request.query).every( ([key, value]) => {
  //     switch (key) {
  //       case 'sex_eq': return account.sex == value;
  //       case 'email_domain': return false; // 2	email	domain - выбрать всех, чьи email-ы имеют указанный домен;
  //       case 'email_lt': return false; // lt - выбрать всех, чьи email-ы лексикографически раньше;
  //       case 'email_gt': return false; // lt - выбрать всех, чьи email-ы лексикографически позже;
  //       case 'status_eq': return false; // 3	status	eq - соответствие конкретному статусу;
  //       case 'status_neq': return false; // neq - выбрать всех, чей статус не равен указанному;
  //       case 'fname_eq': return false;  // 4	fname	eq - соответствие конкретному имени;
  //       case 'fname_any': return false;  // any - соответствие любому имени из перечисленных через запятую;
  //       case 'fname_null': return false;  // null - выбрать всех, у кого указано имя (если 0) или не указано (если 1);
  //       case 'sname_eq': return false;  // 5	sname	eq - соответствие конкретной фамилии;
  //       case 'sname_starts': return false;  // starts - выбрать всех, чьи фамилии начинаются с переданного префикса;
  //       case 'sname_null': return false;  // null - выбрать всех, у кого указана фамилия (если 0) или не указана (если 1);
  //       case 'phone_code': return false;  // 6	phone	code - выбрать всех, у кого в телефоне конкретный код (три цифры в скобках);
  //       case 'phone_code_null': return false;  // null - аналогично остальным полям;
  //       case 'country_eq': return false;  // 7	country	eq - всех, кто живёт в конкретной стране;
  //       case 'country_null': return false;  // null - аналогично;
  //       case 'city_eq': return false;  // 8	city	eq - всех, кто живёт в конкретном городе;
  //       case 'city_any': return false;  // any - в любом из перечисленных через запятую городов;
  //       case 'city_null': return false;  // null - аналогично;
  //       case 'birth_lt': return false;  // 9	birth	lt - выбрать всех, кто родился до указанной даты;
  //       case 'birth_gt': return false;  // gt - после указанной даты;
  //       case 'year': return false;  // year - кто родился в указанном году;
  //       case 'interests_contains': return false;  // 10	interests	contains - выбрать всех, у кого есть все перечисленные интересы;
  //       case 'interests_any': return false;  // any - выбрать всех, у кого есть любой из перечисленных интересов;
  //       case 'likes_contains': return false;  // 11	likes	contains - выбрать всех, кто лайкал всех перечисленных пользователей (в значении - перечисленные через запятые id);
  //       case 'premium_now': return false;  // 12	premium	now - все у кого есть премиум на текущую дату;
  //       case 'premium_null': return false;  // null - аналогично остальным;
  //       case 'query_id': return true;
  //       case 'limit': return true;
  //       default:
  //         return false;
  //         //console.log([key, value, account[key], 'not implemented']);
  //     }
  //     return false;
  //   });
  
  //   return true;
  // }
  
  // filterAccounts() {
  //   let filteredAccounts = [];
  //   for(let id = this.data.accounts.length - 1; id >= 1; --id) {
  //     const account = this.data.accounts[id];
  //     if (this.matchesQuery(account)) {
  //       filteredAccounts.push(account);
  //       if (filteredAccounts.length == this.limit) break;
  //     }
  //   }
  //   return filteredAccounts;
  // }
}