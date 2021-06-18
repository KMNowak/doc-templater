const path = require('path');
const fs = require('fs');
const lambdafs = require('lambdafs');
const { execSync } = require('child_process');
const AWS = require('aws-sdk');

const INPUT_PATH = path.join('/opt', 'lo.tar.br');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

let isLibreOfficeDecompressed = false;

// This lambda uses arn:aws:lambda:us-east-1:764866452798:layer:libreoffice-brotli:1 layer
// it unpacks Libre Office from that and uses it to convert pdfs

// In event there are below props required:
// fileName
// sourceBucketName
// targetBucketName

module.exports.handler = async (event) => {
  if (!isLibreOfficeDecompressed) {
    try {
      // Decompressing
      let decompressed = {
        file: await lambdafs.inflate(INPUT_PATH),
      };

      isLibreOfficeDecompressed = true;

      console.log('output brotli de:----', decompressed);
    } catch (error) {
      console.log('Error brotli de:----', error);
    }
  }

  const { sourceBucketName, fileName, targetBucketName } = event;
  console.log('s3 bucket file name from event:', fileName);
  console.log('s3 source bucket name from event:', sourceBucketName);
  console.log('s3 target bucket name from event:', sourceBucketName);

  const fileData = await s3.getObject({ Bucket: sourceBucketName, Key: fileName }).promise();
  try {
    fs.writeFileSync('/tmp/' + fileName, fileData.Body);
  } catch (err) {
    console.error('file write:', err);
  }

  const convertCommand = `export HOME=/tmp && /tmp/lo/instdir/program/soffice.bin --headless --norestore --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --convert-to "pdf:writer_pdf_Export" --outdir /tmp /tmp/${fileName}`;
  try {
    console.log(execSync(convertCommand).toString('utf8'));
  } catch (e) {
    console.log(execSync(convertCommand).toString('utf8'));
  }

  const fileParts = fileName.substr(0, fileName.lastIndexOf('.')) + '.pdf';
  const fileB64data = fs.readFileSync('/tmp/' + fileParts);

  await s3.upload({
    Bucket: targetBucketName,
    Body: fileB64data,
    Key: 'pdf/' + fileParts,
    ACL: 'public-read',
  }).promise();
  console.log('new pdf converted and uploaded!!!');
};
