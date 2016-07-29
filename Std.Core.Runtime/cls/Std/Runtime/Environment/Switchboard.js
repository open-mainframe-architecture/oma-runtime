//@ A switchboard connects multiple streams between parent and child environment.
'Object'.subclass(['Std.Core.IO'], I => {
  "use strict";
  I.have({
    //@{Std.Theater.Agent} rendezvous stream for output
    pipeOutput: null,
    //@{Std.Dictionary} dictionary with rendezvous streams for input
    pipeInputs: null
  });
  const IO = I._.IO;
  I.know({
    //@param manager {Std.Theater.Agent} stream manager
    build: function(manager) {
      I.$super.build.call(this);
      this.pipeOutput = IO._.Rendezvous.spawn(manager);
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.pipeInputs = I.createTable();
    },
    //@ Get input pipe.
    //@param id {integer} stream id
    //@return {Std.Theater.Agent?} stream agent or nothing
    getInputPipe: function(id) {
      return this.pipeInputs[id];
    },
    //@ Get shared output pipe.
    //@return {Std.Theater.Agent} stream agent
    getOutputPipe: function() {
      return this.pipeOutput;
    },
    //@ Create input/output stream.
    //@param id {integer} unique id of new stream
    //@return {Std.Theater.Agent} stream agent
    spawnStream: function(id) {
      const inputs = this.pipeInputs;
      if (inputs[id]) {
        I.fail(`duplicate input ${id}`);
      }
      const output = this.pipeOutput, manager = output.$actor.$supervisor.$agent;
      // add new input pipe to synchronize item availability in stream
      const input = IO._.Rendezvous.spawn(manager);
      inputs[id] = input;
      // synthesize new stream that reads from input pipe and writes to output pipe
      return IO._.Synthesizer.spawn(manager, () => input.read(), it => output.write([id, it]));
    }
  });
})