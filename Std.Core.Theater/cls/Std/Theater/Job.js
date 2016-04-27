//@ A job performs one or more scenes.
'BaseObject+Indirect+Production+Eventful+RingLink'.subclass(I => {
  "use strict";
  const Failure = I._.Failure, Showstopper = I._.Showstopper;
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{integer} number of scenes this job spans (negated when job completes)
    sceneCount: 0,
    //@{string|Std.Closure} selector or closure of scene method
    sceneSelector: null,
    //@{[any]} method parameters
    sceneParameters: null,
    //@{string} descriptive purpose of this job does not change
    jobPurpose: null,
    //@{any} job result after job completed
    jobResult: null,
    //@{Std.Theater.Showstopper?} showstopper event blocks this job
    jobShowstopper: null,
    //@{Std.FullEvent?} controller event quits this job upon discharging
    jobController: null
  });
  I.know({
    //@param ring {Std.Theater.Job._.Ring} ring that contains job
    //@param selector {string} scene selector
    //@param parameters {[any]} scene parameters
    //@param purpose {string?} descriptive job purpose
    build: function(ring, selector, parameters, purpose) {
      I.$super.build.call(this);
      // ring links this job back to its actor
      this.buildRingLink(ring);
      this.sceneSelector = selector;
      this.sceneParameters = parameters;
      this.jobPurpose = purpose ? purpose :
        typeof selector === 'string' ? selector :
          selector.name || '<anonymous>';
    },
    get: function() {
      // this job is an indirection to the result when available, otherwise it directs to itself
      return this.sceneCount < 0 ? this.jobResult : this;
    },
    addCharge: function(event) {
      I.$super.addCharge.call(this, event);
      if (this.run()) {
        // controller event sets this job in motion
        this.jobController = event;
      }
    },
    removeCharge: function(event, discharged) {
      I.$super.removeCharge.call(this, event, discharged);
      if (this.jobController === event) {
        this.jobController = null;
        if (discharged) {
          // quit this job after controller event has been discharged
          this.quit();
        }
      }
    },
    testIgnition: function(event, blooper) {
      if (this.sceneCount < 0) {
        if (blooper && I.isErroneous(this.jobResult)) {
          // fail immediately with blooper when job produced error result
          blooper.failWith(this.jobResult);
        } else {
          // fire immediately
          return true;
        }
      }
      return false;
    },
    propels: function(progress) {
      const future = this;
      return !I.isClosure(progress) ? this.done().triggers(progress) :
        this.done().triggers(function() { return progress.call(this, future.jobResult); });
    },
    //@ Create completion event that fires when this job is done.
    //@param faulty {boolean?} true for all completions, including failures, otherwise false
    //@return {Std.FullEvent} completion event
    done: function(faulty) {
      return faulty ? this.createEvent() : I.Tryout.create(this);
    },
    //@ Create job that performs same scene as this job. Completed jobs cannot be forked.
    //@return {Std.Theater.Job} new inert job
    forkScene: function() {
      return this.getActor().createJob(this.sceneSelector, this.sceneParameters, this.jobPurpose);
    },
    //@ Get actor that is working on this job. Completed jobs do not have an actor.
    //@return {Std.Theater.Actor} theater actor
    getActor: function() {
      return this.getLinkingRing().actor;
    },
    //@ Get agent that represent the actor of this job. Completed jobs do not have an agent.
    //@return {Std.Theater.Agent} theater agent
    getAgent: function() {
      return this.getActor().getAgent();
    },
    //@ Get purpose of this job.
    //@return {string} descriptive job purpose
    getPurpose: function() {
      return this.jobPurpose;
    },
   //@ Prepare this inert job for interrupt handling on stage.
   //@return {Std.Theater.Job} this job
    interrupting: function() {
      this.assert(!this.sceneCount);
      // claim first scene for interrupt handler
      ++this.sceneCount;
      // do not post interrupting job, because actor immediately takes the stage to work on job
      return this;
    },
    //@ Is this job done?
    //@return {boolean} true if job completed with a result (failure or success), otherwise false
    isDone: function() {
      return this.sceneCount < 0;
    },
    //@ Is this an inert job that hasn't started running yet?
    //@return {boolean} true if job is inert, otherwise false
    isInert: function() {
      return !this.sceneCount;
    },
    //@ Is this job postponed until the showstopper fires?
    //@return {boolean} true if job is postponed, otherwise false
    isPostponed: function() {
      // this running job is postponed if the showstopper does not yet have an ignition
      return !!this.jobShowstopper && !this.jobShowstopper.hasIgnition();
    },
    //@ Is this job running? Inert and completed jobs are not running.
    //@return {boolean} true if job is running, otherwise false
    isRunning: function() {
      // a running job promises to produce a future result
      return this.sceneCount > 0;
    },
    //@ Perform scene on stage.
    //@param role {Std.Role} actor role
    //@return {any} scene result
    performOnStage: function(role) {
      this.assert(this.sceneCount > 0);
      const showstopper = this.jobShowstopper;
      if (showstopper) {
        this.jobShowstopper = null;
        // produce effect caused by ignition of showstopper
        return role.playScene(this, () => showstopper.produceEffect(role));
      } else {
        // play scene with parameters
        return role.playScene(this, this.sceneSelector, this.sceneParameters);
      }
    },
    //@ Quit this job if it is running.
    //@return nothing
    quit: function() {
      if (this.sceneCount > 0) {
        const showstopper = this.jobShowstopper;
        this.jobShowstopper = null;
        // complete job with a termination failure
        this.setPerformance(Failure.create(this, 'termination'));
        if (showstopper) {
          showstopper.cancel();
        }
      }
    },
    //@ Post this job to the actor that should work on it. Completed jobs cannot be reposted.
    //@return nothing
    repost: function() {
      this.getActor().post(this);
    },
    //@ Start running this inert job.
    //@return {boolean} false if this job is not inert, otherwise true
    run: function() {
      if (!this.sceneCount) {
        // schedule first scene on stage to start working on this job
        ++this.sceneCount;
        this.repost();
        // this job started running
        return true;
      }
      // this job is already running or done
      return false;
    },
    //@ Make sure this job is running if it was inert.
    //@return this job
    running: function() {
      this.run();
      // return with running or completed job, but never inert
      return this;
    },
    //@ Complete this job after last stage performance, or prepare it for more stage performances.
    //@param performance {Std.Theater.Showstopper|Std.Theater.Job|any} showstopper, job or result
    //@return nothing
    setPerformance: function(performance) {
      this.assert(this.sceneCount > 0, performance !== this, !this.showstopper);
      if (Showstopper.describes(performance)) {
        // showstopper event blocks this job
        performance.blockScene(this);
        this.jobShowstopper = performance;
        // postpone job until event fires, or work on assigned job if event fired immediately
        this.repost();
      } else if (!I.$.describes(performance)) {
        // if performance is neither a showstopper nor another job, complete this job with result
        const actor = this.getActor();
        this.jobResult = performance;
        this.sceneCount = -this.sceneCount;
        this.sceneSelector = this.sceneParameters = null;
        this.unlinkFromRing();
        this.fireAll();
        // make sure actor reschedules when this job was not busy, e.g. it was unexpectedly quit
        actor.resched();
      } else if (performance.sceneCount < 0) {
        // complete this job with same result as other completed job
        this.setPerformance(performance.jobResult);
      } else if (!performance.sceneCount) {
        // forward this job to same actor scene as other inert job
        ++this.sceneCount;
        this.sceneSelector = performance.sceneSelector;
        this.sceneParameters = performance.sceneParameters;
        performance.getActor().post(this);
      } else {
        // complete this job with the same result, when other running job completes
        this.setPerformance(performance.done(true).triggers(performance));
      }
    }
  });
  I.nest({
    //@ A dedicated ring for jobs of actors.
    Ring: 'Ring'.subclass(I => {
      I.have({
        //@{Std.Theater.Actor} actor of jobs in this ring
        actor: null
      });
      I.know({
        //@param actor {Std.Theater.Actor} theater actor owns this ring
        build: function(actor) {
          I.$super.build.call(this);
          this.actor = actor;
        }
      });
    }),
    //@ A try-out is a fallible event that fires when a job completes successfully.
    Tryout: 'FullEvent'.subclass(I => {
      I.have({
        //@{Std.Theater.Blooper} blooper fails with unsuccessful job result
        blooper: null
      });
      I.know({
        charge: function(parent, blooper) {
          // blooper is required when job fails asynchronously
          this.blooper = blooper;
          return I.$super.charge.call(this, parent, blooper);
        },
        discharge: function() {
          // avoid discharge when it resulted from blooper failure
          if (this.origin().sceneCount > 0) {
            I.$super.discharge.call(this);
          }
        },
        fire: function() {
          const result = this.origin().jobResult;
          if (I.isErroneous(result)) {
            // fail asynchronously with blooper
            this.blooper.failWith(result);
          } else {
            // fire upwards on success
            I.$super.fire.call(this);
          }
        },
        //@return true
        isFallible: I.returnTrue
      });
    })
  });
})