const logInfo = (message) => console.log(`[INFO]: ${message}`);
const logError = (error) => console.log(`[ERROR]: ${error}`);

module.exports = {
  logError,
  logInfo,
};
