//@ An actor is a job processor on the theater stage.
'BaseObject+Eventful+RingLink'.subclass(I => {
  "use strict";
  const Job = I._.Job;
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Std.Role} role of this actor or null if this actor is dead and buried
    actorRole: null,
    //@{Std.Theater.SceneMethods} scene methods this actor can play
    sceneMethods: null,
    //@{Std.Theater.Agent} agent represents this actor with a more convenient calling-interface
    actorAgent: null,
    //@{Std.Theater.Agent} manager supervises over life and death of this actor
    actorManager: null,
    //@{integer} number of managers in management hierarchy
    managementDepth: -1,
    //@{Std.Theater.Job._.Ring} ring with jobs that are assigned to this actor
    assignedJobs: null,
    //@{Std.Theater.Job._.Ring} ring with busy job of this active actor on stage
    busyJob: null,
    //@{Std.Theater.Job._.Ring} ring with jobs that are postponed until agenda events fire
    postponedJobs: null,
    //@{boolean} if this actor is in trouble, work is suspended until the problem has been managed
    inTrouble: false
  });
  I.know({
    //@{Std.Theater.Service} theater where actors play on stage
    $theater: null,
    //@param role {Std.Role} actor role
    //@param sceneMethods {Std.Theater.SceneMethods} scene methods of actor
    //@param manager {Std.Theater.Agent} actor manager
    build: function(role, sceneMethods, manager) {
      I.$super.build.call(this);
      this.actorRole = role;
      this.sceneMethods = sceneMethods;
      this.actorAgent = sceneMethods.createAgent(this);
      this.actorManager = manager || this.actorAgent;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.managementDepth = this.actorManager.getManagementDepth() + 1;
      this.assignedJobs = Job._.Ring.create(this);
      this.busyJob = Job._.Ring.create(this);
      this.postponedJobs = Job._.Ring.create(this);
    },
    testIgnition: function() {
      // fire when this actor is already dead
      return !this.actorRole;
    },
    //@ Bury this troubled actor and quit all its jobs.
    //@return nothing
    //@except when this actor is not in trouble
    bury: function() {
      this.assert(this.inTrouble);
      if (this.actorRole) {
        const assigned = this.assignedJobs, postponed = this.postponedJobs;
        // this actor is now officially dead
        this.actorRole = null;
        // quit assigned and postponed jobs
        while (!assigned.isEmpty()) {
          assigned.firstIndex().quit();
        }
        while (!postponed.isEmpty()) {
          postponed.firstIndex().quit();
        }
        // announce death of this actor
        this.fireAll();
        this.resched();
      }
    },
    //@ Create job for this actor.
    //@param selector {string|Std.Closure} scene name or code
    //@param parameters {[any]} scene parameters
    //@param purpose {string?} descriptive job purpose
    //@return {Std.Theater.Job} new inert job
    createJob: function(selector, parameters, purpose) {
      // link new job to ring with assigned jobs, but do not post new job
      return Job.create(this.assignedJobs, selector, parameters, purpose);
    },
    //@ Create event that fires when this actor dies.
    //@return {Std.Event} event fires upon and after death
    death: function() {
      return this.createEvent();
    },
    //@ Get agent of this actor. Agents and actor are two sides of the same coin.
    //@return {Std.Theater.Agent} theater agent
    getAgent: function() {
      return this.actorAgent;
    },
    //@ Get depth in management hierarchy.
    //@return {integer} number of managers
    getManagementDepth: function() {
      return this.managementDepth;
    },
    //@ Get managing agent.
    //@return {Std.Theater.Agent} agent that manages this actor
    getManager: function() {
      return this.actorManager;
    },
    //@ Get class of the role that this actor plays.
    //@return {Std.Role.$} role class
    getRoleClass: function() {
      return this.sceneMethods.getBehavior();
    },
    //@ Does the agenda of this actor postpone future jobs?
    //@return {boolean} true if actor has postponed jobs in agenda, otherwise false
    hasAgenda: function() {
      return !this.postponedJobs.isEmpty();
    },
    //@ Is this actor ready to work on an assigned job?
    //@return {boolean} true if actor can work on assigned job, otherwise false
    hasWork: function() {
      return !this.assignedJobs.isEmpty();
    },
    //@ Is this a dead actor in permanent trouble that can never perform again?
    //@return {boolean} true if actor is dead, otherwise false
    isDead: function() {
      return !this.actorRole;
    },
    //@ Is this actor in trouble and expecting a manager to solve the problem?
    //@return {boolean} true if actor is suspended from working, otherwise false
    isInTrouble: function() {
      return this.inTrouble;
    },
    //@ Is this actor supervised by the manager, directly or indirectly?
    //@param manager {Std.Theater.Agent} managing agent
    //@return {boolean} true if actor is supervised by manager, otherwise false
    isManagedBy: function(manager) {
      let levelsUp = this.managementDepth - manager.getManagementDepth();
      if (levelsUp <= 0) {
        // this actor is not below the manager in the management hierarchy
        return false;
      }
      // go up in the management hierarchy, one level below where the manager is
      let actor = this;
      while (--levelsUp) {
        actor = actor.actorManager.getActor();
      }
      // is the manager located in next level?
      return actor.actorManager === manager;
    },
    //@ Can this actor manage actors?
    //@return {boolean} true if actor agent is a manager, otherwise false
    isManaging: I.shouldNotOccur,
    //@ Manage job for dead actor.
    //@param job {Std.Theater.Job} forked job that was posted to dead actor
    //@return {Std.Theater.Job} job to manage post-mortem job
    managePostMortem: I.shouldNotOccur,
    //@ Manage exception when actor is performing on stage.
    //@param job {Std.Theater.Job} forked job that caused exception
    //@param exception {any} stage exception
    //@return {Std.Theater.Job} job to manage exception
    manageStageException: I.shouldNotOccur,
    //@ Post a job to this actor.
    //@param job {Std.Theater.Job} job to post
    //@return nothing
    post: function(job) {
      if (!this.actorRole) {
        // post-mortem performance by manager
        job.setPerformance(this.managePostMortem(job.forkScene()));
      } else if (job.isPostponed()) {
        // add postponed job to agenda and wait for showstopper to fire
        this.postponedJobs.add(job);
      } else {
        // ready to work on assigned job if this actor is not in trouble
        this.assignedJobs.add(job);
      }
      this.resched();
    },
    //@ If necessary, reschedule this actor to match its current status.
    //@return nothing
    resched: function() {
      this.$theater.reschedActor(this);
    },
    //@ Resume this actor after it was in trouble.
    //@param role {Std.Role?} optional new role of this actor
    //@return nothing
    //@exception when this actor is dead or not in trouble
    resume: function(role) {
      // this actor must be in trouble and still be alive
      this.assert(this.inTrouble, this.actorRole);
      if (role && role !== this.actorRole) {
        this.actorRole = role;
      }
      // prepare for future performances after problem has been solved
      this.inTrouble = false;
      this.resched();
    },
    //@ Take stage to work on a job.
    //@param nextJob {Std.Theater.Job?} job to work on or nothing to work on first assigned job
    //@return nothing
    takeStage: function(nextJob) {
      // work on the given job or on the first assigned job
      const job = nextJob || this.assignedJobs.firstIndex();
      this.busyJob.add(job);
      try {
        // perform on stage and register result of performance
        job.setPerformance(job.performOnStage(this.actorRole));
      } catch (exception) {
        // actor is in trouble and suspended from working, when it throws an exception on stage
        this.inTrouble = true;
        // delegate exception handling to actor manager
        job.setPerformance(this.manageStageException(job.forkScene(), exception));
      }
      // prepare this actor for future performances
      this.busyJob.clear();
      this.resched();
    },
    // Iterate over actors of managers that manage this actor until root actor is reached.
    //@return {Std.Iterator} iterator over actors
    walkManagers: function() {
      return I.Loop.inject(this.actorManager.getActor(), actor => {
        const managingActor = actor.actorManager.getActor();
        if (actor !== managingActor) {
          return managingActor;
        }
      });
    },
    //@ Iterate over actors that are directly managed by this actor
    //@return {Std.Iterator} iterator over actors
    walkTeam: function() {
      if (this.isManaging()) {
        const agent = this.actorAgent, actors = this.$theater.walkActors();
        return I.Loop.select(actors, actor => actor !== this && actor.actorManager === agent);
      }
      return I.Loop.Empty;
    }
  });
})