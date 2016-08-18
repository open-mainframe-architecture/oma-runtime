//@ A busy role performs asynchronous scenes for an actor and agent.
'Object'.subclass((I, We) => {
  "use strict";
  I.have({
    //@{Std.Theater.Job?} theater job when this role is busy performing a scene on stage
    theaterJob: null
  });
  I.access({
    //@{Std.Theater.Actor} get actor representation of busy role
    $actor: function() {
      return this.theaterJob.getActor();
    },
    //@{Std.Theater.Agent} get agent representation of busy role
    $agent: function() {
      return this.$actor.$agent;
    },
    //@{Std.Theater.Service} get theater where role is busy
    $theater: function() {
      return this.$actor.$theater;
    }
  });
  I.know({
    //@ Improvise unknown scene when selector does not designate a scene method.
    //@param selector {string} scene name
    //@param parameters {[*]?} scene parameters
    //@return {*} result of unknown scene
    improviseScene: I.shouldNotOccur,
    //@ Initialize new agent/actor/role triple that works on stage.
    //@param agent {Std.Theater.Agent} new agent
    //@return nothing
    initializeWork: I.doNothing,
    //@ Play next scene on stage.
    //@param job {Std.Theater.Job} job of scene to play
    //@param selector {string|function} scene name or scene closure
    //@param parameters {[*]?} scene parameters
    //@return {*} scene result
    playScene: function(job, selector, parameters) {
      I.failUnless('bad role', !this.theaterJob);
      this.theaterJob = job;
      const closure = I.isClosure(selector) ? selector : this.$.sceneMethods[selector];
      try {
        return closure ? closure.apply(this, parameters) :
          this.improviseScene(selector, parameters);
      } finally {
        this.theaterJob = null;
      }
    }
  });
  We.have({
    //@{Std.Table} scene methods to play on stage
    sceneMethods: null,
    //@{function} constructor of new agents
    agentConstructor: null
  });
  const Theater = I._.Theater;
  We.know({
    build: function(container, key, module) {
      We.$super.build.call(this, container, key, module);
      // every role class is built with its own scene methods
      this.buildSceneMethods();
    },
    prepareScript: function(scriptInst, scriptMeta) {
      We.$super.prepareScript.call(this, scriptInst, scriptMeta);
      // add keywords to define and refine scene methods
      const parentSceneMethods = this.getParentBehavior().sceneMethods;
      if (parentSceneMethods) {
        I.lockProperty(scriptInst, '$superRole', parentSceneMethods);
      }
      scriptInst.play = scriptPlay;
      if (this.getModule() !== scriptInst.$module) {
        I.lockProperty(scriptInst, '$formerRole', I.createTable());
        scriptInst.refineRole = scriptRefine;
      }
    },
    //@ Initialize scene methods of new role class.
    //@return nothing
    buildSceneMethods: function() {
      const parent = this.getParentBehavior();
      this.sceneMethods = I.createTable(parent.sceneMethods);
      this.agentConstructor = function Agent() {
        for (let iv in this) {
          this[iv] = this[iv];
        }
        Object.seal(this);
        this.build(...arguments);
        this.unveil();
      };
      const parentPrototype = parent.agentConstructor ? parent.agentConstructor.prototype :
        Theater._.Agent.getPrototype();
      this.agentConstructor.prototype = Object.create(parentPrototype);
    },
    //@ Create agent that implements scene methods of this role class.
    //@param ... {*} construction arguments
    //@return {Std.Theater.Agent} new agent
    createAgent: function() {
      return Reflect.construct(this.agentConstructor, arguments);
    },
    //@ Create scene method from scene specification.
    //@param key {string} scene name
    //@param closure {function} specified scene closure (this is the default)
    //@return {closure} scene closure
    createSceneKnowledge: function(key, closure) {
      this.sceneMethods[key] = closure;
      return closure;
    },
    //@ Create new agent/actor/role triple with a manager.
    //@param manager {Std.Theater.Agent?} manager agent
    //@param ... {*} construction arguments for new role
    //@return {Std.Theater.Agent} agent of new triple
    spawn: function(manager) {
      return this.spawnAgent(manager, this.create(...I.sliceArray(arguments, 1)));
    },
    //@ Create new agent/actor pair for existing role instance.
    //@param manager {Std.Theater.Agent?} manager agent
    //@param role {Std.Theater.Role} role instance
    //@param roleClass {Std.Theater.Role.$?} alternative role class with scene methods
    //@return {Std.Theater.Agent} agent of new agent/actor/role triple
    spawnAgent: function(manager, role, roleClass) {
      const actor = Theater._.Actor.create(roleClass || role.$, role, manager);
      const agent = actor.$agent;
      // prepare role for working on agent jobs
      role.initializeWork(agent);
      // schedule first performance of actor if it's ready to go on stage
      actor.reschedule();
      return agent;
    }
  });
  function scriptPlay(sceneClosures) { //jshint validthis:true
    const agentPrototype = this.$.agentConstructor.prototype, closures = I.createTable();
    for (let key in sceneClosures) {
      I.lockProperty(agentPrototype, key, Theater._.Agent._.createScenePerformer(key));
      closures[`scene@${key}`] = this.$.createSceneKnowledge(key, sceneClosures[key]);
    }
    // define prefixed instance methods
    this.$.addInstanceKnowledge(closures);
  }
  function scriptRefine(refinedSceneClosures) { //jshint validthis:true
    const sceneMethods = this.$.sceneMethods, formerRole = this.$formerRole;
    const closures = I.createTable();
    for (let key in refinedSceneClosures) {
      formerRole[key] = sceneMethods[key];
      sceneMethods[key] = closures[`scene@${key}`] = refinedSceneClosures[key];
    }
    // refine prefixed instance methods
    this.$.refineInstanceMethods(closures, this.$former);
  }
  // setup scene methods for Std.Role class which has been built before this script executes
  I.setup(() => I.$.buildSceneMethods());
})