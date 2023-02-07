const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');
const fs = require('fs');

module.exports = (on) =>
{
  on('file:preprocessor', cypressTypeScriptPreprocessor);
};

module.exports = (on, config) => {
  on('task', {
    failed: require('cypress-failed-log/src/failed')(),
    readFileOrNull: (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  })
};
