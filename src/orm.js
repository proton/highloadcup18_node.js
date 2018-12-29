const Utils = require('./utils.js');

module.exports = class Orm {
  constructor(db) {
    this.db = db;

    this.createTables();
    this.prepareStatements();
  }

  static fillEmptyAccountFields(account) {
    const attrs = Utils.accountAttrs;
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

  updateAccount(account, updates) {
    if (updates.interests) {
      this.db.exec(`DELETE FROM account_interests WHERE account_id = ${account.id}`);
      const sql = 'INSERT INTO account_interests (account_id, interest) VALUES ' +
        updates.interests.map(interest => `(${account.id}, '${interest}')`).join(', ');
      this.db.exec(sql);
      delete updates.interests;
    }

    if(updates.likes) {
      this.db.exec(`DELETE FROM account_likes WHERE account_id = ${account.id}`);
      const sql = 'INSERT INTO account_likes (account_id, like_id, like_ts) VALUES ' +
        updates.likes.map(like => `(${account.id}, ${like.id}, ${like.ts})`).join(', ');
      this.db.exec(sql);
      delete updates.likes;
    }

    if ( updates.hasOwnProperty('premium')) {
      if (updates.premium) {
        updates.premium_start = updates.premium.start;
        updates.premium_finish = updates.premium.finish;
      }
      else updates.premium_start = updates.premium_finish = null;
      delete updates.premium;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const sql = 'UPDATE accounts SET ' + keys.map(k => `${k} = @${k}`).join(', ') + ` WHERE id = ${account.id}`;
    this.db.prepare(sql).run(updates);
  }

  addLikes(likes) {
    const sql = 'INSERT INTO account_likes (account_id, like_id, like_ts) VALUES ' +
      likes.map(like => `(${like.liker}, ${like.likee}, ${like.ts})`).join(', ');
    this.db.exec(sql);
  }

  findAccount(id) {
    return this.selectAccountQuery.get(id);
  }

  isAccountExists(id) {
    return this.esistAccountQuery.get(id);
  }

  accountsCount() {
    return this.db.prepare('SELECT COUNT(*) as cnt FROM accounts').get().cnt;
  }

  prepareStatements() {
    this.insertAccountQuery = this.db.prepare(`INSERT INTO accounts
      (id, email, fname, sname, status, country, city, phone, sex, joined, birth, premium_start, premium_finish)
      VALUES (@id, @email, @fname, @sname, @status, @country, @city, @phone, @sex, @joined, @birth, @premium_start, @premium_finish)`);
    this.selectAccountQuery = this.db.prepare('SELECT * FROM accounts WHERE id = ?');
    this.esistAccountQuery = this.db.prepare('SELECT 1 FROM accounts WHERE id = ?');
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