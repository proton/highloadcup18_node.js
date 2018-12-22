const fs = require('fs');
const exec = require('child_process').exec;

module.exports = class DataLoader {
  constructor(dataConfig) {
    this.dataConfig = dataConfig;
    this.data = {
      accounts: [],
      ts: 0
    };

    this.afterUnzip = this.afterUnzip.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.addAccount = this.addAccount.bind(this);
  }

  load() {
    this.loadTimestamp();
    this.loadData();
    return this.data;
  }

  loadData() {
    exec(this.unzipCmd(), this.afterUnzip);
  }

  loadTimestamp() {
    const filePath = `${this.dataConfig.dataPath}/options.txt`;
    const content = fs.readFileSync(filePath, 'utf8');
    this.data.ts = Number(content.split("\n")[0]);
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
    global.gc();
    console.log(`loaded ${this.data.accounts.length - 1} accounts`);
  }

  addAccount(account) {
    this.data.accounts[account.id] = account;
  }

  unzipCmd() {
    const archivePath = `${this.dataConfig.dataPath}/data.zip`;
    return `unzip ${archivePath} -d ${this.dataConfig.extractedDataDir}`;
  }
};