//@ A subsidiary controls an embedded child environment.
'RemoteRole'.subclass(['Std.Core.Theater.Remote', 'Std.Core.IO'], {
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.have({
    //@{string} descripive purpose of child environment
    childPurpose: null,
    //@{Std.Runtime.Environment.Switchboard} switchboard connects streams to child environment
    childSwitchboard: null,
    //@{Std.Theater.Agent} agent proxy of child environment
    childEnvironment: null,
    //@{Std.Table} agent proxies to service providers in child environment
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
      this.remoteProviders = I.createTable();
    },
    initializeWork: function(agent) {
      I.$super.initializeWork.call(this, agent);
      this.childSwitchboard = I._.Switchboard.create(agent);
    },
    isManaging: I.returnTrue,
    //TODO
    repairDamage: I.shouldNotOccur
  });
  I.play({
    //@ Assign child environment of this subsidiary.
    //@param stream {Std.Theater.Agent} stream to child environment
    //@promise nothing
    //@except when child has already been assigned
    assignChild: function(stream) {
      const agent = this.$agent, switchboard = this.childSwitchboard;
      I.failUnless('duplicate subsidiary', !this.childEnvironment);
      const child = this.childEnvironment = I._.Service.spawnRemote(agent, stream);
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
    feedbackIncident: I.remotely('Incident =>', function(incident) {
      const locationTail = incident.location ? incident.location._ : [];
      // warn about incident from this subsidiary
      this.warn(incident.$update({
        location: I.typespace$.unmarshal([this.childPurpose, ...locationTail], '[string]')
      }));
    }),
    //@ Obtain proxy to service provider in child environment.
    //@param service {string|Std.Role.$} service to provide by child environment
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@promise {Std.Theater.Agent} agent proxy
    provideRemote: function(service, alternativeTypespace) {
      const roleClass = this.$rt.resolveService(service), serviceName = roleClass.getName();
      const existingProxy = this.remoteProviders[serviceName];
      if (existingProxy) {
        // reuse existing proxy, assuming that a typespace, if any, cannot make a difference
        return existingProxy;
      }
      const id = ++this.switchId, stream = this.childSwitchboard.spawnStream(id);
      const newProxy = roleClass.spawnRemote(this.$agent, stream, alternativeTypespace);
      this.remoteProviders[serviceName] = newProxy;
      return this.childEnvironment.provideRemote(id, serviceName).propels(newProxy);
    },
    //@ Register provider proxy in child environment to implementation in this environment.
    //@param localProvider {Std.Theater.Agent} implementation of service to register
    //@param service {string|Std.Role.$?} optional service role class to register
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@promise nothing
    registerRemote: function(localProvider, service, alternativeTypespace) {
      const id = ++this.switchId, localActor = localProvider.$actor;
      const roleClass = service ? this.$rt.resolveService(service) : localActor.getRoleClass();
      localProvider.runRemote(this.childSwitchboard.spawnStream(id), alternativeTypespace);
      return this.childEnvironment.registerRemote(id, roleClass.getName());
    }
  });
})