
const INFO_COLOR = "\x1b[32m"; // foreground green
const RESET_COLOR = "\x1b[0m" // reset command

console.debugging = true;

// map from message to number of apparitions
const received_messages = {};

// map from timer flag to { average_time_between, counter_of_apparitions, time_of_last_appearance }
const timer_counter = {}

const realConsoleLog = console.log;
// much more useful console log
// timer has either 'start' or 'end'
console.log = function (msg, { timer_flag, timer } = {}) {
  time_now = Date.now();

  let string_timer = '';
  if (timer_flag) {
    if (!(timer_flag in timer_counter)) {
      // never used the flag before
      // add flag to map
      timer_counter[timer_flag] = {};
      timer_data = timer_counter[timer_flag];
      timer_data.average_time_between = 0;
      timer_data.counter_of_apparitions = 0;
      timer_data.time_of_last_appearance = time_now;
    } else {
      timer_data = timer_counter[timer_flag];
      if (timer === 'start') {
        if (timer_data.time_of_last_appearance !== 0) {
          throw new Error('Sent a start signal without sending an end signal');
        }
        timer_data.time_of_last_appearance = time_now;
      } else if (timer !== 'end') throw new Error('timer signal not recognized');
      else {
        if (timer_data.time_of_last_appearance === 0) {
          throw new Error('Sent an end signal without sending a start signal');
        }
        // timer is end
        timer_data.average_time_between = (
          timer_data.average_time_between * timer_data.counter_of_apparitions +
          (time_now - timer_data.time_of_last_appearance)) / (++timer_data.counter_of_apparitions);
        string_timer = string_timer + timer_data.average_time_between;
        timer_data.time_of_last_appearance = 0;
      }
    }
  }

  let string_counter = '';
  if (!(msg.toString() in received_messages)) {
    received_messages[msg.toString()] = 1;
  } else {
    string_counter = '#' + (++received_messages[msg.toString()]).toString();
  }
  realConsoleLog(msg, INFO_COLOR, '@ms:' + time_now,
    string_counter, ' ' + string_timer, RESET_COLOR);
}



module.exports = console;
