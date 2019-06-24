
/*
 *
 * @private
 *
 */

var { multi, methods } = require('../../../carrot');

let dataset; // array
let cost; // function

var F = multi.activations;

process.on('message', function (e, test_param) {
  // if this worker is being called the first time,
  // then must get cost and dataset from environment variables
  if (!cost || !dataset) {
    const env = process.env;

    // get cost function
    if (env.cost_is_standard_name) {
      cost = methods.cost[env.cost];
    } else {
      // if cost is not the name of a function in methods.cost, then
      // cost is a serialized function (string) that has to be evaluated
      cost = eval(env.cost);
    }

    // get dataset
    dataset = JSON.parse(env.dataset);
    // let test = '[' + env.dataset + ']';
    // dataset = multi.deserializeDataSet(env.dataset);
    // dataset_test = multi.deserializeDataSet(test);
    // console.log('start of console logs');
    // console.log('env.dataset', env.dataset);
    // console.log('JSON.parse(env.dataset)', JSON.parse(env.dataset));
    // console.log('dataset', dataset);
    // console.log('dataset_test', dataset_test);
    // console.log('e.dataset', e.dataset);
    // console.log('multi.deserializeDataSet(e.dataset)', multi.deserializeDataSet(e.dataset));
    // console.log('JSON.parse(e.dataset)', e.dataset);
  }

  var A = e.activations;
  var S = e.states;
  var data = e.conns;

  var result = multi.testSerializedSet(dataset, cost, A, S, data, F);

  process.send(result);
});
