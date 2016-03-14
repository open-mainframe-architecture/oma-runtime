//@ A job performs one or more actor scenes to complete asynchronously.
'BaseObject+Indirect+Eventful+RingLink'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{integer} number of scenes this job spans
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
      return this.hasResult() ? this.jobResult : this;
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
      if (this.hasResult()) {
        if (blooper && I.isError(this.jobResult)) {
          // fail immediately with blooper when job produced error result
          blooper.failWith(this.jobResult);
        } else {
          // fire immediately
          return true;
        }
      }
      return false;
    },
    //@ Create completion event that fires after this job completes.
    //@param faulty {boolean?} true for all results, including failures, otherwise false
    //@return {Std.FullEvent} completion event
    completion: function(faulty) {
      return faulty ? this.createEvent() : I.Tryout.create(this);
    },
    //@ Create job that performs same scene as this job.
    //@return {Std.Theater.Job} new job
    forkScene: function() {
      return this.getActor().createJob(this.sceneSelector, this.sceneParameters, this.jobPurpose);
    },
    //@ Get actor that is working on this job.
    //@return {Std.Theater.Actor} theater actor
    getActor: function() {
      return this.getLinkingRing().actor;
    },
    //@ Get agent that represent the actor of this job.
    //@return {Std.Theater.Agent} theater agent
    getAgent: function() {
      return this.getActor().getAgent();
    },
    //@ Get purpose of this job.
    //@return {string} descriptive job purpose
    getPurpose: function() {
      return this.jobPurpose;
    },
    //@ Has this job completed?
    //@return {boolean} true if job has result, otherwise false
    hasResult: function() {
      // a running job only fires once, and when it fires, it fires all completions
      return !!this.sceneCount && this.hasFiredAll();
    },
    //@ Is this an immobile job that hasn't started running yet?
    //@return {boolean} true if job is immobile, otherwise false
    isImmobile: function() {
      return !this.sceneCount;
    },
    //@ Is this job postponed until the showstopper fires?
    //@return {boolean} true if job is postponed, otherwise false
    isPostponed: function() {
      // this running job is postponed if the showstopper does not yet have an ignition
      return !!this.jobShowstopper && !this.jobShowstopper.hasIgnition();
    },
    //@ Is this job running? Immobile and completed jobs are not running.
    //@return {boolean} true if job is running, otherwise false
    isRunning: function() {
      // a running job promises to produce a future result
      return !!this.sceneCount && !this.hasFiredAll();
    },
    //@ Perform scene on stage.
    //@param role {Std.Role} actor role
    //@return {any} scene result
    performOnStage: function(role) {
      var showstopper = this.jobShowstopper;
      if (showstopper) {
        this.jobShowstopper = null;
        // produce effect caused by ignition of showstopper
        return role.playScene(this, function() { return showstopper.produceEffect(role); });
      } else {
        // play scene with parameters
        return role.playScene(this, this.sceneSelector, this.sceneParameters);
      }
    },
    //@ Quit this job if it is hasn't completed yet.
    //@return nothing
    quit: function() {
      if (!this.hasResult()) {
        if (this.jobShowstopper) {
          this.jobShowstopper.cancel();
        }
        this.jobShowstopper = null;
        // complete job with a termination failure
        this.setPerformance(I._.Failure.create(this, 'termination'));
      }
    },
    //@ Post this job to the actor that should work on it.
    //@return nothing
    repost: function() {
      this.getActor().post(this);
    },
    //@ Start running this immobile job.
    //@return {boolean} false if this job is not immobile, otherwise true
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
    //@ Make sure this job is running when it's immobile.
    //@return this job
    running: function() {
      this.run();
      // return with running or completed job
      return this;
    },
    //@ Complete this job after last stage performance, or prepare it for more stage performances.
    //@param performance {Std.Theater.Showstopper|Std.Theater.Job|any} showstopper, job or result
    //@return nothing
    setPerformance: function(performance) {
      if (this.hasResult() || performance === this || this.jobShowstopper) {
        this.bad();
      }
      if (I._.Showstopper.describes(performance)) {
        // showstopper event blocks this job
        performance.blockScene(this);
        this.jobShowstopper = performance;
        // postpone job until event fires, or work on assigned job if event fired immediately
        this.repost();
      } else if (!I.$.describes(performance)) {
        // if performance is neither a showstopper nor another job, complete this job with result
        this.jobResult = performance;
        this.unlinkFromRing();
        this.fireAll();
        // make sure actor reschedules when this job was not busy, e.g. it was unexpectedly quit
        this.getActor().resched();
      } else if (!performance.sceneCount) {
        // forward this job to same actor scene as other immobile job
        ++this.sceneCount;
        this.sceneSelector = performance.sceneSelector;
        this.sceneParameters = performance.sceneParameters;
        performance.getActor().post(this);
      } else if (performance.hasResult()) {
        // complete this job with same result as other completed job
        this.setPerformance(performance.jobResult);
      } else {
        // complete this job with the same result, when other running job completes
        this.setPerformance(performance.completion(true).triggers(performance));
      }
    },
    //@ Install effect for successful completion of this job.
    //@param effect {any|Std.Closure} plain or computed effect of ignition
    //@return {Std.Theater.Showstopper} shopstopper event for this job
    triggers: function(effect) {
      return this.completion().triggers(effect);
    },
    //@ Install effect for successful result of this job.
    //@param effect {any|Std.Closure} plain of computed effect of result
    //@return {Std.Theater.Showstopper} shopstopper event for this job
    yields: function(effect) {
      var job = this;
      return typeof effect === 'function' ?
        job.triggers(function() { return effect.call(this, job.jobResult); }) :
        job.triggers(effect);
    }
  });
  I.nest({
    //@ A dedicated ring for jobs of actors.
    Ring: 'Ring'.subclass(function(I) {
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
    Tryout: 'FullEvent'.subclass(function(I) {
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
          if (!this.origin().hasResult()) {
            I.$super.discharge.call(this);
          }
        },
        fire: function() {
          var result = this.origin().jobResult;
          if (I.isError(result)) {
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