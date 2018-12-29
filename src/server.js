const DataLoader = require('./data_loader.js');
const WebServer = require('./web_server.js');
const Orm = require('./orm.js');

const config = {
  data: {
    dataPath: '/tmp/data/',
    extractedDataDir: '/data'
  },
  db: {
    filePath: '/db.db',
    inMemory: true
  },
  web: {
    host: '0.0.0.0',
    port: 80
  }
};

const db = require('better-sqlite3')(config.db.filePath, { memory: config.db.inMemory });
const orm = new Orm(db);

const dataLoader = new DataLoader({ config: config, orm: orm });
const data = dataLoader.load();

const webServer = new WebServer({ config: config.web, data: data, orm: orm });
webServer.start();