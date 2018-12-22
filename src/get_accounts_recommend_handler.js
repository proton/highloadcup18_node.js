const WebRequestHandler = require('./web_request_handler.js')

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.data.accounts[user_id];
  }
  
  call() {
    if(!this.myAccount) {
      reply.code(404);
      return;
    }

    const accounts = this.filterAccounts();
    return '';
    // console.log(this.request.params.user_id)
    // return { accounts: accounts.map(this.asJson) };
  }

//   Данный запрос используется для поиска "второй половинки" по указанным пользовательским данным. В запросе передаётся id пользователя, для которого ищутся те, кто лучше всего совместимы по статусу, возрасту и интересам. Решение должно проверять совместимость только с противоположным полом (мы не против секс-меньшинств и осуждаем дискриминацию, просто так получилось :) ). Если в GET-запросе передана страна или город с ключами country и city соответственно, то нужно искать только среди живущих в указанном месте.

// В ответе ожидается код 200 и структура {"accounts": [ ... ]} либо код 404 , если пользователя с искомым id не обнаружено в хранимых данных. По ключу "accounts" должны быть N пользователей, сортированных по убыванию их совместимости с обозначенным id. Число N задаётся в запросе GET-параметром limit и не бывает больше 20.

// Совместимость определяется как функция от двух пользователей: compatibility = f (me, somebody). Функция строится самими участниками, но так, чтобы соответствовать следующим правилам:

// Наибольший вклад в совместимость даёт наличие статуса "свободны". Те кто "всё сложно" идут во вторую очередь, а "занятые" в третью и последнюю (очень вероятно их вообще не будет в ответе).
// Далее идёт совместимость по интересам. Чем больше совпавших интересов у пользователей, тем более они совместимы.
// Третий по значению параметр - различие в возрасте. Чем больше разница, тем меньше совместимость.
// Те, у кого активирован премиум-аккаунт, пропихиваются в самый верх, вперёд обычных пользователей. Если таких несколько, то они сортируются по совместимости между собой.
// Если общих интересов нет, то стоит считать пользователей абсолютно несовместимыми с compatibility = 0.
// В итоговом списке необходимо выводить только следующие поля: id, email, status, fname, sname, birth, premium, interests. Если в ответе оказались одинаково совместимые пользователи (одни и те же status, interests, birth), то выводить их по возрастанию id
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

  matchesQuery(account) {
    return Object.entries(this.request.query).every( ([key, value]) => {
      switch (key) {
        case 'city': return (account.city == value);
        case 'country': return (account.country == value);
      }
      return true;
    });
  }
  
  filterAccounts() {
    return this.data.accounts.filter(this.matchesQuery);
  }
}