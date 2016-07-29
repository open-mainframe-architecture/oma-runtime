'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Status.$._.Link} link of job status
    jobLink: null,
    //@{string|function} selector or closure of scene method
    sceneSelector: null,
    //@{[*]} method parameters
    sceneParameters: null,
    //@{string} original purpose of this job does not change
    jobPurpose: null,
    //@{integer} number of scenes this job spans (negated when job completes)
    sceneCount: 0,
    //@{Std.Theater.Job.$._.Strategy} strategy for charged completion events
    jobStrategy: null,
    //@{*} job result after job completed
    jobResult: null,
    //@{Std.Theater.Showstopper?} showstopper event blocks this job
    jobShowstopper: null
  });
  I.access({
    //@{*|Std.Theater.Job} get job result or the job itself if result is not available
    value: function() {
      return this.sceneCount < 0 ? this.jobResult : this;
    }
  });
  const Showstopper = I._.Showstopper;
  I.know({
    [I._.Status._.Symbol]: function() {
      return this.jobLink;
    },
    //@param status {Std.Theater.Job.$._.Status} assigned job status of actor
    //@param selector {string|function} scene selector or method
    //@param parameters [*] scene parameters
    //@param purpose {string?} job purpose if not default
    build: function(status, selector, parameters, purpose) {
      I.$super.build.call(this);
      this.jobLink = status.createLink(this);
      this.sceneSelector = selector;
      this.sceneParameters = parameters;
      this.jobPurpose = purpose ? purpose :
        I.isString(selector) ? selector : selector.name || '<anonymous>';
    },
    //@ Create completion event that fires when this job is done.
    //@param faulty {boolean?} true for all completions, including erroneous, otherwise false
    //@return {Std.Event} completion event
    done: function(faulty) {
      // a job has its own strategy for completion events
      const strategy = this.jobStrategy || (this.jobStrategy = I.Strategy.create(this));
      return faulty ? strategy.createEvent() : I.Tryout.create(strategy);
    },
    //@ Create job that performs same scene as this job. Completed jobs cannot be forked.
    //@return {Std.Theater.Job?} new inert job or nothing
    forkScene: function() {
      return this.getActor().createJob(this.sceneSelector, this.sceneParameters, this.jobPurpose);
    },
    //@ Get actor of this job that has not completed yet.
    //@return {Std.Theater.Actor} theater actor
    getActor: function() {
      return this.jobLink.status.actor;
    },
    //@ Get descriptive purpose of this job.
    //@return {string} purpose description
    getPurpose: function() {
      return this.jobPurpose;
    },
    //@ Prepare this inert job for interrupt handling on stage.
    //@return {Std.Theater.Job} this job
    interrupting: function() {
      this.failUnless('interrupt without inertia', !this.sceneCount);
      // claim first scene for interrupt handler
      ++this.sceneCount;
      // do not post interrupting job, because actor immediately takes the stage to work on job
      return this;
    },
    //@ Test whether this job is done.
    //@return {boolean} true if this job is done running, otherwise false
    isDone: function() {
      return this.sceneCount < 0;
    },
    //@ Test whether this job is inert.
    //@return {boolean} true if this job is not running yet, otherwise false
    isInert: function() {
      return this.sceneCount === 0;
    },
    //@ Is this running job postponed until the showstopper fires?
    //@return {boolean} true if job is postponed, otherwise false
    isPostponed: function() {
      // this running job is postponed if the showstopper does not yet have an ignition
      return !!this.jobShowstopper && !this.jobShowstopper.hasIgnition();
    },
    //@ Test whether this job is running.
    //@return {boolean} true if this job is still running, otherwise false
    isRunning: function() {
      return this.sceneCount > 0;
    },
    //@ Perform scene on stage.
    //@param role {Std.Role} actor role
    //@return {*} scene result
    performOnStage: function(role) {
      I.failUnless('unexpected inertia or completion', this.sceneCount > 0);
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
    //@ Successful job result propels future progress. Errors are thrown on stage.
    //@param progress {*|function} plain or computed progress of successful result
    //@return {Std.Theater.Showstopper} showstopper event to block a scene
    propels: function(progress) {
      const future = this;
      return !I.isClosure(progress) ? this.done().triggers(progress) :
        this.done().triggers(function() { return progress.call(this, future.jobResult); });
    },
    //@ Quit this job if it is running.
    //@return nothing
    quit: function() {
      if (this.sceneCount > 0) {
        const showstopper = this.jobShowstopper;
        this.jobShowstopper = null;
        // complete job with a termination error
        this.setPerformance(I.throw('termination'));
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
    //@param performance {Std.Theater.Showstopper|Std.Theater.Job|*} showstopper, job or result
    //@return nothing
    setPerformance: function(performance) {
      I.failUnless('unexpected inertia or completion', this.sceneCount > 0);
      I.failUnless('cyclic performance', performance !== this);
      I.failUnless('postponed performance', !this.jobShowstopper);
      if (Showstopper.describes(performance)) {
        // a showstopper blocks this job
        performance.blockScene(this);
        this.jobShowstopper = performance;
        // postpone job, or continue work on job when showstopper fired immediately
        this.repost();
      } else if (!I.$.describes(performance)) {
        // if performance is neither a showstopper nor another job, complete this job with result
        const actor = this.getActor();
        this.jobResult = performance;
        this.sceneCount = -this.sceneCount;
        this.jobLink.status.delete(this);
        if (this.jobStrategy) {
          this.jobStrategy.fireAll();
        }
        this.sceneSelector = this.sceneParameters = null;
        // make sure actor reschedules when this job was not busy, e.g. it was unexpectedly quit
        actor.reschedule();
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
    //@ A job status links jobs to an actor.
    Status: 'Status'.subclass(I => {
      I.have({
        //@{Std.Theater.Actor} actor that owns this status
        actor: null
      });
      I.know({
        //@param name {string} status name
        //@param actor {Std.Theater.Actor} theater actor
        build: function(name, actor) {
          I.$super.build.call(this, name);
          this.actor = actor;
        }
      });
    }),
    //@ A strategy for job completion events.
    Strategy: 'Std.Event.$._.CollectStrategy'.subclass(I => {
      I.have({
        //@{Std.Theater.Job} job is origin of completion events
        job: null,
        //@{Std.Event} controller is completion event that sets job in motion
        controller: null
      });
      I.know({
        //@param job {Std.Theater.Job} theater job
        build: function(job) {
          I.$super.build.call(this);
          this.job = job;
        },
        addCharge: function(event) {
          I.$super.addCharge.call(this, event);
          const job = this.job;
          if (job.run()) {
            // controller sets job in motion
            this.controller = event;
          }
        },
        deleteCharge: function(event, discharged) {
          I.$super.deleteCharge.call(this, event, discharged);
          if (this.controller === event) {
            this.controller = null;
            if (discharged) {
              // quit job when controller has been discharged
              this.job.quit();
            }
          }
        },
        testIgnition: function(event, blooper) {
          const job = this.job;
          if (job.sceneCount < 0) {
            if (blooper && event.isFallible() && I.isError(job.jobResult)) {
              // when job has already produced error, cause a blooper mistake
              blooper.mistake(job.jobResult);
            } else {
              // fire immediately
              return true;
            }
          }
          return false;
        }
      });
    }),
    //@ A try-out is a fallible event that fires when a job completes successfully.
    Tryout: 'Event'.subclass(I => {
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
          // avoid discharge when it resulted after blooper fired to complete job
          if (this.eventStrategy.job.sceneCount > 0) {
            I.$super.discharge.call(this);
          }
        },
        fire: function() {
          const result = this.eventStrategy.job.jobResult;
          if (I.isError(result)) {
            // asynchronous error is a blooper mistake
            this.blooper.mistake(result);
          } else {
            // fire upwards on success
            I.$super.fire.call(this);
          }
        },
        isFallible: I.returnTrue
      });
    })
  });
})