const DataLoader = require('./data_loader.js');
const WebServer = require('./web_server.js');

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

const dataLoader = new DataLoader({ config: config.data, db: db });
const data = dataLoader.load();

const webServer = new WebServer({ config: config.web, data: data, db: db });
webServer.start();