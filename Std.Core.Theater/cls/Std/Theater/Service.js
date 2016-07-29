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
    //@{Std.Wait.Clock} clock keeps track of timed events
    alarmClock: null,
    //@{*} false (awake), null (waking up), true (deep sleep) or JavaScript alarm to wake up
    alarmSleeping: true,
    //@{function} the alarm bell is executed when a clock event fires while theater is sleeping
    alarmBell: null,
    //@{number} deadline for next JavaScript alarm
    alarmDeadline: null,
    //@{Std.Event.$._.Strategy} strategy for stage break events
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
      this.alarmClock = I._.Wait._.Clock.create();
      this.alarmBell = this.wakeUp.bind(this);
      this.breakStrategy = I.When.CollectStrategy.create();
    },
    //@ Sleep until next wake-up call.
    //@return {number} current uptime
    awakeLater: function() {
      const deep = this.workingActors.size === 0, now = this.$rt.uptime();
      if (deep) {
        const deadline = this.alarmClock.firstDeadline();
        if (deadline) {
          // compute seconds left until first deadline should fire
          const seconds = deadline - now;
          if (seconds <= 0) {
            // wake up to fire first deadline that already passed
            this.awakeSoon();
          } else if (deadline !== this.alarmDeadline) {
            // wake up from deep sleep on time for new deadline
            this.resetAlarm(setTimeout(this.alarmBell, seconds * 1000));
            this.alarmDeadline = deadline;
          }
          // else keep alarm of first deadline intact
        } else {
          // deep sleep without alarm if there is no deadline
          this.resetAlarm(true);
        }
      } else {
        // wake up from light sleep and continue to work with actors
        this.awakeSoon();
      }
      return now;
    },
    //@ Advance clock whilst awake.
    //@return {number} current uptime
    awakeNow: function() {
      this.resetAlarm(false);
      // fire events whose deadline passed
      return this.alarmClock.fireNow();
    },
    //@ Schedule next wake-up call as soon as possible.
    //@return nothing
    awakeSoon: function() {
      if (this.alarmSleeping !== null) {
        clearTimeout(this.alarmSleeping);
        this.alarmSleeping = this.alarmDeadline = null;
        // continue after control has returned to global event loop
        this.$rt.asap(this.alarmBell);
      }
      // otherwise wake-up call is already scheduled
    },
    //@ Create member status link for a new actor.
    //@param actor {Std.Theater.Actor} new actor
    //@return {Std.Status.$._.Link} member status link
    createLink: function(actor) {
      return this.idleActors.createLink(actor);
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
      if (actor.isInTrouble()) {
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
        this.interruptTime += this.sleepWithAlarm() - beginning;
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
      } else if (actor.isInTrouble()) {
        // manage problem of troubled actor
        this.troubledActors.add(actor);
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
    //@ Clear pending alarm/deadline and continue with new sleeping state.
    //@param sleeping {*} null, boolean or JavaScript alarm
    //@return nothing
    resetAlarm: function(sleeping) {
      if (this.alarmSleeping) {
        clearTimeout(this.alarmSleeping);
        this.alarmDeadline = null;
      }
      this.alarmSleeping = sleeping;
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
      ++this.sliceCount;
      // if necessary, leave curtain open until deadline of time slice passes
      const beginning = this.awakeNow(), deadline = beginning + this.curtainSlice;
      const working = this.workingActors, active = this.activeActor;
      // while there are actors ready for work and the deadline of time slice hasn't passed yet
      for (let now = beginning; working.size > 0 && now <= deadline; now = this.awakeNow()) {
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
      // start deep sleep when out of work, otherwise wake up for next slice as soon as possible
      this.sliceTime += this.awakeLater() - beginning;
      this.curtainOpen = false;
    }
  });
  I.setup(function() {
    I._.Actor.lockInstanceConstants({ $theater: I.$.create() });
  });
})