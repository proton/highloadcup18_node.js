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

    // if(!account.likes) account.likes = [];
    // this.data.accounts[account.id] = account;
  }

  // for interest in obj.get('interests', []):
  // interest_cache.append((obj.get('id'), interest))
  //
  // for like in obj.get('likes', []):
  // like_cache.append((obj.get('id'), like.get('like_id'), like.get('like_ts')))
  //
  // premium = obj.get('premium', {})
  // if premium:
  //   premium_cache.append((obj.get('id'), premium.get('start'), premium.get('finish')))

  // def load_slice(account_cache, interest_cache, like_cache, premium_cache, cursor, conn):
  // try:
  //   cursor.executemany("""INSERT INTO accounts
  // (email, fname, sname, status, country, city, phone, sex, joined, birth, ext_id)
  // VALUES (?,?,?,?,?,?,?,?,?,?,?)""", account_cache)
  // conn.commit()
  // cursor.executemany("INSERT INTO accounts_interest (account_id, interest) VALUES (?,?)", interest_cache)
  // cursor.executemany("INSERT INTO accounts_like (account_id, like_id, like_ts) VALUES (?,?,?)", like_cache)
  // cursor.executemany("INSERT INTO accounts_premium (account_id, start, finish) VALUES (?,?,?)", premium_cache)

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