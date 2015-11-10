'BaseObject+Indirect+Eventful+Ring._.Link'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    sceneCount: 0,
    sceneSelector: null,
    sceneParameters: null,
    // job result after job completed
    jobResult: null,
    // showstopper event blocks this job
    jobShowstopper: null,
    // controller event quits this job upon discharge
    jobController: null
  });
  I.know({
    build: function(ring, selector, parameters) {
      I.$super.build.call(this);
      // ring links this job back to its actor
      this.buildRingLink(ring);
      this.sceneSelector = selector;
      this.sceneParameters = parameters;
    },
    // this job is an indirection to the result when available, otherwise it directs to itself
    get: function() {
      return this.hasResult() ? this.jobResult : this;
    },
    addCharge: function(event) {
      I.$super.addCharge.call(this, event);
      if (!this.run()) {
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
    testIgnition: function() {
      return this.hasResult();
    },
    completes: function(effect) {
      var completion = this.createEvent();
      return arguments.length ? completion.yields(effect) : completion;
    },
    forkScene: function() {
      return this.getActor().createJob(this.sceneSelector, this.sceneParameters);
    },
    getActor: function() {
      return this.getLinkingRing().actor;
    },
    getAgent: function() {
      return this.getActor().getAgent();
    },
    hasResult: function() {
      // a running job only fires once, and when it fires, it fires all completions
      return !!this.sceneCount && this.hasFiredAll();
    },
    // prepare this immobile job for interrupt handling on stage
    interrupting: function() {
      if (this.sceneCount) {
        this.bad();
      }
      // claim first scene for interrupt handler
      ++this.sceneCount;
      // do not post interrupting job, because actor immediately takes the stage to work on job
      return this;
    },
    isImmobile: function() {
      // an immobile job hasn't started running yet
      return !this.sceneCount;
    },
    isPostponed: function() {
      // this running job is postponed if the showstopper does not yet have an ignition
      return !!this.jobShowstopper && !this.jobShowstopper.ignition;
    },
    isRunning: function() {
      // a running job promises to produce a future result
      return !!this.sceneCount && !this.hasFiredAll();
    },
    performRole: function(role) {
      var showstopper = this.jobShowstopper;
      if (showstopper) {
        this.jobShowstopper = null;
        // proceed with installed effect of ignition
        return role.proceedScene(this, showstopper.ignition);
      } else {
        // play scene with parameters
        return role.playScene(this, this.sceneSelector, this.sceneParameters);
      }
    },
    // quit this job if it is hasn't completed yet
    quit: function() {
      if (!this.hasResult()) {
        if (this.jobShowstopper) {
          this.jobShowstopper.cancel();
        }
        this.jobShowstopper = null;
        // complete job with a termination failure
        this.setPerformance(I._.Failure.create(this, ['termination']));
      }
    },
    repost: function() {
      this.getActor().post(this);
    },
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
    running: function() {
      this.run();
      // return with running job
      return this;
    },
    // complete this job after last stage performance, or prepare it for more stage performances
    setPerformance: function(performance) {
      if (this.hasResult() || performance === this || this.jobShowstopper) {
        this.bad();
      }
      if (I._.Event.describes(performance)) {
        // create showstopper that charges event
        this.jobShowstopper = I.Showstopper.create(this, performance);
        // wait for event to fire or proceed work immediately with ignition
        this.repost();
      } else if (!I.$.describes(performance)) {
        // if performance is neither an event nor another job, complete this job with plain result
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
        this.setPerformance(performance.completes(performance));
      } 
    }
  });
  I.nest({
    Ring: 'Ring'.subclass(function(I) {
      // I describe rings that hold jobs of actors.
      I.have({
        actor: null
      });
      I.know({
        build: function(actor) {
          I.$super.build.call(this);
          this.actor = actor;
        }
      });
    }),
    Showstopper: 'Event'.subclass(function(I) {
      // I describe root events that stop jobs until their child events fire.
      I.am({
        Final: true
      });
      I.have({
        // the job whose scene proceeds when this event fires
        job: null,
        // decorated child event
        event: null,
        // ignition is event that fired
        ignition: null
      });
      I.know({
        build: function(job, event) {
          I.$super.build.call(this);
          // root event is its own parent
          this.parentEvent = this;
          this.job = job;
          this.event = event;
          // charge child event and capture any ignition when it fires immediately
          this.ignition = event.charge(this);
        },
        // disable charging and discharging for showstoppers 
        charge: I.shouldNotOccur,
        discharge: I.shouldNotOccur,
        // continue working on job when showstopper fires 
        fire: function(ignition, fromChild) {
          if (this.ignition || this.event !== fromChild) {
            this.bad();
          }
          this.ignition = ignition;
          // repost job and work on effect of ignition
          this.job.repost();
        },
        // an ignored ignition completes job of this showstopper, but the result is nothing
        proceed: I.doNothing,
        // discharge child event if this showstopper was still waiting for the event to fire
        cancel: function() {
          if (!this.ignition && this.event) {
            var event = this.event;
            this.parentEvent = this.job = this.event = null;
            event.discharge();
          }
        }
      });
    })
  });
})