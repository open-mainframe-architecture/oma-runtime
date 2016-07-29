//@ An actor is a job processor on the theater stage.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Std.Role.$} role class with scene methods of this actor
    roleClass: null,
    //@{Std.Role} role of this actor or null if this actor is dead and buried
    actorRole: null,
    //@{Std.Theater.Agent} agent represents this actor with a more convenient calling-interface
    actorAgent: null,
    //@{Std.Theater.Actor} supervisor decides over life and death of this actor
    actorSupervisor: null,
    //@{Set[Std.Theater.Actor]?} set with team member that are supervised by this actor
    actorTeam: null,
    //@{Std.Theater.Job.$._.Status} status for jobs that are assigned to this actor
    assignedJobs: null,
    //@{Std.Theater.Job.$._.Status} status for busy job of this active actor on stage
    busyJob: null,
    //@{Std.Theater.Job.$._.Status} status for jobs that are postponed until agenda events fire
    postponedJobs: null,
    //@{Std.Status.$._.Link} status link of this actor
    actorLink: null,
    //@{Std.Event.$._.CommonStrategy} strategy for events that fire after this actor dies
    mournStrategy: null,
    //@{boolean} if this actor is in trouble, work is suspended until the problem has been managed
    inTrouble: false
  });
  I.access({
    //@{Std.Theater.Agent} get agent that represents this actor
    $agent: function() {
      return this.actorAgent;
    },
    //@{Std.Theater.Actor} get actor that supervises this actor
    $supervisor: function() {
      return this.actorSupervisor;
    },
    //@return {iterable} iterable actors in team, which might be empty
    $team: function() {
      return this.actorTeam.values();
    }
  });
  const Job = I._.Job;
  // hoist immutable, empty team set for actors that are not supervisors
  const EmptyTeam = Object.freeze(new Set());
  I.know({
    [I._.Status._.Symbol]: function() {
      return this.actorLink;
    },
    //@{Std.Theater.Service} theater where actors play on stage
    $theater: null,
    //@param roleClass {Std.Role.$} role class with scene methods
    //@param role {Std.Role} actor role
    //@param manager {Std.Theater.Agent} actor manager
    build: function(roleClass, role, manager) {
      I.$super.build.call(this);
      this.roleClass = roleClass;
      this.actorRole = role;
      this.actorAgent = roleClass.createAgent(this);
      if (manager) {
        const supervisor = manager.$actor;
        this.actorSupervisor = supervisor;
        supervisor.actorTeam.add(this);
      } else {
        // root actor supervises itself
        this.actorSupervisor = this;
      }
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.actorTeam = this.actorRole.isManaging() ? new Set() : EmptyTeam;
      this.assignedJobs = Job._.Status.create('assigned', this);
      this.busyJob = Job._.Status.create('busy', this);
      this.postponedJobs = Job._.Status.create('postponed', this);
      this.actorLink = this.$theater.createLink(this);
      this.mournStrategy = I.When.CommonStrategy.create(false, () => !this.actorRole);
    },
    //@ Bury this troubled actor and quit all its jobs.
    //@return nothing
    //@except when this actor is not in trouble
    bury: function() {
      I.failUnless('expected trouble before burial', this.inTrouble);
      if (this.actorRole) {
        const assigned = this.assignedJobs, postponed = this.postponedJobs;
        // this actor is now officially dead
        this.actorRole = null;
        // remove team member
        this.actorSupervisor.actorTeam.delete(this);
        // quit assigned and postponed jobs
        [...assigned].forEach(job => job.quit());
        [...postponed].forEach(job => job.quit());
        assigned.clear();
        postponed.clear();
        // announce death of this actor
        this.mournStrategy.fireAll();
        this.reschedule();
      }
    },
    //@ Create job for this actor.
    //@param selector {string|function} scene name or code
    //@param parameters {[*]} scene parameters
    //@param purpose {string?} descriptive job purpose
    //@return {Std.Theater.Job} new inert job
    createJob: function(selector, parameters, purpose) {
      // link new job to status with assigned jobs, but do not post new job
      return Job.create(this.assignedJobs, selector, parameters, purpose);
    },
    //@ Create event that fires when this actor dies.
    //@return {Std.Event} event fires upon and after death
    death: function() {
      return this.mournStrategy.createEvent();
    },
    //@ Get class of actor role. This is still available after actor death.
    //@return {Std.Role.$} role class
    getRoleClass: function() {
      return this.roleClass;
    },
    //@ Does the agenda of this actor postpone future jobs?
    //@return {boolean} true if actor has postponed jobs in agenda, otherwise false
    hasAgenda: function() {
      return this.postponedJobs.size > 0;
    },
    //@ Is this actor supervising a team with a least one member?
    //@return {boolean} true if this supervisor has a nonempty team, otherwise false
    hasTeamMembers: function() {
      return this.actorTeam.size > 0;
    },
    //@ Is this actor ready to work on an assigned job?
    //@return {boolean} true if actor can work on assigned job, otherwise false
    hasWork: function() {
      return this.assignedJobs.size > 0;
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
    //@ Manage job for dead actor.
    //@param job {Std.Theater.Job} forked job that was posted to dead actor
    //@return {Std.Theater.Job} job to manage post-mortem job
    managePostMortem: I.shouldNotOccur,
    //@ Manage exception when actor is performing on stage.
    //@param job {Std.Theater.Job} forked job that caused exception
    //@param exception {error|*} stage exception
    //@return {Std.Theater.Job} job to manage exception
    manageStageException: I.shouldNotOccur,
    //@ Post a job for this actor to work on.
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
      this.reschedule();
    },
    //@ If necessary, reschedule this actor to match its current status.
    //@return nothing
    reschedule: function() {
      this.$theater.rescheduleActor(this);
    },
    //@ Resume this actor after it was in trouble.
    //@param role {Std.Role?} optional new role of this actor
    //@return nothing
    //@exception when this actor is dead or not in trouble
    resume: function(role) {
      // this actor must be in trouble and still be alive
      I.failUnless('expected trouble to resume', this.inTrouble);
      I.failUnless('resume dead actor', this.actorRole);
      if (role && role !== this.actorRole) {
        this.actorRole = role;
      }
      // prepare for future performances after problem has been solved
      this.inTrouble = false;
      this.reschedule();
    },
    //@ Take stage to work on a job.
    //@param nextJob {Std.Theater.Job?} job to work on or nothing to work on first assigned job
    //@return nothing
    takeStage: function(nextJob) {
      // work on the given job or on the first assigned job
      const job = nextJob || this.assignedJobs.values().next().value;
      this.busyJob.add(job);
      try {
        // perform on stage and register result of performance
        job.setPerformance(job.performOnStage(this.actorRole));
      } catch (exception) {
        // actor is in trouble and suspended from working, when it throws an exception on stage
        this.inTrouble = true;
        // delegate error handling to actor manager
        job.setPerformance(this.manageStageException(job.forkScene(), exception));
      }
      // prepare this actor for future performances
      this.busyJob.clear();
      this.reschedule();
    }
  });
})