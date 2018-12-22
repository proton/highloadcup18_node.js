const WebRequestHandler = require('./web_request_handler.js')

const displayedFields = ['id', 'email', 'status', 'fname', 'sname', 'birth', 'premium'];

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
    
      let accounts = this.filterAccounts()
                         .sort(this.compareAccounts)
                         .slice(0, this.limit);
      return { accounts: accounts.map(this.asJson) };
  }

  // Теперь мы ищем, кого лайкают пользователи того же пола с похожими "симпатиями" и предлагаем тех, кого они недавно лайкали сами.

  // Похожесть симпатий определим как функцию: similarity = f (me, account), которая вычисляется однозначно как сумма из дробей 1 / abs(my_like['ts'] - like['ts']), где my_like и like - это симпатии к одному и тому же пользователю. Если общих лайков нет, то стоит считать пользователей абсолютно непохожими с similarity = 0. Если у одного аккаунта есть несколько лайков на одного и того же пользователя с разными датами, то в формуле используется среднее арифметическое их дат.

  // В ответе возвращается список тех, кого ещё не лайкал пользователь с указанным id, но кого лайкали пользователи с самыми похожими симпатиями. Сортировка по убыванию похожести, а между лайками одного такого пользователя - по убыванию id лайка.


  compareAccounts(b, a) {
    // if(this.hasPremium(a) != this.hasPremium(b)) return this.hasPremium(a) ? 1 : -1
    // if(a.status != b.status) return statuses[a.status] - statuses[b.status];
    // const aCommonInterests = this.commonInterests(a);
    // const bCommonInterests = this.commonInterests(b);
    // if(aCommonInterests != bCommonInterests) return aCommonInterests - bCommonInterests;
    // const aAgeDiff = Math.abs(a.birth - this.myAccount.birth);
    // const bAgeDiff = Math.abs(b.birth - this.myAccount.birth);
    // if(aAgeDiff != bAgeDiff) return bAgeDiff - aAgeDiff;
    // return b.id - a.id;
  }

  commonInterests(account) {
    // if(!account.interests) return 0;
    // if(!this.myInterestsSet) this.myInterestsSet = new Set(this.myAccount.interests);
    // return account.interests.reduce((sum, obj) => this.myInterestsSet.has(obj) ? sum + 1 : sum, 0);
  }

  matchesQuery(account) {
    if (this.likedByMe(account)) return false;
    if (this.request.query.city && this.request.query.city != account.city) return false;
    if (this.request.query.country && this.request.query.country != account.country) return false;
    // if (commonInterests(account) == 0) return false;
    return true;
  }

  guysWhoLikedSamePeople() {
    let set = new Set();
    this.myAccount.likes.array.forEach(like => {
      // ? вообще похоже придётся по-старинке, на этапе загрузки
    });
  }

  likedByMe(account) {
    if(!this.myLikeSet) this.myLikeSet = new Set(this.myAccount.likes.map(like => like.id));
    return this.myLikeSet.has(account.id);
  }

  bindMethods() {
    this.compareAccounts = this.compareAccounts.bind(this);
    this.asJson = this.asJson.bind(this);
    this.matchesQuery = this.matchesQuery.bind(this);
  }

  asJson(account) {
    return displayedFields.reduce((acc, key) => {
      acc[key] = account[key];
      return acc;
    }, {})
  }
  
  filterAccounts() {
    return this.data.accounts.filter(this.matchesQuery);
  }
}