//@ A runtime environment adds nonstandard, portable features. It may be embedded in a parent.
'BaseObject+Manager'.subclass(['Std.Core.Theater.Remote', 'Std.Core.IO'], {
  // environment-specific constants
  constants$: 'Std.Runtime.Constants',
  // standard typespace
  data$: 'Std.Data',
  // use HTTP client to get source of script to load
  http$: 'Std.HTTP.Client'
}, I => {
  "use strict";
  const Subsidiary = I._.Subsidiary, Switchboard = I._.Switchboard, System = I._.System;
  const Semaphore = I._.Wait._.Semaphore;
  I.am({
    Service: true
  });
  I.have({
    //@{Std.Runtime.Environment.Switchboard?} switchboard connects streams to parent environment
    parentSwitchboard: null
  });
  I.know({
    initialize: function(agent) {
      I.$super.initialize.call(this, agent);
      const parentEmitter = I.constants$.parentEmitter;
      // is this an embedded child environment that can send to and receive messages from parent?
      if (parentEmitter) {
        // create switchboard for streams between parent and child environment
        this.parentSwitchboard = Switchboard.create(agent);
        // listen to emitter right away to avoid dropped messages from parent web environment
        agent.runRemote(this.$._.Crossover.spawn(agent, parentEmitter));
      }
    },
    assessDamage: I._.Management._.Damage._.returnMinimal,
    //@ Create environment-specific emitter for child environment.
    //@return {Any} environment-specific emitter
    createSubsidiaryEmitter: I.burdenSubclass,
    //@ Clean up emitter of child environment.
    //@param emitter {Any} environment-specific emitter
    //@return nothing
    destroySubsidiaryEmitter: I.burdenSubclass
  });
  I.play({
    //@ Load several scripts. Load order is not defined.
    //@param locations {[string|Std.HTTP.URL]} locations of scripts to load
    //@promise nothing
    loadScripts: function(locations) {
      // create job to load one script at given URL
      const script = url => this.$agent.createScene(() => I.http$.get(url).propels(response => {
        // mimic semantics of browser script tag
        this.$rt.asap(() => { I.compileClosure(response.getBody())(); });
      }));
      // wait for all scripts to load although compilation/execution may still be pending
      return I.When.every(locations.map(url => script(url).done())).triggers();
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
      const roleClass = System._.resolveService(service);
      const provider = roleClass.spawnRemote(this.$agent, this.parentSwitchboard.spawnStream(id));
      this.$rt.register(provider);
    },
    //@ Read item from stream on switchboard.
    //@promise [any] array with stream id on switchboard and read item
    remoteRead: function() {
      return this.parentSwitchboard.getOutputPipe().read();
    },
    //@ Write item to stream on switchboard.
    //@param id {integer} stream id on switchboard
    //@param it {any} item to write
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
      const stream = this.$_.Crossover.spawn(this.$agent, emitter);
      const subsidiary = Subsidiary.spawn(manager, purpose);
      // monitor subsidiary and destroy emitter when it dies
      this.$agent.runScene(() => subsidiary.death().triggers(() => {
        this.destroySubsidiaryEmitter(emitter);
        return stream.kill();
      }));
      return subsidiary.assignChild(stream).propels(subsidiary);
    }
  });
  I.nest({
    //@ Streams for serialized messages between parent and child runtime environments.
    Crossover: 'BaseObject+Stream'.subclass(I => {
      I.have({
        //@{Any} environment-specific emitter of message events
        emitter: null,
        //@{[any]} received messages that have not yet been read
        unread: null,
        //@{Std.Wait.Semaphore} semaphore to synchronize fetching of unread messages
        protect: null
      });
      I.know({
        //@param emitter {Any} environment-specific emitter of message events
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
        //@param emitter {Any} environment-specific emitter
        //@param receiver {Std.Closure} called with environment-specific arguments
        //@return nothing
        install: I.burdenSubclass,
        //@ Handle environment-specific way to extract received message.
        //@param ... {any} environment-specific arguments
        //@return {any} received message
        receive: I.burdenSubclass,
        //@ Send message with emitter.
        //@param emitter {Any} environment-specific emitter
        //@param it {any} message to send
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