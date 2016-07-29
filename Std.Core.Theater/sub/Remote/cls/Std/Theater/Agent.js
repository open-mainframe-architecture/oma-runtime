'super'.subclass(['Std.Core.IO'], {
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.know({
    //@ Control this agent remotely over a stream.
    //@param stream {Std.Agent} stream for message transport
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@return {Std.Theater.Job} inert job to control this agent
    controlRemote: function(stream, alternativeTypespace) {
      const agent = this, roleClass = this.agentActor.getRoleClass();
      const typespace = alternativeTypespace || I.typespace$;
      return agent.createScene(function readMessages() {
        return stream.read().propels(message => {
          // run job of received message
          agent.runScene(() => {
            const selector = message.selector;
            // unmarshal input parameters of remote method invocation
            const parameters = roleClass.remoteDataIn(selector, typespace, message.parameters);
            // invoke agent method to create job
            const job = agent[selector](...parameters);
            // wait for job to complete, successfully or not
            return job.done(true).triggers(() => {
              const result = job.value, reply = { sequence: message.sequence };
              if (I.isError(result)) {
                // marshal error incident
                const json = { job: selector, role: this.$.getName() };
                const incident = this.$theater.createIncident(null, result, json);
                reply.incident = typespace.marshal(incident, 'Incident');
              } else {
                // marshal output result of remote method invocation
                reply.result = roleClass.remoteDataOut(selector, typespace, result, true);
              }
              // reply with result or failure message
              return stream.write(reply);
            });
          });
          // continue reading messages
          return agent.createScene(readMessages);
        });
      });
    },
    //@ Control this agent remotely over a stream.
    //@param stream {Std.Agent} stream for message transport
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@return {Std.Theater.Job} running job to control this agent
    runRemote: function(stream, alternativeTypespace) {
      return this.controlRemote(stream, alternativeTypespace).running();
    }
  });
  I.nest({
    //@ A proxy controls a remote agent.
    RemoteProxy: 'Role'.subclass(I => {
      I.have({
        //@{Std.Theater.Agent} stream for message transport
        stream: null,
        //@{Std.Role.$} role class of remote agent
        roleClass: null,
        //@{Std.Data.Typespace} typespace marshals values and unmarshals JSON representations
        typespace: null,
        //@{integer} sequence number for next remote procedure call
        sequence: 0,
        //@{Std.Table} pending remote procedure calls
        pending: null
      });
      class RemoteIncident extends Error {
        constructor(incident) {
          super('remote incident');
          this.incident = incident;
        }
      }
      I.know({
        //@param stream {Std.Theater.Agent} stream for message transport
        //@param roleClass {Std.Role.$} remote role class
        //@param typespace {Std.Data.Typespace} typespace for marshal and unmarshal
        build: function(stream, roleClass, typespace) {
          I.$super.build.call(this);
          this.stream = stream;
          this.roleClass = roleClass;
          this.typespace = typespace;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.pending = I.createTable();
        },
        improviseScene: function(selector, parameters) {
          const sequence = ++this.sequence, typespace = this.typespace, message = {
            sequence: sequence, selector: selector,
            // marshal input arguments of remote method invocation
            parameters: this.roleClass.remoteDataIn(selector, typespace, parameters, true)
          };
          const deferred = I.When.deferred(assign => { this.pending[sequence] = assign; });
          // write message and wait for asynchronous result to become available
          return this.stream.write(message)
            .propels(deferred.value)
            // unmarshal successful output result of remote method invocation
            .propels(result => this.roleClass.remoteDataOut(selector, typespace, result));
        },
        initializeWork: function(agent) {
          I.$super.initializeWork.call(this, agent);
          const stream = this.stream, typespace = this.typespace, pending = this.pending;
          // read replies and set results
          agent.runScene(function processReplies() {
            return stream.read().propels(reply => {
              const sequence = reply.sequence, assign = pending[sequence];
              delete pending[sequence];
              // either remote incident or successful result
              if (reply.incident) {
                assign(new RemoteIncident(typespace.unmarshal(reply.incident, 'Incident')));
              } else {
                // success propels progress that unmarshals output result
                assign(reply.result);
              }
              // continue reading replies
              return agent.createScene(processReplies);
            });
          });
        },
      });
    })
  });
})
