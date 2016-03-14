'super'.subclass(['Std.Core.IO'], function(I) {
  "use strict";
  I.know({
    // Control this agent with a stream.
    //@param stream {Std.Agent} stream with command messages
    //@return {Std.Theater.Job} immobile job to control this agent
    controlWith: function(stream) {
      var agent = this;
      return agent.performScene(function readCommands() {
        return stream.read().yields(function(command) {
          // run job of received command
          agent.performScene(function() {
            var job = agent[command.selector].apply(agent, command.parameters);
            // wait for job to complete, successfully or not
            return job.completion(true).triggers(function() {
              var reply = { sequence: command.sequence }, result = job.get();
              if (I.isError(result)) {
                reply.failure = I.failWith(agent, result).createPortrait();
              } else {
                reply.result = result;
              }
              // reply to received command
              return stream.write(reply);
            });
          }).run();
          // continue reading commands
          return agent.performScene(readCommands);
        });
      });
    }
  });
  I.nest({
    //@ An agent proxy commands another agent over a stream.
    Proxy: 'BaseObject+Role'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      I.have({
        //@{Std.Theater.Agent} stream for command messages to agent on other side
        stream: null,
        //@{integer} sequence of last command sent to agent on other side
        sequence: 0,
        //@{Std.Table} mapping from sequence number of pending command to result setter closure
        setters_: null
      });
      I.know({
        //@param stream {Std.Theater.Agent} stream for command messages
        build: function(stream) {
          I.$super.build.call(this);
          this.stream = stream;
        },
        initialize: function(agent) {
          I.$super.initialize.call(this, agent);
          var setters_ = this.setters_ = I.createTable();
          // read replies and set results
          function processReplies() { //jshint validthis:true
            return this.stream.read().yields(function(reply) {
              var sequence = reply.sequence, setter = setters_[sequence];
              delete setters_[sequence];
              // set available result and unblock job
              if (reply.failure) {
                setter(I.$outer.ProxyFailure.create(agent, reply.failure));
              } else {
                setter(reply.result);
              }
              // continue reading replies
              return this.$agent.performScene(processReplies);
            });
          }
          agent.performScene(processReplies).run();
        },
        performUnknownScene: function(selector, parameters) {
          var sequence = ++this.sequence, setters_ = this.setters_;
          var command = { sequence: sequence, selector: selector, parameters: parameters };
          var result = I.When.available(function(setter) { setters_[sequence] = setter; });
          // write command and wait for asynchronous result to become available
          return this.stream.write(command).triggers(result.get());
        }
      });
    }),
    //@ A failure on the other side of a proxy.
    ProxyFailure: 'Failure'.subclass(function(I) {
      I.have({
        //@{Object} portrait of failure on other side
        proxyPortrait: null
      });
      I.know({
        //@param proxy {Std.Theater.Agent} agent proxy
        //@param portrait {Object} failure portrait
        build: function(proxy, portrait) {
          I.$super.build.call(this, proxy, 'proxy stream');
          this.proxyPortrait = portrait;
        },
        createPortrait: function() {
          var portrait = I.$super.createPortrait.call(this);
          portrait.proxy = this.proxyPortrait;
          return portrait;
        }
      });
    })
  });
})
