const WebRequestHandler = require('./web_request_handler.js')

const displayedFields = ['id', 'email', 'status', 'fname', 'sname', 'birth', 'premium'];

module.exports = class GetAccountsRecommendHandler extends WebRequestHandler {
  constructor(...args) {
    super(...args);
    const user_id = Number(this.request.params.user_id);
    this.myAccount = this.data.accounts[user_id];
  }
  
  call() {
    if(!this.myAccount) {
      this.reply.code(404);
      return;
    }

    const limit = Number(this.request.query.limit);
    let accounts = this.filterAccounts()
                       .sort(this.compareAccounts)
                       .slice(0, limit);
    return { accounts: accounts.map(this.asJson) };
  }

  compareAccounts(a, b) {

    // Совместимость определяется как функция от двух пользователей: compatibility = f (me, somebody). Функция строится самими участниками, но так, чтобы соответствовать следующим правилам:

    // Наибольший вклад в совместимость даёт наличие статуса "свободны". Те кто "всё сложно" идут во вторую очередь, а "занятые" в третью и последнюю (очень вероятно их вообще не будет в ответе).
    // Далее идёт совместимость по интересам. Чем больше совпавших интересов у пользователей, тем более они совместимы.
    // Третий по значению параметр - различие в возрасте. Чем больше разница, тем меньше совместимость.
    // Те, у кого активирован премиум-аккаунт, пропихиваются в самый верх, вперёд обычных пользователей. Если таких несколько, то они сортируются по совместимости между собой.
    // Если общих интересов нет, то стоит считать пользователей абсолютно несовместимыми с compatibility = 0.
    // Если в ответе оказались одинаково совместимые пользователи (одни и те же status, interests, birth), то выводить их по возрастанию id
  }

  bindMethods() {
    this.asJson = this.asJson.bind(this);
    this.matchesQuery = this.matchesQuery.bind(this);
  }

  asJson(account) {
    return displayedFields.reduce((acc, key) => {
      acc[key] = account[key];
      return acc;
    }, {})
  }

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