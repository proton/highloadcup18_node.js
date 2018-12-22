const dataArchivePath = '/tmp/data/data.zip';
const extractedDataDir = '/data'

const fs = require('fs');
const exec = require('child_process').exec;
const fastify = require('fastify')({ logger: true });

let accounts = new Map();

exec(`unzip ${dataArchivePath} -d ${extractedDataDir}`, (error, _stdout, _stderr) => {
  if (error !== null) {
    console.log(`exec error: ${error}`);
    return;
  }

  fs.readdir(extractedDataDir, function(_err, files) {
    const fileNames = files.filter(el => /accounts_\d+.json$/.test(el));
    fileNames.forEach((fileName) => {
      console.log(`loading file ${fileName}`)
      const content = fs.readFileSync(`${extractedDataDir}/${fileName}`, 'utf8');
      const parsedContent = JSON.parse(content);
      parsedContent.accounts.forEach((account) => {
        accounts.set(account.id, account);
      })
    });
    console.log(accounts.get(1));
    console.log(`loaded ${accounts.size} accounts`);
  })
});


// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(80, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()