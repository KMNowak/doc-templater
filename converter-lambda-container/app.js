const fs = require('fs');
const { execSync } = require('child_process');
const AWS = require('aws-sdk');
const lambdafs = require('lambdafs');
const { getReasonPhrase, StatusCodes } = require('http-status-codes');
const { paramsSchema } = require('./validation');
const { logInfo, logError } = require('./logger');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const getResponse = (statusCode, body) => ({
  statusCode,
  isBase64Encoded: false,
  body: JSON.stringify(body),
});

const decompressLibreOffice = async (isLibreOfficeDecompressed, setIsLibreOfficeDecompressed) => {
  if (!isLibreOfficeDecompressed) {
    try {
      let decompressed = {
        file: await lambdafs.inflate('lo.tar.br'),
      };

      setIsLibreOfficeDecompressed(true);

      logInfo(`Output of brotli decompression: ${JSON.stringify(decompressed)}`);
    } catch (error) {
      throw error;
    }
  }
};

let isLibreOfficeDecompressed = false;
const setIsLibreOfficeDecompressed = (value) => isLibreOfficeDecompressed = value;

module.exports.lambdaHandler = async (event) => {
  try {
    // accept both direct events and HTTP POST from APIGateway
    const params = event.body ? JSON.parse(event.body) : event;

    const { error } = paramsSchema.validate(params);

    if (error) {
      return getResponse(StatusCodes.BAD_REQUEST, {
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
        error,
      });
    }

    try {
      await decompressLibreOffice(isLibreOfficeDecompressed, setIsLibreOfficeDecompressed);
    } catch (e) {
      return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: `Could not decompress Libre Office. Please check logs.`,
        error: e,
      });
    }

    const { sourceBucketName, fileName, targetBucketName } = params;
    const fileData = await s3.getObject({ Bucket: sourceBucketName, Key: fileName })
      .promise()
      .catch(e => {
        throw e;
      });

    logInfo('S3 file loaded');

    const LAMBDA_WRITABLE_TMP = '../../tmp';
    const SOURCE_FILE_PATH = `${LAMBDA_WRITABLE_TMP}/` + fileName;

    try {
      fs.writeFileSync(SOURCE_FILE_PATH, fileData.Body);
    } catch (err) {
      logError(`'File write: ${err}`);
    }

    // works only when Libre Office is copied to ../../tmp which is lambda's tmp file that has write privileges
    const convertCommand = `${LAMBDA_WRITABLE_TMP}/lo/instdir/program/soffice.bin --headless --norestore --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --convert-to "pdf:writer_pdf_Export" --outdir ${LAMBDA_WRITABLE_TMP} ${SOURCE_FILE_PATH}`;

    try {
      console.log(execSync(convertCommand).toString('utf8'));
    } catch (e) {
      console.log(execSync(convertCommand).toString('utf8'));
    }

    const outFileName = fileName.substr(0, fileName.lastIndexOf('.')) + '.pdf';
    const OUT_FILE_PATH = `${LAMBDA_WRITABLE_TMP}/` + outFileName;
    const fileB64data = fs.readFileSync(OUT_FILE_PATH);

    await s3.upload({
      Bucket: targetBucketName,
      Body: fileB64data,
      Key: outFileName,
      ACL: params.ACL || 'private',
    }).promise()
      .catch(e => {
        throw e;
      });

    fs.rmdirSync(SOURCE_FILE_PATH, { recursive: true });
    fs.rmdirSync(OUT_FILE_PATH, { recursive: true });

    return getResponse(StatusCodes.OK, {
      sourceBucketName,
      outFileName,
      targetBucketName,
    });
  } catch (error) {
    return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
      error,
      message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
  }
};
