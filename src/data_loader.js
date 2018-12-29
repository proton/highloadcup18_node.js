const fs = require('fs');
const exec = require('child_process').exec;

module.exports = class DataLoader {
  constructor({config, db}) {
    this.dataConfig = config;
    this.data = {
      ts: 0
    };
    this.db = db;

    this.afterUnzip = this.afterUnzip.bind(this);
    this.load = this.load.bind(this);
    this.loadFile = this.loadFile.bind(this);
  }

  load() {
    this.createTables();
    this.loadTimestamp();
    this.loadData();
    global.gc();
    return this.data;
  }

  loadData() {
    exec(this.unzipCmd(), this.afterUnzip);
    const accountsCount = this.db.prepare('SELECT COUNT(*) as cnt FROM accounts').get().cnt;
    console.log(`loaded ${accountsCount} accounts`);
  }

  loadTimestamp() {
    const filePath = `${this.dataConfig.dataPath}/options.txt`;
    const content = fs.readFileSync(filePath, 'utf8');
    this.data.ts = Number(content.split("\n")[0]);
  }

  createTables() {
    this.db.exec(`CREATE TABLE accounts
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      email text, fname text,
      sname text, status text,
      country text, city text,
      phone text, sex text,
      joined integer, birth integer,
      ext_id integer)
    `);

    this.db.exec(`CREATE TABLE accounts_like
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      like_id integer,
      like_ts integer,
      acc_id integer,
      FOREIGN KEY(acc_id) REFERENCES accounts(ext_id))
    `);

    this.db.exec(`CREATE TABLE accounts_premium
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      start integer,
      finish integer,
      acc_id integer,
      FOREIGN KEY(acc_id) REFERENCES accounts(ext_id))
    `);

    this.db.exec(`CREATE TABLE accounts_interest
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
      interest text,
      acc_id integer,
      FOREIGN KEY(acc_id) REFERENCES accounts(ext_id))
    `);
  }

  afterUnzip(error, _stdout, _stderr) {
    if (error !== null) {
      console.log(`exec error: ${error}`);
      return;
    }
  
    fs.readdir(this.dataConfig.extractedDataDir, (_err, fileNames) => {
      fileNames
        .filter(el => /accounts_\d+.json$/.test(el))
        .forEach(this.loadFile);
    });
  }

  loadFile(fileName) {
    console.log(`loading file ${fileName}`);
    const filePath = `${this.dataConfig.extractedDataDir}/${fileName}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedContent = JSON.parse(content);
    parsedContent.accounts.forEach(this.addAccount);
  }

  addAccount(account) {
    // if(!account.likes) account.likes = [];
    // this.data.accounts[account.id] = account;
  }

  unzipCmd() {
    const archivePath = `${this.dataConfig.dataPath}/data.zip`;
    return `unzip ${archivePath} -d ${this.dataConfig.extractedDataDir}`;
  }
};