//@ A switchboard connects multiple streams between parent and child environment.
'BaseObject'.subclass(['Std.Core.IO'], I => {
  "use strict";
  const Dictionary = I._.Dictionary;
  const Synthesizer = I._.IO._.Synthesizer, Rendezvous = I._.IO._.Rendezvous;
  I.have({
    //@{Std.Theater.Agent} rendezvous stream for output
    pipeOutput: null,
    //@{Std.Dictionary} dictionary with rendezvous streams for input
    pipeInputs: null
  });
  I.know({
    //@param manager {Std.Theater.Agent} stream manager
    build: function(manager) {
      I.$super.build.call(this);
      this.pipeOutput = Rendezvous.spawn(manager);
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.pipeInputs = Dictionary.create();
    },
    //@ Get input pipe.
    //@param id {integer} stream id
    //@return {Std.Theater.Agent?} stream agent or nothing
    getInputPipe: function(id) {
      return this.pipeInputs.lookup(id);
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
      this.assert(!inputs.containsIndex(id));
      const output = this.pipeOutput, manager = output.getManager();
      // add new input pipe to synchronize item availability in stream
      const input = Rendezvous.spawn(manager);
      inputs.store(input, id);
      // synthesize new stream that reads from input pipe and writes to output pipe
      return Synthesizer.spawn(manager, () => input.read(), it => output.write([id, it]));
    }
  });
})