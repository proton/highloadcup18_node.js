const fs = require('fs');
const exec = require('child_process').exec;

module.exports = class DataLoader {
  constructor({dataArchivePath, extractedDataDir}) {
    this.dataArchivePath = dataArchivePath;
    this.extractedDataDir = extractedDataDir;
    this.data = {
      accounts: []
    };

    this.afterUnzip = this.afterUnzip.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.addAccount = this.addAccount.bind(this);
  }

  load() {
    exec(this.unzipCmd(), this.afterUnzip);
    // global.gc();
    return this.data;
  }

  afterUnzip(error, _stdout, _stderr) {
    if (error !== null) {
      console.log(`exec error: ${error}`);
      return;
    }
  
    fs.readdir(this.extractedDataDir, (_err, fileNames) => {
      fileNames
        .filter(el => /accounts_\d+.json$/.test(el))
        .forEach(this.loadFile);
      console.log(`loaded ${this.data.accounts.length - 1} accounts`);
    });
  }

  loadFile(fileName) {
    console.log(`loading file ${fileName}`);
    const filePath = `${this.extractedDataDir}/${fileName}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedContent = JSON.parse(content);
    parsedContent.accounts.forEach(this.addAccount);
  }

  addAccount(account) {
    this.data.accounts[account.id] = account;
  }

  unzipCmd() {
    return `unzip ${this.dataArchivePath} -d ${this.extractedDataDir}`;
  }
};