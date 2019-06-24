module.exports = TestWorker;

var cp = require('child_process');
var path = require('path');

/**
* Creates a fork for running tests
*
* @todo Create a `Fork` `@class`
* @todo Add `@prop` tags
* @todo Add `@param` tag types
* @todo Add `@param` tag descriptions
* @todo Add `@param` tag defaults
* @todo Document `@param` tag "optional" or "required"
*
* @private
*
* @constructs TestWorker
* @param dataSet
* @param cost
*/
let i = 1;
// methods is being passed as a parameter because for some reason this:
// var { methods } = require('../../../carrot');
// was returning methods === undefined
function TestWorker (dataset, cost, methods, multi) {
  // if cost is a standard function, make worker more efficient by only referencing the function
  // otherwise, the entire function is serialzed and deserialized
  const cost_is_standard_name = (cost.name in methods.cost);

  this.worker = cp.fork(path.join(__dirname, '/worker'), [], {
    env: {
      dataset: JSON.stringify(dataset),
      cost: cost_is_standard_name ? cost.name : cost,
      cost_is_standard_name,
    }
  });
  this.worker.send({dataset: dataset});
}

TestWorker.prototype = {
  /**
  * @todo Create a function description
  * @todo Add `@returns` tag
  * @todo Add `@param` tag types
  * @todo Add `@param` tag descriptions
  * @todo Add `@param` tag defaults
  * @todo Document `@param` tag "optional" or "required"
  *
  * @param network
  */
  evaluate: function (network) {
    return new Promise((resolve, reject) => {
      var serialized = network.serialize();

      var data = {
        activations: serialized[0],
        states: serialized[1],
        conns: serialized[2]
      };

      var _that = this.worker;
      this.worker.on('message', function callback (e) {
        _that.removeListener('message', callback);
        resolve(e);
      });
      // console.log('sending data to worker', data);
      this.worker.send(data);
    });
  },

  /**
  * @todo Create a function description
  */
  terminate: function () {
    this.worker.kill();
  }
};
