const DataLoader = require('./data_loader.js');
const WebServer = require('./web_server.js');
const Orm = require('./orm.js');

const config = {
  data: {
    dataPath: '/tmp/data/',
    extractedDataDir: '/data'
  },
  db: {
    file_path: 'db.db'
  },
  web: {
    host: '0.0.0.0',
    port: 80
  }
};

const db = require('better-sqlite3')(config.db.file_path);
const orm = new Orm(db);

const dataLoader = new DataLoader({ config: config.data, orm: orm });
const data = dataLoader.load();

const webServer = new WebServer({ config: config.web, data: data, orm: orm });
webServer.start();