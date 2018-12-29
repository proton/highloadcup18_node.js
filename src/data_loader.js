const fs = require('fs');
const spawn = require('child_process');
const Utils = require('./utils.js');

module.exports = class DataLoader {
  constructor({config, orm}) {
    this.dataConfig = config;
    this.data = {
      ts: 0
    };
    this.orm = orm;

    this.load = this.load.bind(this);
  }

  load() {
    this.loadTimestamp();
    this.loadData();
    global.gc();
    return this.data;
  }

  loadData() {
    spawn.execSync(this.unzipCmd());

    const fileNames = fs.readdirSync(this.dataConfig.extractedDataDir)
                        .filter(el => /accounts_\d+.json$/.test(el));
    for (const fileName of fileNames) this.loadFile(fileName);

    const accountsCount = this.orm.accountsCount();
    Utils.log(`loaded ${accountsCount} accounts`);
  }

  loadTimestamp() {
    const filePath = `${this.dataConfig.dataPath}/options.txt`;
    const content = fs.readFileSync(filePath, 'utf8');
    this.data.ts = Number(content.split("\n")[0]);
  }

  loadFile(fileName) {
    Utils.log(`loading file ${fileName}`);
    const filePath = `${this.dataConfig.extractedDataDir}/${fileName}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedContent = JSON.parse(content);
    for (const account of parsedContent.accounts) {
      if( account.id % 1000 === 0) Utils.log(`loading account ${account.id}`);
      this.orm.addAccount(account);
    }
  }

  unzipCmd() {
    const archivePath = `${this.dataConfig.dataPath}/data.zip`;
    return `unzip ${archivePath} -d ${this.dataConfig.extractedDataDir}`;
  }
};