//@ A runtime environment embeds a runtime system. It may be a child of a parent environment.
'BaseObject+Manager'.subclass(['Std.Core.Theater.Util', 'Std.Core.IO'], {
  // environment-specific constants
  constants$: 'Std.Runtime.Constants',
  // standard datatypes
  data$: 'Std.Data',
  // use HTTP client to get source of script to load
  http$: 'Std.HTTP.Client'
}, function(I) {
  "use strict";
  I.am({
    Service: true
  });
  I.have({
    //@{Std.Data.Value.Record} record value of Runtime.Image type
    imageValue: null
  });
  I.know({
    initialize: function(agent) {
      I.$super.initialize.call(this, agent);
      var parentEmitter = I.constants$.parentEmitter;
      if (parentEmitter) {
        // this child environment is controlled by parent environment
        agent.controlOver(this.$_.Crossover.spawn(agent, parentEmitter)).run();
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
    //@ Install runtime image.
    //@param json {Object|string} JSON representation of image value or encoded URL
    //@promise nothing
    installImage: function(json) {
      if (this.imageValue) {
        this.bad();
      }
      if (typeof json === 'string') {
        return I.http$.get(json).yields(function(response) {
          return this.$agent.installImage(JSON.parse(response.getBody()));
        });
      }
      this.imageValue = I.data$.unmarshal(json, 'Runtime.Image');
    },
    //@ Load script.
    //@param location {string|Std.HTTP.URL} location of script
    //@promise nothing when script has been loaded (although execution may still be pending)
    //@except when HTTP access to get script fails
    loadScript: function(location) {
      return I.http$.get(location).yields(function(response) {
        // defer script compilation and execution to mimic semantics of browser script tags
        this.$rt.asap(function() {
          var closure = I.compileClosure(response.getBody());
          closure();
        });
      });
    },
    //@ Load several scripts.
    //@param locations {[string|Std.HTTP.URL]} locations of scripts to load
    //@promise nothing when all scripts have been successfully loaded
    loadScripts: function(locations) {
      var jobs = locations.map(function(location) {
        return this.$agent.loadScript(location);
      }, this);
      return I.When.every(jobs.map(I.When.complete)).triggers();
    },
    //@ Load and run a module with parameters. The image must have been installed.
    //@param moduleName {string} name of module to run
    //@param argv {[string]} run with given parameters
    //@promise nothing
    runModule: function(moduleName, argv) {
      if (!this.imageValue) {
        this.bad();
      }
      console.log(moduleName, argv, this.$rt.getUptime());
    },
    //@ Create and start child environment of this runtime environment.
    //@param manager {Std.Theater.Agent} manager of subsidiary
    //@promise {Std.Theater.Agent} agent of new subsidiary
    spawnSubsidiary: function(manager) {
      if (!this.imageValue) {
        this.bad();
      }
      // start child environment with environment-specific emitter
      var agent = this.$agent, emitter = this.createSubsidiaryEmitter();
      var stream = this.$_.Crossover.spawn(agent, emitter);
      var subsidiary = I._.Subsidiary.spawn(manager, stream, this.imageValue);
      // monitor subsidiary and destroy emitter when it dies
      agent.performScene(function() {
        return subsidiary.death().triggers(function() {
          this.destroySubsidiaryEmitter(emitter);
          return stream.kill();
        });
      }).run();
      return subsidiary;
    },
    //@ Load image and start main module.
    //@param json {Object} JSON representation of startup record
    //@promise nothing
    startupMain: function(json) {
      // verify JSON representation of startup value
      I.data$.unmarshal(json, 'Runtime.Startup');
      var agent = this.$agent;
      return agent.installImage(json.image).triggers(agent.runModule(json.main, json.argv));
    }
  });
  I.nest({
    //@ Streams for serialized messages between parent and child runtime environments.
    Crossover: 'BaseObject+Stream'.subclass(function(I) {
      I.have({
        //@{Any} environment-specific emitter of message events
        emitter: null,
        //@{Std.Wait.Semaphore} semaphore to synchronize fetching of unread messages
        protect: null,
        //@{[any]} received messages that has not yet been read
        unread: null
      });
      I.know({
        //@param emitter {Any} environment-specific emitter of message events
        build: function(emitter) {
          I.$super.build.call(this);
          this.emitter = emitter;
          this.protect = I._.Wait._.Semaphore.create(0);
          this.unread = [];
          this.install(function() {
            // add message to array with unread messages
            this.unread.push(this.receive.apply(this, arguments));
            // announce availability of unread message
            this.protect.increment();
          }.bind(this));
        },
        //@ Install closure to receive messages from emitter.
        //@param receiver {Std.Closure} called with environment-specific arguments
        //@return nothing
        install: I.burdenSubclass,
        //@ Handle environment-specific way to extract received message.
        //@param ... {any} environment-specific arguments
        //@return {any} received message
        receive: I.burdenSubclass,
        //@ Send message with emitter.
        //@param it {any} message to send
        //@return nothing
        send: I.burdenSubclass
      });
      I.play({
        read: function() {
          // wait for announcement of unread message, then fetch it
          return this.protect.decrement().triggers(function() {
            return this.unread.shift();
          });
        },
        write: function(it) {
          // rely on environment-specific emitter to send message to other environment
          this.send(it);
        }
      });
    })
  });
})