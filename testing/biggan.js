const carrot = require('../src/carrot.js');

// start training creates network and trains them
let generator_network;
let discriminator_network;
async function startTraining() {
  // debugger;

  // generator network:
  // 10 inputs (random numbers) -> 3072 outputs (32*32*3)
  // discriminator network:
  // 3072 inputs -> 1 output (how likely to be real)
  generator_network = new carrot.Network(10, 3072);
  discriminator_network = new carrot.Network(3072, 1);

  // make a training set
  const batch_size = 1;
  const training_random_input = Array(batch_size);

  // generate some images using random numbers
  for (let i = 0; i < batch_size; i++) {
    let random_generator_input = Array(10).fill(0).map(val => Math.random());
    training_random_input[i] = random_generator_input;

    // let generator_out = generator_network.activate(random_generator_input);
    // training_images[i] = generator_out;
  }

  // filler output because .evolve requires an output. This will change in the future
  const filler_output = Array(3072).fill(0).map((val) => 0);

  // build a training set for the generator
  let training_set = Array(batch_size).fill({}).map((empty, index) => {
    return {
      input: training_random_input[index],
      output: filler_output,
    };
  });

  // learn
  console.log('started evolving the generator');
  await generator_network.evolve(training_set, {
    error: 100000,
    cost: (targets, outputs) => {
      console.log('cost function called');
      const error = outputs.reduce((total, val, ind) => {
        return total += Math.abs(val);
      });
      console.log('calculated error:', error);
      return error;
    },
    schedule: {
      iterations: 1,
      function: () => {
        console.log('an iteration just passed');
      },
    },
  });

  // debugger;

  // mix them between the real images

  // teach the discriminator network

  // repeat

}

// debugger;

startTraining();
