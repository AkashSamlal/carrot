const _ = require('lodash')
const { assert, expect } = require('chai')
const should = require('chai').should()
const {
  Network,
  methods,
  config,
  architect
} = require('../../../src/carrot')


const mutation = methods.mutation;


// stage mutation methods to avoid false negatives on recurrent mutation methods
mutation.FFW = mutation.ALL

/**
 *
 * There are 5 questions every unit test must answer.
 *
 * What is the unit under test (module, function, class, whatever)?
 * What should it do? (Prose description)
 * What was the actual output?
 * What was the expected output?
 * How do you reproduce the failure?
 *
 */
 
 describe('Network', function(){
   describe('.mutate()', function() {
     
     describe('mutation.SUB_NODE', function() {
       it('given a network with 7 nodes, should produce a network with 6', function(){
         const network = new architect.Random(2,3,2);
         
         network.mutate(mutation.SUB_NODE);
         
         assert.equal(6, network.nodes.length)
       });
       
       it('given a network with no hidden nodes, should keep network unchanged', function(){
         // Update "new Network" to allow for hidden nodes
         const network = new architect.Random(2,0,2); // strange workaround
         const network2 = _.cloneDeepWith(network)
         
         network2.mutate(mutation.SUB_NODE);
         
         assert.deepEqual(network.toJSON(), network2.toJSON())
       });
       
       it('given mutation.SUB_NODE.mutateOutput = false, should leave output nodes unchanged', function() {
         const network = new architect.Random(2,50,2);
         
         const outputs = _.filter(network.nodes, (node) => {
           return (node.type === 'output')
         })
         
         const total = network.nodes.length;
         for(let i = 0; i < total; i++) {
           network.mutate(mutation.SUB_NODE)
         }

         assert.deepEqual(outputs, _.filter(network.nodes, (node) => { return (node.type === 'output') }))
       })
       
     });
   
     
   });
   
   describe('.getPossibleMutations()', function() {
     
     describe('mutation.SUB_NODE', function() {
       it('given a network with 1 hidden node, should return SUB_NODE', function() {
         const network = new architect.Random(2,3,2);
         const possible = network.getPossibleMutations();
         
         assert.equal(mutation.SUB_NODE, _.find(possible, (p) => { return p.name === "SUB_NODE" }))
       })
       
       it('given a network with no hidden nodes, should NOT return SUB_NODE', function() {
         const network = new architect.Random(2,0,2);
         const possible = network.getPossibleMutations();
         
         assert.equal(null, _.find(possible, (p) => { return p.name === "SUB_NODE" }))
       })
     });
     
     describe('mutation.ADD_CONN', function() {
       
       // less than max connections
       it('given 7 neurons, 19 possible, and less than 19 actual connections, should return ADD_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_CONN, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // exactly max connections - 1
       it('given 9 neurons, 27 possible connections, and 26 actual, should return ADD_CONN', function() {
         const network = new architect.Perceptron(3,2,4);
         
         let i = 12; // 14 initial hidden connections, + 12 input to output connections
         while(i--)
          network.mutate(mutation.ADD_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_CONN, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // exactly max connections
       it('given 9 neurons, 27 possible connections, and 27 actual, should NOT return ADD_CONN', function() {
         const network = new architect.Perceptron(3,2,4);
         
         let i = 13; // 14 initial hidden connections, + 13 input to output possible connections
         while(i--)
          network.mutate(mutation.ADD_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // exactly max connections
       it('given 7 neurons, 19 possible connections, and 19 actual, should NOT return ADD_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)
         network.mutate(mutation.ADD_CONN)

         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // exactly max connections
       it('given 9 neurons, 24 possible connections, and 24 actual, should NOT return ADD_CONN', function() {
         const network = new architect.Perceptron(4,1,4);
         
         let i = 16; // 8 initial hidden connections, + 16 input to output possible connections
         while(i--)
          network.mutate(mutation.ADD_CONN)
 
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // hopfield network
       it('given a Hopfield network, should NOT return ADD_CONN', function() {
         const network = new architect.Hopfield(3);
         const possible = network.getPossibleMutations();
         
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
       // 1 input neuron & 1 output neuron
       it('given 1 input & 1 output, should NOT return ADD_CONN', function() {
         const network = new Network(1,1);
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_CONN" }))
       });
       
     });
     
     describe('mutation.SUB_CONN', function() {
       it('given a network with more than 1 connection, should return mutation.SUB_CONN', function() {
         const network = new architect.Random(2,3,1);
         const possible = network.getPossibleMutations();
         
         assert.equal(mutation.SUB_CONN, _.find(possible, (p) => { return p.name === "SUB_CONN" }))
       })
       
       it('given a network with 1 connection, should NOT return mutation.SUB_CONN', function() {
         const network = new architect.Random(1,0,1);
         const possible = network.getPossibleMutations();
         
         assert.equal(null, _.find(possible, (p) => { return p.name === "SUB_CONN" }))
       })
     });
     
     describe('mutation.MOD_ACTIVATION', function() {
       
      it('given a network with hidden nodes, should return mutation.MOD_ACTIVATION', function() {
         const network = new architect.Perceptron(2,3,2);
         mutation.MOD_ACTIVATION.mutateOutput = false;
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.MOD_ACTIVATION, _.find(possible, (p) => { return p.name === "MOD_ACTIVATION" }))
      });
      
      it('given a network with no hidden nodes & mutateOutput set to TRUE, should return mutation.MOD_ACTIVATION', function() {
         const network = new Network(2,2);
         mutation.MOD_ACTIVATION.mutateOutput = true;
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.MOD_ACTIVATION, _.find(possible, (p) => { return p.name === "MOD_ACTIVATION" }))
       })
       
       it('given a network with no hidden nodes & mutateOutput set to FALSE, should NOT return mutation.MOD_ACTIVATION', function() {
         const network = new Network(2,2);
         mutation.MOD_ACTIVATION.mutateOutput = false;
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "MOD_ACTIVATION" }))
       })
     });
     
     describe('mutation.ADD_SELF_CONN', function() {
       it('given a network with no self-connections, should return mutation.ADD_SELF_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_SELF_CONN, _.find(possible, (p) => { return p.name === "ADD_SELF_CONN" }))
      });
      
       it('given a network with one self-connected neuron, should return mutation.ADD_SELF_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         network.mutate(mutation.ADD_SELF_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_SELF_CONN, _.find(possible, (p) => { return p.name === "ADD_SELF_CONN" }))
       });

       it('given a network with all non-input nodes self-connected, should NOT return mutation.ADD_SELF_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         let i = 5;
         while(i--)
          network.mutate(mutation.ADD_SELF_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_SELF_CONN" }))
       });
     });
     
     describe('mutation.SUB_SELF_CONN', function() {
       it('given a network with one self-connected neuron, should return mutation.SUB_SELF_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         network.mutate(mutation.ADD_SELF_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SUB_SELF_CONN, _.find(possible, (p) => { return p.name === "SUB_SELF_CONN" }))
       });
       
       it('given a network with no self-connections, should NOT return mutation.SUB_SELF_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "SUB_SELF_CONN" }))
       });
     });
     
     describe('mutation.ADD_GATE', function() {
       it('given a network with no connections gated, should return mutation.ADD_GATE', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_GATE, _.find(possible, (p) => { return p.name === "ADD_GATE" }))
       });
       
       it('given a network with all connections gated, should NOT return mutation.ADD_GATE', function() {
         const network = new architect.Perceptron(2,3,2);
         
         let i = 12; // 12 initial connections
         while(i--)
          network.mutate(mutation.ADD_GATE)
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_GATE" }))
       });
     });
     
     describe('mutation.SUB_GATE', function() {
       
       it('given a network with one connection gated, should return mutation.SUB_GATE', function() {
         const network = new architect.Perceptron(2,3,2);
         
         network.mutate(mutation.ADD_GATE)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SUB_GATE, _.find(possible, (p) => { return p.name === "SUB_GATE" }))
       });
       
       it('given a network with all connections gated, should return mutation.SUB_GATE', function() {
         const network = new architect.Perceptron(2,3,2);
         
         let i = 12; // 12 initial connections
         while(i--)
          network.mutate(mutation.ADD_GATE)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SUB_GATE, _.find(possible, (p) => { return p.name === "SUB_GATE" }))
       });
       
       it('given a network with all connection gated, should NOT return mutation.SUB_GATE', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "SUB_GATE" }))
       });
     });

     describe('mutation.ADD_BACK_CONN', function() {
       it('given a network with no back-connections, should return mutation.ADD_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_BACK_CONN, _.find(possible, (p) => { return p.name === "ADD_BACK_CONN" }))
       });
       
       it('given a network with one back-connection, should return mutation.ADD_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         network.mutate(mutation.ADD_BACK_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.ADD_BACK_CONN, _.find(possible, (p) => { return p.name === "ADD_BACK_CONN" }))
       });
       
       it('given a network with the maximum number of back-connections, should NOT return mutation.ADD_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         
         const hiddenCount = network.nodes.length - network.input - network.output;
         // https://stackoverflow.com/questions/5058406/what-is-the-maximum-number-of-edges-in-a-directed-graph-with-n-nodes
         // NOTE: ADD_CONN is exclusive of self-connections because of ADD_SELF_CONN
         const maxTotalConns = ((hiddenCount * (hiddenCount - 1)) / 2) + (hiddenCount * network.output)
         
         let i = maxTotalConns;
         while(i--)
          network.mutate(mutation.ADD_BACK_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "ADD_BACK_CONN" }))
       });
     });
     
     describe('mutation.SUB_BACK_CONN', function() {
       it('given a network with the maximum number of back-connections, should return mutation.SUB_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         
         const hiddenCount = network.nodes.length - network.input - network.output;
         // https://stackoverflow.com/questions/5058406/what-is-the-maximum-number-of-edges-in-a-directed-graph-with-n-nodes
         // NOTE: ADD_CONN is exclusive of self-connections because of ADD_SELF_CONN
         const maxTotalConns = ((hiddenCount * (hiddenCount - 1)) / 2) + (hiddenCount * network.output)
         
         let i = maxTotalConns;
         while(i--)
          network.mutate(mutation.ADD_BACK_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SUB_BACK_CONN, _.find(possible, (p) => { return p.name === "SUB_BACK_CONN" }))
       });
       
       it('given a network with one back-connection, should return mutation.SUB_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         network.mutate(mutation.ADD_BACK_CONN)
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SUB_BACK_CONN, _.find(possible, (p) => { return p.name === "SUB_BACK_CONN" }))
       });
       
       it('given a network with no back-connections, should NOT return mutation.SUB_BACK_CONN', function() {
         const network = new architect.Perceptron(2,3,2);
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "SUB_BACK_CONN" }))
       });
     });
     
     describe('mutation.SWAP_NODES', function() {
       it('given mutateOutput = false and a network with 3 hidden nodes, should return mutation.SWAP_NODES', function() {
         const network = new architect.Perceptron(2,3,2);
         mutation.SWAP_NODES.mutateOutput = false;
         
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SWAP_NODES, _.find(possible, (p) => { return p.name === "SWAP_NODES" }))
       });
       
       it('given mutateOutput = true and a network with 3 hidden nodes, should return mutation.SWAP_NODES', function() {
         const network = new architect.Perceptron(2,3,2);
         mutation.SWAP_NODES.mutateOutput = true;
         
         
         const possible = network.getPossibleMutations();
         assert.equal(mutation.SWAP_NODES, _.find(possible, (p) => { return p.name === "SWAP_NODES" }))
       });
       
       it('given mutateOutput = false and a network with no hidden nodes, should NOT return mutation.SWAP_NODES', function() {
         const network = new Network(2,2);
         mutation.SWAP_NODES.mutateOutput = false;
         
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "SWAP_NODES" }))
       });
       
       it('given mutateOutput = true and a network with no hidden nodes, should NOT return mutation.SWAP_NODES', function() {
         const network = new Network(2,2);
         mutation.SWAP_NODES.mutateOutput = true;
         
         
         const possible = network.getPossibleMutations();
         assert.equal(null, _.find(possible, (p) => { return p.name === "SWAP_NODES" }))
       });
     });
     
   });
   
   describe(".clone()", function() {
     
   })
 });
 