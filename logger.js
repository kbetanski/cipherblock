'use-strict';

const logLevel = process.env.LOG;

function debug(message) {
  if (logLevel === 'debug') {
    console.log(message);
  }
}

module.exports = { debug };
