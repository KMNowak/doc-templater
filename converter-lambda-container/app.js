const fs = require('fs');
const { execSync } = require('child_process');
const AWS = require('aws-sdk');
const lambdafs = require('lambdafs');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
let isLibreOfficeDecompressed = false;
// TODO: add regression
const lambdaHandler = async (event) => {
  if (!isLibreOfficeDecompressed) {
    try {
      let decompressed = {
        file: await lambdafs.inflate('lo.tar.br'),
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

  console.log('s3 file loaded');

  const LAMBDA_WRITABLE_TMP = '../../tmp';
  const SAVED_FILE_BODY_PATH = `${LAMBDA_WRITABLE_TMP}/` + fileName

  try {
    fs.writeFileSync(SAVED_FILE_BODY_PATH, fileData.Body);
  } catch (err) {
    console.error('file write:', err);
  }

  console.log('[DEBUG]: File written');

  // works only when los is copied to ../../tmp which is lambda's tmp file that has write privileges
  const convertCommand = `${LAMBDA_WRITABLE_TMP}/lo/instdir/program/soffice.bin --headless --norestore --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --convert-to "pdf:writer_pdf_Export" --outdir ${LAMBDA_WRITABLE_TMP} ${LAMBDA_WRITABLE_TMP}/${fileName}`;

  try {
    console.log(execSync(convertCommand).toString('utf8'));
  } catch (e) {
    console.log(execSync(convertCommand).toString('utf8'));
  }

  const fileParts = fileName.substr(0, fileName.lastIndexOf('.')) + '.pdf';
  const OUT_FILE_PATH = `${LAMBDA_WRITABLE_TMP}/` + fileParts
  const fileB64data = fs.readFileSync(OUT_FILE_PATH);

  await s3.upload({
    Bucket: targetBucketName,
    Body: fileB64data,
    Key: 'pdf/' + fileParts,
    ACL: 'public-read',
  }).promise();
  console.log('new pdf converted and uploaded!!!');

  fs.rmdirSync(SAVED_FILE_BODY_PATH, { recursive: true });
  fs.rmdirSync(OUT_FILE_PATH, { recursive: true });

  const response = {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify({
      sourceBucketName,
      targetBucketName,
      fileName,
    }),
  };

  return response;
};

exports.lambdaHandler = lambdaHandler;

