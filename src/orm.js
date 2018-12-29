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
    Orm.fillEmptyAccountFields(account);
    this.insertAccountQuery.run(account);

    if(account.interests) {
      const sql = 'INSERT INTO accounts_interest (account_id, interest) VALUES ' +
        account.interests.map(interest => `(${account.id}, '${interest}')`).join(', ');
      this.db.exec(sql);
    }

    if(account.likes) {
      const sql = 'INSERT INTO accounts_like (account_id, like_id, like_ts) VALUES ' +
        account.likes.map(like => `(${account.id}, ${like.id}, ${like.ts})`).join(', ');
      this.db.exec(sql);
    }

    if(account.premium) {
      const sql = 'INSERT INTO accounts_premium (account_id, start, finish) VALUES ' +
        `(${account.id}, ${account.premium.start}, ${account.premium.finish})`;
      this.db.exec(sql);
    }
  }

  accountsCount() {
    return this.db.prepare('SELECT COUNT(*) as cnt FROM accounts').get().cnt;
  }

  prepareStatements() {
    this.insertAccountQuery = this.db.prepare(`INSERT INTO accounts
      (id, email, fname, sname, status, country, city, phone, sex, joined, birth)
      VALUES (@id, @email, @fname, @sname, @status, @country, @city, @phone, @sex, @joined, @birth)`);
  }

  createTables() {
    this.db.exec(`CREATE TABLE accounts
    (id INTEGER PRIMARY KEY,
      email text, fname text,
      sname text, status text,
      country text, city text,
      phone text, sex text,
      joined integer, birth integer)
    `);

    this.db.exec(`CREATE TABLE accounts_like
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      like_id integer,
      like_ts integer,
      account_id integer,
      FOREIGN KEY(account_id) REFERENCES accounts(id))
    `);

    this.db.exec(`CREATE TABLE accounts_premium
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      start integer,
      finish integer,
      account_id integer,
      FOREIGN KEY(account_id) REFERENCES accounts(id))
    `);

    this.db.exec(`CREATE TABLE accounts_interest
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      interest text,
      account_id integer,
      FOREIGN KEY(account_id) REFERENCES accounts(id))
    `);
  }
};