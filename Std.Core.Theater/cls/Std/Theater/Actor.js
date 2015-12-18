'BaseObject+Eventful+Ring._.Link'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    // the role that this actor is performing on stage, or null if this actor is dead and buried
    actorRole: null,
    // the role class cannot change, but role instances may be substituted
    roleClass: null,
    // the agent represents this actor with a more convenient calling-interface
    actorAgent: null,
    // the manager supervises over life and death of this actor
    actorManager: null,
    // number of managers in management hierarchy
    managementDepth: -1,
    // ring with jobs that are assigned to this actor
    assignedJobs: null,
    // ring with busy job of this active actor on stage
    busyJob: null,
    // ring with jobs that will be assigned to this actor when agenda events fire
    postponedJobs: null,
    // if this actor is in trouble, work is suspended until the problem has been managed
    inTrouble: false
  });
  I.know({
    $theater: null,
    build: function (role, manager) {
      I.$super.build.call(this);
      this.actorRole = role;
      this.roleClass = role.$;
      this.actorAgent = role.$.getAgentMethods().createAgent(this);
      this.actorManager = manager || this.actorAgent;
      this.managementDepth = this.actorManager.getActor().managementDepth + 1;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.assignedJobs = I._.Job._.Ring.create(this);
      this.busyJob = I._.Job._.Ring.create(this);
      this.postponedJobs = I._.Job._.Ring.create(this);
    },
    testIgnition: function () {
      // fire when this actor is already dead
      return !this.actorRole;
    },
    // bury this troubled actor and quit all its jobs
    bury: function () {
      if (!this.inTrouble) {
        this.bad();
      }
      if (this.actorRole) {
        var assigned = this.assignedJobs, postponed = this.postponedJobs;
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
    createJob: function (selector, parameters) {
      // link new job to ring with assigned jobs, but do not post new job
      return I._.Job.create(this.assignedJobs, selector, parameters);
    },
    death: function () {
      return this.createEvent();
    },
    getAgent: function () {
      return this.actorAgent;
    },
    getManagementDepth: function () {
      return this.managementDepth;
    },
    getManager: function () {
      return this.actorManager;
    },
    getRoleClass: function () {
      return this.roleClass;
    },
    // does the agenda of this actor postpone future jobs?
    hasAgenda: function () {
      return !this.postponedJobs.isEmpty();
    },
    // is this actor ready to work on the next job?
    hasWork: function () {
      return !this.assignedJobs.isEmpty();
    },
    // a dead actor is in permanent trouble, because it can never perform again
    isDead: function () {
      return !this.actorRole;
    },
    // is this actor in trouble and expecting a manager to solve the problem?
    isInTrouble: function () {
      return this.inTrouble;
    },
    // is this actor supervised by the manager, directly or indirectly?
    isManagedBy: function (manager) {
      var actor = this, levels = this.managementDepth - manager.getManagementDepth();
      if (levels <= 0) {
        // this actor is not below the manager in the management hierarchy
        return false;
      }
      // go up in the management hierarchy, one level below where the manager is
      while (--levels) {
        actor = actor.actorManager.getActor();
      }
      // is the manager located in next level?
      return actor.actorManager === manager;
    },
    // proper actor management is defined in another module
    isManaging: I.shouldNotOccur,
    managePostMortem: I.shouldNotOccur,
    manageStageException: I.shouldNotOccur,
    // non-intrusive peek into state of actor role
    peekState: function (selector, parameters) {
      if (!this.inTrouble) {
        // role is unaware of peeking actor, because peek result must be the same for everyone
        return this.actorRole.peekState(selector, parameters);
      }
      // leave undefined if this actor is in trouble
    },
    // post job to this actor
    post: function (job) {
      if (!this.actorRole) {
        // post-mortem performance by manager
        job.setPerformance(this.managePostMortem(job));
      } else if (job.isPostponed()) {
        // add postponed job to agenda and wait for showstopper to fire
        this.postponedJobs.add(job);
      } else {
        // ready to work on assigned job
        this.assignedJobs.add(job);
      }
      this.resched();
    },
    resched: function () {
      this.$theater.reschedActor(this);
    },
    resume: function (role) {
      // this actor must be in trouble and still be alive
      if (!this.inTrouble || !this.actorRole) {
        this.bad();
      }
      if (role && role !== this.actorRole) {
        // new role cannot alter role class
        if (role.$ !== this.roleClass) {
          this.bad('role', role);
        }
        this.actorRole = role;
      }
      // prepare for future performances after problem has been solved
      this.inTrouble = false;
      this.resched();
    },
    takeStage: function (nextJob) {
      // work on the given job or on the first assigned job
      var job = nextJob || this.assignedJobs.firstIndex();
      this.busyJob.add(job);
      try {
        // perform on stage and register result of performance
        job.setPerformance(job.performOnStage(this.actorRole));
      } catch (exception) {
        // actor is in trouble and suspended from working, when it throws an exception on stage
        this.inTrouble = true;
        // delegate exception handling to actor manager
        job.setPerformance(this.manageStageException(job, exception));
      }
      // prepare this actor for future performances
      this.busyJob.clear();
      this.resched();
    },
    // iterate over actors that are managed by this actor, directly or indirectly
    walkSubordinates: function () {
      if (this.isManaging()) {
        var self = this, manager = this.actorAgent;
        return I.Loop.select(this.$theater.walkActors(), function (actor) {
          return actor !== self && actor.isManagedBy(manager);
        });
      }
      return I.Loop.Empty;
    },
    // iterate over actors that are directly managed by this actor
    walkTeam: function () {
      if (this.isManaging()) {
        var self = this, manager = this.actorAgent;
        return I.Loop.select(this.$theater.walkActors(), function (actor) {
          return actor !== self && actor.actorManager === manager;
        });
      }
      return I.Loop.Empty;
    }
  });
})