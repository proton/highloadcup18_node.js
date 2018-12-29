// const Utils = require('./utils.js');

module.exports = class Orm {
  constructor(db) {
    this.db = db;

    this.createTables();
    this.prepareStatements();
  }

  static fillEmptyAccountFields(account) {
    const attrs = ['id', 'email', 'fname', 'sname', 'status', 'country', 'city', 'phone', 'sex', 'joined', 'birth'];
    for (const attr of attrs)
      if(account[attr] === undefined)
        account[attr] = null;
  }

  addAccount(account) {
    if (account.premium) {
      account.premium_start = account.premium.start;
      account.premium_finish = account.premium.finish;
    }
    else account.premium_start = account.premium_finish = null;
    Orm.fillEmptyAccountFields(account);
    this.insertAccountQuery.run(account);

    if(account.interests) {
      const sql = 'INSERT INTO account_interests (account_id, interest) VALUES ' +
        account.interests.map(interest => `(${account.id}, '${interest}')`).join(', ');
      this.db.exec(sql);
    }

    if(account.likes) {
      const sql = 'INSERT INTO account_likes (account_id, like_id, like_ts) VALUES ' +
        account.likes.map(like => `(${account.id}, ${like.id}, ${like.ts})`).join(', ');
      this.db.exec(sql);
    }
  }

  accountsCount() {
    return this.db.prepare('SELECT COUNT(*) as cnt FROM accounts').get().cnt;
  }

  prepareStatements() {
    this.insertAccountQuery = this.db.prepare(`INSERT INTO accounts
      (id, email, fname, sname, status, country, city, phone, sex, joined, birth, premium_start, premium_finish)
      VALUES (@id, @email, @fname, @sname, @status, @country, @city, @phone, @sex, @joined, @birth, @premium_start, @premium_finish)`);
  }

  createTables() {
    const tables = this.existingTables();

    if (!tables.includes('accounts')) this.db.exec(`CREATE TABLE accounts
    (id INTEGER PRIMARY KEY,
      email text, fname text,
      sname text, status text,
      country text, city text,
      phone text, sex text,
      joined integer, birth integer,
      premium_start integer,
      premium_finish integer)
    `);

    if (!tables.includes('account_likes')) this.db.exec(`CREATE TABLE account_likes
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      like_id integer,
      like_ts integer,
      account_id integer,
      FOREIGN KEY(account_id) REFERENCES accounts(id))
    `);

    if (!tables.includes('account_interests')) this.db.exec(`CREATE TABLE account_interests
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      interest text,
      account_id integer,
      FOREIGN KEY(account_id) REFERENCES accounts(id))
    `);
  }

  existingTables() {
   return this.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").pluck().all();
  }
};