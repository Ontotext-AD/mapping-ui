const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');

module.exports = (on) =>
{
  on('file:preprocessor', cypressTypeScriptPreprocessor);
};

module.exports = (on, config) => {
  on('task', {
    failed: require('cypress-failed-log/src/failed')(),
  })
};
