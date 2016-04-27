'super'.subclass(['Std.Core.IO'], {
  data$: 'Std.Data'
}, I => {
  "use strict";
  const Dictionary = I._.Dictionary, Service = I._.Service;
  I.know({
    //@ Control this agent remotely over a stream.
    //@param stream {Std.Agent} stream for message transport
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@return {Std.Theater.Job} inert job to control this agent
    controlRemote: function(stream, alternativeTypespace) {
      const agent = this, methods = this.getRoleClass().getSceneMethods();
      const typespace = alternativeTypespace || I.data$;
      return agent.createScene(function readMessages() {
        return stream.read().propels(message => {
          // run job of received message
          agent.runScene(() => {
            const selector = message.selector;
            // unmarshal input parameters of remote method invocation
            const parameters = methods.remoteDataIn(selector, typespace, message.parameters);
            // invoke agent method to create job
            const job = agent[selector](...parameters);
            // wait for job to complete, successfully or not
            return job.done(true).triggers(() => {
              const result = job.get(), reply = { sequence: message.sequence };
              if (I.isErroneous(result)) {
                // marshal error incident
                const json = { job: selector, role: this.$.getName() };
                const incident = Service._.createIncident(null, result, json);
                reply.incident = typespace.marshal(incident, 'Incident');
              } else {
                // marshal output result of remote method invocation
                reply.result = methods.remoteDataOut(selector, typespace, result, true);
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
    RemoteProxy: 'BaseObject+Role'.subclass(I => {
      I.am({
        Abstract: false
      });
      I.have({
        //@{Std.Theater.Agent} stream for message transport
        stream: null,
        //@{Std.Theater.SceneMethods} scene methods of remote agent
        methods: null,
        //@{Std.Data.Typespace} typespace marshals values and unmarshals JSON representations
        typespace: null,
        //@{integer} sequence number for next remote procedure call
        sequence: 0,
        //@{Std.Dictionary} result setters for pending remote procedure calls
        setters: null
      });
      I.know({
        //@param stream {Std.Theater.Agent} stream for message transport
        //@param sceneMethods {Std.Theater.SceneMethods} remote scene methods
        //@param typespace {Std.Data.Typespace} typespace for marshal and unmarshal
        build: function(stream, sceneMethods, typespace) {
          I.$super.build.call(this);
          this.stream = stream;
          this.methods = sceneMethods;
          this.typespace = typespace;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.setters = Dictionary.create();
        },
        improvise: function(selector, parameters) {
          const sequence = ++this.sequence, typespace = this.typespace, message = {
            sequence: sequence, selector: selector,
            // marshal input arguments of remote method invocation
            parameters: this.methods.remoteDataIn(selector, typespace, parameters, true)
          };
          const holder = I.When.deferred(setter => { this.setters.store(setter, sequence); });
          // write message and wait for asynchronous result to become available
          return this.stream.write(message)
            .propels(holder.get())
            // unmarshal successful output result of remote method invocation
            .propels(result => this.methods.remoteDataOut(selector, typespace, result));
        },
        initialize: function(agent) {
          I.$super.initialize.call(this, agent);
          const stream = this.stream, typespace = this.typespace, setters = this.setters;
          // read replies and set results
          agent.runScene(function processReplies() {
            return stream.read().propels(reply => {
              // remove setter to assign result
              const sequence = reply.sequence, setter = setters.lookup(sequence);
              setters.remove(sequence);
              // either remote incident or successful result
              if (reply.incident) {
                // unmarshal incident and create remote failure
                const incident = typespace.unmarshal(reply.incident, 'Incident');
                setter(I.$outer.RemoteFailure.create(agent, incident));
              } else {
                // success propels progress that unmarshals output result
                setter(reply.result);
              }
              // continue reading replies
              return agent.createScene(processReplies);
            });
          });
        },
      });
    }),
    //@ A failure with a remote incident.
    RemoteFailure: 'Failure'.subclass(I => {
      I.have({
        //@{Std.Data.Value.Record} incident record
        remoteIncident: null
      });
      I.know({
        //@param origin {any} failure origin
        //@param incident {Std.Data.Value.Record} incident record
        build: function(origin, incident) {
          I.$super.build.call(this, origin, 'remote');
          this.remoteIncident = incident;
        }
      });
    })
  });
})
