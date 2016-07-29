//@ A runtime environment adds nonstandard features. It may be embedded in a parent.
'RemoteRole'.subclass(['Std.Core.Theater.Remote', 'Std.Core.IO'], {
  // environment-specific constants
  constants$: 'Std.Runtime.Constants',
  // use HTTP client to get source of script to load
  http$: 'Std.HTTP.Client',
  // standard typespace
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.am({
    Abstract: true
  });
  I.have({
    //@{Std.Runtime.Environment.Switchboard?} switchboard connects streams to parent environment
    parentSwitchboard: null
  });
  I.know({
    initializeWork: function(agent) {
      I.$super.initializeWork.call(this, agent);
      const parentEmitter = I.constants$.parentEmitter;
      // is this an embedded child environment that can send to and receive messages from parent?
      if (parentEmitter) {
        // create switchboard for streams between parent and child environment
        this.parentSwitchboard = I._.Switchboard.create(agent);
        // listen to emitter right away to avoid dropped messages from parent web environment
        agent.runRemote(this.spawnCrossover(agent, parentEmitter));
      }
    },
    isManaging: I.returnTrue,
    //TODO
    repairDamage: I.shouldNotOccur,
    //@ Create environment-specific emitter for child environment.
    //@return {object} environment-specific emitter
    createSubsidiaryEmitter: I.burdenSubclass,
    //@ Clean up emitter of child environment.
    //@param emitter {object} environment-specific emitter
    //@return nothing
    destroySubsidiaryEmitter: I.burdenSubclass,
    //@ Spawn stream between parent and child environment.
    //@param manager {Std.Theater.Agent} stream manager
    //@param emitter {object} environment-specific emitter
    //@return {Std.Theater.Agent} crossover stream
    spawnCrossover: I.burdenSubclass
  });
  I.play({
    //@ Load several scripts. Load order is not defined.
    //@param locations {[string|Std.HTTP.URI]} locations of scripts to load
    //@promise nothing
    loadScripts: function(locations) {
      // create job to load one script at given URI
      const script = uri => this.$agent.createScene(() => I.http$.get(uri).propels(response => {
        // mimic semantics of browser script tag
        this.$rt.asap(() => { I.compileClosure(response.getBody())(); });
      }));
      // wait for all scripts to load although compilation/execution may still be pending
      return I.When.every(locations.map(uri => script(uri).done())).triggers();
    },
    //@ Control agent provider over stream in switchboard.
    //@param id {integer} stream id in switchboard
    //@param service {string} service name to provide
    //@promise nothing
    provideRemote: function(id, service) {
      const provider = this.$rt.provide(service);
      provider.runRemote(this.parentSwitchboard.spawnStream(id));
    },
    //@ Register proxy provider with stream in switchboard.
    //@param id {integer} stream id in switchboard
    //@param service {string} name of proxied service
    //@promise nothing
    registerRemote: function(id, service) {
      const roleClass = this.$rt.resolveService(service);
      const provider = roleClass.spawnRemote(this.$agent, this.parentSwitchboard.spawnStream(id));
      this.$rt.register(roleClass, provider);
    },
    //@ Read item from stream on switchboard.
    //@promise {[*]} array with stream id on switchboard and read item
    remoteRead: function() {
      return this.parentSwitchboard.getOutputPipe().read();
    },
    //@ Write item to stream on switchboard.
    //@param id {integer} stream id on switchboard
    //@param it {*} item to write
    //@promise nothing
    remoteWrite: function(id, it) {
      return this.parentSwitchboard.getInputPipe(id).write(it);
    },
    //@ Create and start child environment of this runtime environment.
    //@param manager {Std.Theater.Agent} manager of subsidiary
    //@param purpose {string} descriptive purpose of subsidiary
    //@promise {Std.Theater.Agent} agent of new subsidiary
    startSubsidiary: function(manager, purpose) {
      // start child environment with environment-specific emitter
      const emitter = this.createSubsidiaryEmitter();
      const stream = this.spawnCrossover(this.$agent, emitter);
      const subsidiary = I._.Subsidiary.spawn(manager, purpose);
      // monitor subsidiary and destroy emitter when it dies
      this.$agent.runScene(() => subsidiary.$actor.death().triggers(() => {
        this.destroySubsidiaryEmitter(emitter);
        return stream.kill();
      }));
      return subsidiary.assignChild(stream).propels(subsidiary);
    }
  });
  I.nest({
    //@ Streams for serialized messages between parent and child runtime environments.
    Crossover: 'Stream'.subclass(I => {
      I.am({
        Abstract: true
      });
      I.have({
        //@{object} environment-specific emitter of message events
        emitter: null,
        //@{[object]} received messages that have not yet been read
        unread: null,
        //@{Std.Wait.Semaphore} semaphore to synchronize fetching of unread messages
        protect: null
      });
      const Semaphore = I._.Wait._.Semaphore;
      I.know({
        //@param emitter {object} environment-specific emitter of message events
        build: function(emitter) {
          I.$super.build.call(this);
          this.emitter = emitter;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.unread = [];
          this.protect = Semaphore.create(0);
          this.install(this.emitter, function() {
            // add received message to array with unread messages
            this.unread.push(this.receive.apply(this, arguments));
            // announce availability of unread message
            this.protect.increment();
          }.bind(this));
        },
        //@ Install closure to receive messages from emitter.
        //@param emitter {object} environment-specific emitter
        //@param receiver {function} called with environment-specific arguments
        //@return nothing
        install: I.burdenSubclass,
        //@ Handle environment-specific way to extract received message.
        //@param ... {*} environment-specific arguments
        //@return {object} received message
        receive: I.burdenSubclass,
        //@ Send message with emitter.
        //@param emitter {object} environment-specific emitter
        //@param it {object} message to send
        //@return nothing
        send: I.burdenSubclass
      });
      I.play({
        read: function() {
          // wait for announcement of unread message, then fetch it
          return this.protect.decrement().triggers(() => this.unread.shift());
        },
        write: function(it) {
          // rely on environment-specific emitter to send message to other environment
          this.send(this.emitter, it);
        }
      });
    })
  });
})