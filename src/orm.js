const Utils = require('./utils.js');

module.exports = class Orm {
  constructor(db) {
    this.db = db;

    this.createTables();
    this.prepareStatements();
  }

  static fillEmptyAccountFields(account) {
    for (const attr of Utils.accountAttrs)
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

  validateFields(data) {
    if (data.email && !data.email.includes('@')) return false;
    if (data.birth && isNaN(data.birth)) return false;
    if (data.joined && isNaN(data.joined)) return false;
    if (data.premium && typeof data.premium !== 'object') return false;
    if (data.sex && data.sex !== 'f' && data.sex !== 'm') return false;
    return true;
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

  createIndexes() {
    this.db.exec('CREATE INDEX account_country ON accounts (country)');
    this.db.exec('CREATE INDEX account_city ON accounts (city)');
    this.db.exec('CREATE INDEX account_joined ON accounts (joined)');
    this.db.exec('CREATE INDEX account_birth ON accounts (birth)');
    this.db.exec('CREATE INDEX account_interest_interest ON account_interests (interest)');
    this.db.exec('CREATE INDEX account_like_like_id ON account_likes (like_id)');
  // TODO: premium partial! CREATE INDEX po_parent ON purchaseorder(parent_po) WHERE parent_po IS NOT NULL;
  // TODO: joined/birth as year?
  }

  existingTables() {
   return this.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").pluck().all();
  }
};