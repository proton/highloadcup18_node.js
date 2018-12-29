const fs = require('fs');
const spawn = require('child_process');
const Utils = require('./utils.js');

module.exports = class DataLoader {
  constructor({config, orm}) {
    this.config = config;
    this.orm = orm;

    this.data = {
      ts: 0
    };
  }

  load() {
    this.loadTimestamp();
    if(!this.databaseExists()) this.loadData();
    global.gc();
    return this.data;
  }

  databaseExists() {
    return fs.existsSync(this.config.db.filePath);
  }

  loadData() {
    spawn.execSync(this.unzipCmd());

    const fileNames = fs.readdirSync(this.config.data.extractedDataDir)
                        .filter(el => /accounts_\d+.json$/.test(el));
    for (const fileName of fileNames) this.loadFile(fileName);

    const accountsCount = this.orm.accountsCount();
    Utils.log(`loaded ${accountsCount} accounts`);
  }

  loadTimestamp() {
    const filePath = `${this.config.data.dataPath}/options.txt`;
    const content = fs.readFileSync(filePath, 'utf8');
    this.data.ts = Number(content.split("\n")[0]);
  }

  loadFile(fileName) {
    Utils.log(`loading file ${fileName}`);
    const filePath = `${this.config.data.extractedDataDir}/${fileName}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedContent = JSON.parse(content);
    for (const account of parsedContent.accounts) {
      if( account.id % 1000 === 0) Utils.log(`loading account ${account.id}`);
      this.orm.addAccount(account);
    }
  }

  unzipCmd() {
    const archivePath = `${this.config.data.dataPath}/data.zip`;
    return `unzip ${archivePath} -d ${this.config.data.extractedDataDir}`;
  }
};