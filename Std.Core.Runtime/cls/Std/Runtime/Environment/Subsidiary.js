//@ A subsidiary controls an embedded child environment.
'BaseObject+Manager'.subclass(['Std.Core.Theater.Remote', 'Std.Core.IO'], {
  data$: 'Std.Data'
}, I => {
  "use strict";
  const Dictionary = I._.Dictionary;
  const Switchboard = I._.Switchboard, Service = I._.Service, System = I._.System;
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    //@{string} descripive purpose of child environment
    childPurpose: null,
    //@{Std.Runtime.Environment.Switchboard} switchboard connects streams to child environment
    childSwitchboard: null,
    //@{Std.Theater.Agent} agent proxy of child environment
    childEnvironment: null,
    //@{Std.Dictionary} agent proxies to service providers in child environment
    remoteProviders: null,
    //@{integer} last stream id on switchboard
    switchId: 0
  });
  I.know({
    build: function(purpose) {
      I.$super.build.call(this);
      this.childPurpose = purpose;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.remoteProviders = Dictionary.create();
    },
    assessDamage: I._.Management._.Damage._.returnMinimal,
    initialize: function(agent) {
      I.$super.initialize.call(this, agent);
      this.childSwitchboard = Switchboard.create(agent);
    }
  });
  I.play({
    //@ Assign child environment of this subsidiary.
    //@param stream {Std.Theater.Agent} stream to child environment
    //@promise nothing
    //@except when child has already been assigned
    assignChild: function(stream) {
      const agent = this.$agent, switchboard = this.childSwitchboard;
      this.assert(!this.childEnvironment);
      const child = this.childEnvironment = Service.spawnRemote(agent, stream);
      agent.runScene(function remoteRead() {
        // read next pair with stream id and read item from remote switchboard
        return child.remoteRead()
          .propels(pair => switchboard.getInputPipe(pair[0]).write(pair[1]))
          .propels(agent.createScene(remoteRead));
      });
      agent.runScene(function remoteWrite() {
        // read next pair with stream id and read item from local switchboard
        return switchboard.getOutputPipe().read()
          .propels(pair => child.remoteWrite(pair[0], pair[1]))
          .propels(agent.createScene(remoteWrite));
      });
      // register this subsidiary as service provider in child environment
      return agent.registerRemote(agent, I.$);
    },
    //@ Supply feedback about a management incident in child environment.
    //@param incident {Std.Data.Value.Record} incident record value
    //@promise nothing
    feedbackIncident: I.remotely(['Incident'], function(incident) {
      const locationTail = I.Data.decomposeValues(incident.location) || [];
      // warn about incident from this subsidiary
      this.$theater.warn(incident.$update({
        location: I.data$.unmarshal([this.childPurpose, ...locationTail], '[string]')
      }));
    }),
    //@ Obtain proxy to service provider in child environment.
    //@param service {string|Std.Role.$} service to provide by child environment
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@promise {Std.Theater.Agent} agent proxy
    provideRemote: function(service, alternativeTypespace) {
      const roleClass = System._.resolveService(service), serviceName = roleClass.getName();
      const existingProxy = this.remoteProviders.lookup(serviceName);
      if (existingProxy) {
        // reuse existing proxy, assuming that a typespace, if any, cannot make a difference
        return existingProxy;
      }
      const id = ++this.switchId, stream = this.childSwitchboard.spawnStream(id);
      const newProxy = roleClass.spawnRemote(this.$agent, stream, alternativeTypespace);
      this.remoteProviders.store(newProxy, serviceName);
      return this.childEnvironment.provideRemote(id, serviceName).propels(newProxy);
    },
    //@ Register provider proxy in child environment to implementation in this environment.
    //@param localProvider {Std.Theater.Agent} implementation of service to register
    //@param service {string|Std.Role.$?} optional service role class to register
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@promise nothing
    registerRemote: function(localProvider, service, alternativeTypespace) {
      const id = ++this.switchId;
      const roleClass = service ? System._.resolveService(service) : localProvider.getRoleClass();
      localProvider.runRemote(this.childSwitchboard.spawnStream(id), alternativeTypespace);
      return this.childEnvironment.registerRemote(id, roleClass.getName());
    }
  });
})