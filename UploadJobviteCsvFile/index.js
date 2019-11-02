const parse = require('parse-multipart');
const fs = require('fs');
const os = require('os');
const Client = require('ssh2-sftp-client');
let sftp = new Client();

module.exports = async function(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');
  let bodyBuffer = Buffer.from(req.body);
  // get boundary for multipart data e.g. ------WebKitFormBoundaryDtbT5UpPj83kllfw
  let boundary = parse.getBoundary(req.headers['content-type']);
  // parse the body
  let parts = parse.Parse(bodyBuffer, boundary);
  let fileName = `${os.tmpdir}/${parts[0].filename}`;
  let data = parts[0].data;
  let wStream = fs.createWriteStream(`${fileName}`);

  wStream.write(data, err => {
    if (err) {
      console.error(err);
      context.res = {
        body: {
          message: 'Error'
        },
        status: 500
      };
    }

    sftp
      .connect({
        host: process.env['APP-SFTP-SERVER-URL'],
        port: process.env['APP-SFTP-SERVER-PORT'],
        username: process.env['APP-SFTP-SERVER-USERNAME'],
        password: process.env['APP-SFTP-SERVER-PASSWORD']
      })
      .then(() => {
        return sftp.put(
          `${fileName}`,
          `${process.env['APP-SFTP-SERVER-FOLDER']}/${parts[0].filename}`
        );
      })
      .then(data => {
        wStream.close();
        wStream.destroy();
        sftp.end();
        fs.unlinkSync(`${fileName}`);
        context.done();
      })
      .catch(err => {
        context.res = {
          body: {
            message: 'Error'
          },
          status: 500
        };
        context.done();
      });
  });
};
