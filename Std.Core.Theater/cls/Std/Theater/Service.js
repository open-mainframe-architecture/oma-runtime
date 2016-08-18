//@ A theater schedules actors on stage.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Status} status for actors that have nothing to do, not even in their agendas
    idleActors: null,
    //@{Std.Status} status for actors that are ready to work on assigned jobs
    workingActors: null,
    //@{Std.Status} status for active actor on theater stage
    activeActor: null,
    //@{Std.Status} status for unemployed actors, waiting for events in their agendas to fire
    waitingActors: null,
    //@{Std.Status} status for actors in trouble whose managers decide what to do next
    troubledActors: null,
    //@{Std.Status} status for suspended actors that cannot work on stage until they are resumed
    suspendedActors: null,
    //@{Std.Theater.Service.$._.Clock} clock keeps track of timed events
    alarmClock: null,
    //@{*} false (not using alarm), null (waking up asap) or JavaScript alarm for next deadline
    alarmState: false,
    //@{function} the alarm bell is executed when a clock event fires while theater is sleeping
    alarmBell: null,
    //@{number} next deadline of JavaScript alarm
    alarmDeadline: null,
    //@{promise} microtask is a promise to avoid starvation of pending promise resolutions
    microtask: null,
    //@{Std.Event.$._.CollectAgeStrategy} strategy for stage break events
    breakStrategy: null,
    //@{boolean} if curtain is open, actors can play on stage, otherwise theater is closed
    curtainOpen: false,
    //@{number} curtain remains open for 8ms in a time slice unless there's nothing to do
    curtainSlice: 0.008,
    //@{integer} count number of times curtain has been opened to schedule actors in a time slice 
    sliceCount: 0,
    //@{integer} count number of actor performances in time slices
    slicePerformances: 0,
    //@{number} total time that curtain has been open for a time slice
    sliceTime: 0,
    //@{integer} count number of interrupt performances
    interruptCount: 0,
    //@{number} total time that curtain has been open for interrupts
    interruptTime: 0
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.idleActors = I._.Status.create('idle');
      this.workingActors = I._.Status.create('working');
      this.activeActor = I._.Status.create('active');
      this.waitingActors = I._.Status.create('waiting');
      this.troubledActors = I._.Status.create('troubled');
      this.suspendedActors = I._.Status.create('suspended');
      this.alarmClock = I.Clock.create();
      this.alarmBell = this.wakeUp.bind(this);
      this.microtask = Promise.resolve();
      this.breakStrategy = I.When.CollectAgeStrategy.create();
    },
    //@ Schedule next wake-up call.
    //@return {number} current uptime
    awakeLater: function() {
      const deep = this.workingActors.size === 0, now = this.$rt.uptime();
      if (deep) {
        const firstMoment = this.alarmClock.strategy.moments[0];
        const firstDeadline = firstMoment && firstMoment.deadline;
        if (firstDeadline) {
          // compute seconds left until first deadline should fire
          const seconds = firstDeadline - now;
          if (seconds <= 0) {
            // wake up to fire first deadline that already passed
            this.awakeSoon();
          } else if (firstDeadline !== this.alarmDeadline) {
            // wake up from deep sleep on time for new deadline
            this.resetAlarm(setTimeout(this.alarmBell, seconds * 1000));
            this.alarmDeadline = firstDeadline;
          }
          // else keep alarm of first deadline intact
        } else {
          // deep sleep without alarm if there is no deadline
          this.resetAlarm();
        }
      } else {
        // wake up from light sleep and continue to work with actors
        this.awakeSoon();
      }
      return now;
    },
    //@ Schedule next wake-up call as soon as possible.
    //@return nothing
    awakeSoon: function() {
      if (this.alarmState !== null) {
        this.resetAlarm();
        this.alarmState = null;
        // pending promise resolutions/rejections could starve on some platforms without microtask
        this.microtask.then(() => this.$rt.asap(this.alarmBell));
      }
      // otherwise wake-up call is already scheduled
    },
    //@ Create member status link for a new actor.
    //@param actor {Std.Theater.Actor} new actor
    //@return {Std.Status.$._.Link} member status link
    createLink: function(actor) {
      return this.idleActors.createLink(actor);
    },
    //@ Fire clock events whose deadline passed.
    //@return {number} current uptime
    fireNow: function() {
      const moments = this.alarmClock.strategy.moments, now = this.$rt.uptime();
      for (let firstMoment; (firstMoment = moments[0]) && firstMoment.deadline <= now;) {
        // fire first moment, removing it from the sorted array
        firstMoment.fire();
      }
      return now;
    },
    //@ Get clock that ticks for this theater.
    //@return {Std.Wait.Clock} a clock for delays and pauses
    getClock: function() {
      return this.alarmClock;
    },
    //@ Interrupt stage break for one scene.
    //@param job {Std.Theater.Job} interrupting job
    //@return nothing
    interrupt: function(job) {
      I.failUnless('interrupt with curtain open', !this.curtainOpen);
      I.failUnless('expected inertia before interrupt', job.isInert());
      const actor = job.getActor();
      if (actor.isTroubled()) {
        // run job but do not open curtain to handle interrupt on stage with suspended actor
        job.run();
      } else {
        // open curtain for one scene to handle interrupt on stage
        this.curtainOpen = true;
        ++this.interruptCount;
        const beginning = this.$rt.uptime();
        // actor plays first scene of interrupting job, without waking up from clock
        this.activeActor.add(actor);
        actor.takeStage(job.interrupting());
        this.activeActor.clear();
        // schedule next wake-up call after interrupt has been handled
        this.interruptTime += this.awakeLater() - beginning;
        this.curtainOpen = false;
      }
    },
    //@ Put actor in appropriate status.
    //@param actor {Std.Theater.Actor} theater actor whose status may have changed
    //@return nothing
    rescheduleActor: function(actor) {
      if (actor.isDead()) {
        // remove reference to dead actor, if any
        const link = actor[I._.Status._.Symbol]();
        if (link.next) {
          link.status.delete(actor);
        }
      } else if (actor.isTroubled()) {
        // manage problem of troubled actor
        this.troubledActors.add(actor);
      } else if (actor.isSuspended()) {
        // suspended until further notice
        this.suspendedActors.add(actor);
      } else if (actor.hasWork()) {
        // actor is ready to work on jobs
        this.workingActors.add(actor);
        // should theater wake up and open curtain as soon as possible?
        if (!this.curtainOpen) {
          this.awakeSoon();
        }
      } else if (actor.hasAgenda()) {
        // actor waits for some event in agenda to fire
        this.waitingActors.add(actor);
      } else {
        // actor without work and agenda is idle
        this.idleActors.add(actor);
      }
    },
    //@ Clear pending alarm and optionally set a new one.
    //@param alarm {*} JavaScript alarm
    //@return nothing
    resetAlarm: function(alarm) {
      if (this.alarmState) {
        clearTimeout(this.alarmState);
        this.alarmDeadline = null;
      }
      this.alarmState = alarm || false;
    },
    //@ Create event that fires when this theater ends next or current time slice.
    //@return {Std.Event} event fires when curtains close
    stageBreak: function() {
      return this.breakStrategy.createEvent();
    },
    //@ Wake up to open curtain and to let actors work on theater stage until time's up.
    //@return nothing
    //@except when curtain is already open
    wakeUp: function() {
      I.failUnless('wake up with curtain open', !this.curtainOpen);
      this.curtainOpen = true;
      this.resetAlarm();
      ++this.sliceCount;
      const beginning = this.fireNow(), sliceDeadline = beginning + this.curtainSlice;
      const working = this.workingActors, active = this.activeActor;
      // while there are actors ready for work and the deadline of time slice hasn't passed yet
      for (let now = beginning; working.size > 0 && now <= sliceDeadline; now = this.fireNow()) {
        ++this.slicePerformances;
        // first working actor becomes active actor on stage
        const actor = working.values().next().value;
        active.add(actor);
        // actor performs some work on stage
        actor.takeStage();
        // actor must leave the stage if it didn't already
        active.clear();
      }
      // fire events when this theater takes a break
      this.breakStrategy.fireAll();
      // sleep when out of work, otherwise wake up for next slice as soon as possible
      this.sliceTime += this.awakeLater() - beginning;
      this.curtainOpen = false;
    }
  });
  I.nest({
    //@ A moment is a clock event.
    Moment: 'Event'.subclass(I => {
      I.have({
        //@{number} this moment fires after waiting for a number of seconds
        seconds: null,
        //@{number} this moment fires when deadline passes
        deadline: null
      });
      I.know({
        //@param strategy {Std.Theater.Service.$._.ClockStrategy} clock strategy
        //@param seconds {number?} seconds to wait or nothing
        //@param deadline {number?} deadline when this moment fires or nothing
        build: function(strategy, seconds, deadline) {
          I.$super.build.call(this, strategy);
          this.seconds = seconds;
          this.deadline = deadline;
        }
      });
    }),
    //@ A theater clock creates moments in time.
    Clock: 'Wait.Clock'.subclass(I => {
      I.have({
        //@{Std.Theater.Service.$._.ClockStrategy} strategy sorts moments on when they should fire
        strategy: null
      });
      I.know({
        unveil: function() {
          I.$super.unveil.call(this);
          this.strategy = I._.Service._.ClockStrategy.create();
        },
        //@ Create event that fires after a delay in seconds.
        //@param delay {number} number of seconds to delay after charging
        //@return {Std.Event} clock event
        delay: function(seconds) {
          // set deadline when clock event is charged
          return I._.Service._.Moment.create(this.strategy, seconds);
        },
        //@ Create event that fires when this clock reaches some moment.
        //@param until {number} clock time when this event should fire
        //@return {Std.Event} clock event
        wait: function(until) {
          // create clock event whose deadline is already set
          return I._.Service._.Moment.create(this.strategy, Infinity, until || -1);
        }
      });
    }),
    //@ A clock strategy sorts events on time.
    ClockStrategy: 'Event.$._.Strategy'.subclass(I => {
      I.have({
        //@{[Std.Theater.Service.$._.Moment]} sorted array with clock events
        moments: null
      });
      I.know({
        unveil: function() {
          I.$super.unveil.call(this);
          this.moments = [];
        },
        addCharge: function(moment) {
          const deadline = moment.deadline, moments = this.moments;
          let i = 0, j = moments.length;
          // binary search in sorted array
          while (i < j) {
            const probe = Math.floor((i + j) / 2);
            if (moments[probe].deadline <= deadline) {
              i = probe + 1;
            } else {
              j = probe;
            }
          }
          // insert moment at sorted position
          moments.splice(i, 0, moment);
        },
        deleteCharge: function(moment) {
          // use linear search to find moment object in array
          const moments = this.moments, index = moments.indexOf(moment);
          I.failUnless('discharge moment without charge', index >= 0);
          moments.splice(index, 1);
        },
        testIgnition: function(moment) {
          if (moment.seconds <= 0) {
            // fire immediately when delay is zero or negative
            return true;
          }
          const deadline = moment.deadline, now = this.$rt.uptime();
          if (!deadline) {
            // set deadline based on delay and current time
            moment.deadline = now + moment.seconds;
          } else if (deadline <= now) {
            // fire immediately when deadline has already been reached
            return true;
          }
          // sort charged event based on deadline
          return false;
        }
      });
    })
  });
  I.setup(function() {
    I._.Actor.lockInstanceConstants({ $theater: I.$.create() });
  });
})