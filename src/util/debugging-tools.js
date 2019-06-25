
const INFO_COLOR = "\x1b[32m"; // foreground green
const RESET_COLOR = "\x1b[0m" // reset command

console.debugging = true;

const received_messages = {};

const realConsoleLog = console.log;
// much more useful console log
console.log = function (...params) {
  let string_counter = '';
  if (!(params.toString() in received_messages)) {
    received_messages[params.toString()] = 1;
  } else {
    string_counter = '#' + (++received_messages[params.toString()]).toString();
  }
  realConsoleLog(...params, INFO_COLOR, '@ms:' + Date.now(), string_counter, RESET_COLOR);
}

module.exports = console;
