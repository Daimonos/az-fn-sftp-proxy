const parse = require('parse-multipart');
const fs = require('fs');
const os = require('os');
const Client = require('ssh2-sftp-client');
let sftp = new Client();

function writeTmpFile(fileName, data) {
  return new Promise((resolve, reject) => {
    let wStream = fs.createWriteStream(fileName);
    wStream.write(data, async err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      wStream.end();
      wStream.destroy();
    });
  });
}

module.exports = async function(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');
  let bodyBuffer = Buffer.from(req.body);
  // get boundary for multipart data e.g. ------WebKitFormBoundaryDtbT5UpPj83kllfw
  let boundary = parse.getBoundary(req.headers['content-type']);
  // parse the body
  let parts = parse.Parse(bodyBuffer, boundary);
  let fileName = `${os.tmpdir}/${parts[0].filename}`;
  let data = parts[0].data;
  // TODO: validate the file
  // Expecting csv mime-types, maybe size limitation?
  try {
    await writeTmpFile(fileName, data);
    const config = {
      host: process.env['APP-SFTP-SERVER-URL'],
      port: process.env['APP-SFTP-SERVER-PORT'],
      username: process.env['APP-SFTP-SERVER-USERNAME'],
      password: process.env['APP-SFTP-SERVER-PASSWORD']
    };
    await sftp.connect(config);
    await sftp.put(`${fileName}`, `${process.env['APP-SFTP-SERVER-FOLDER']}/${parts[0].filename}`);
    context.res = {
      body: 'Success'
    };
    sftp.end();
  } catch (err) {
    console.error(err);
    context.res = {
      body: {
        message: 'Error'
      },
      status: 500
    };
    sftp.end();
    context.done();
  }

  fs.unlinkSync(fileName);
};
