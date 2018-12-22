const DataLoader = require('./data_loader.js');
const WebServer = require('./web_server.js');

const config = {
  data: {
    dataArchivePath: '/tmp/data/data.zip',
    extractedDataDir: '/data'
  },
  web: {
    host: '0.0.0.0',
    port: 80
  }
}

const dataLoader = new DataLoader(config.data);
const data = dataLoader.load();

const webServer = new WebServer(config.web, data);
webServer.start();