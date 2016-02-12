//@ A theater schedules actors on stage.
'BaseObject+Eventful'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    //@{Std.Ring} ring with actors that have nothing to do, not even in their agendas
    idleActors: null,
    //@{Std.Ring} ring with actors that are ready to work on assigned jobs
    workingActors: null,
    //@{Std.Ring} ring with active actor on theater stage
    activeActor: null,
    //@{Std.Ring} ring with unemployed actors, waiting for events in their agendas to fire
    waitingActors: null,
    //@{Std.Ring} ring with actors in trouble whose managers decide what to do next
    troubledActors: null,
    //@{Std.Theater.Service._.Clock} clock keeps track of real-time
    theaterClock: null,
    //@{boolean} curtain is either open or closed
    curtainOpen: false,
    //@{number} curtain remains open for 8ms in a time slice unless there's nothing to do
    curtainSlice: 0.008,
    //@{integer} count number of times curtain has been opened to schedule actors in a time slice 
    sliceCount: 0,
    //@{integer} count number of actor performances in time slices
    slicePerformances: 0,
    //@{number} total time that curtain has been open for a time slice
    sliceTime: 0,
    //@{integer} count number of interrupts on stage
    interruptCount: 0,
    //@{number} total time that curtain has been open to handle interrupts
    interruptTime: 0
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      this.idleActors = I._.Ring.create();
      this.workingActors = I._.Ring.create();
      this.activeActor = I._.Ring.create();
      this.waitingActors = I._.Ring.create();
      this.troubledActors = I._.Ring.create();
      // register clock of this theater
      this.theaterClock = this.$rt.register(I.Clock.create(this.wakeUp.bind(this)));
    },
    //@ Handle external interrupt on theater stage.
    //@param job {Std.Theater.Job} immobile job becomes interrupt handler
    //@return nothing
    interrupt: function (job) {
      if (this.curtainOpen || !job.isImmobile()) {
        this.bad();
      }
      var actor = job.getActor();
      if (actor.isInTrouble()) {
        // run job but do not open curtain to handle interrupt on stage with suspended actor
        job.run();
      } else {
        // open curtain for interrupt handling on stage
        this.curtainOpen = true;
        ++this.interruptCount;
        var beginning = this.theaterClock.get();
        // actor plays first scene of interrupting job, without waking up from clock
        this.activeActor.add(actor);
        actor.takeStage(job.interrupting());
        this.activeActor.clear();
        // schedule next wake-up call after interrupt has been handled
        this.interruptTime += this.theaterClock.sleep(this.workingActors.isEmpty()) - beginning;
        this.curtainOpen = false;
      }
    },
    //@ Add actor to the appropriate ring in this theater, or remove it from this ring.
    //@param actor {Std.Theater.Actor} theater actor whose status may have changed
    //@return nothing
    reschedActor: function (actor) {
      if (actor.isDead()) {
        // remove reference to dead actor, if any
        actor.unlinkFromRing();
      } else if (actor.isInTrouble()) {
        // manage problem of troubled actor
        this.troubledActors.add(actor);
      } else if (actor.hasWork()) {
        // actor is ready to work on jobs
        this.workingActors.add(actor);
        // should theater wake up and open curtain as soon as possible?
        if (!this.curtainOpen) {
          this.theaterClock.awakeSoon();
        }
      } else if (actor.hasAgenda()) {
        // actor waits for some event in agenda to fire
        this.waitingActors.add(actor);
      } else {
        // actor without work is idle
        this.idleActors.add(actor);
      }
    },
    //@ Create event that fires when this theater ends next or current time slice.
    //@return {Std.FullEvent} event fires when curtains close
    stageBreak: function () {
      return this.createEvent();
    },
    //@ Wake up to open curtain and to let actors work on theater stage until time's up.
    //@return nothing
    //@except when curtain is already open
    wakeUp: function () {
      if (this.curtainOpen) {
        this.bad();
      }
      this.curtainOpen = true;
      ++this.sliceCount;
      var clock = this.theaterClock;
      var beginning = clock.awake();
      // if necessary, leave curtain open until deadline of time slice passes
      var deadline = beginning + this.curtainSlice;
      var working = this.workingActors;
      var active = this.activeActor;
      // while there are actors ready for work and the deadline of time slice hasn't passed yet
      for (var now = beginning; !working.isEmpty() && now <= deadline; now = clock.awake()) {
        ++this.slicePerformances;
        // first working actor becomes active actor on stage
        var actor = working.firstIndex();
        active.add(actor);
        // do some actor work on stage, e.g. play scene for job
        actor.takeStage();
        // actor must leave the stage if it didn't already
        active.clear();
      }
      // fire events when this theater takes a break
      this.fireAll();
      // start deep sleep when out of work, otherwise wake up for next slice as soon as possible
      this.sliceTime += clock.sleep(working.isEmpty()) - beginning;
      this.curtainOpen = false;
    },
    //@ Walk over all actors that live in this theater.
    //@return {Std.Iterator} iterator over actors
    walkActors: function () {
      var active = this.activeActor.walk();
      var working = this.workingActors.walk();
      var waiting = this.waitingActors.walk();
      var idle = this.idleActors.walk();
      return I.Loop.concat(active, working, waiting, idle);
    }
  });
  I.nest({
    //@ A theater clock wakes up on time for delay events.
    Clock: 'Wait.Clock'.subclass(function (I) {
      I.am({
        Abstract: false
      });
      I.have({
        //@{Rt.Closure} wake-up call
        wakeUp: null,
        //@{any} false (awake), null (waking up), true (deep sleep) or JavaScript alarm to wake up
        sleeping: true,
        //@{number} deadline for next JavaScript alarm
        deadline: null
      });
      I.know({
        //@param wakeUp {Rt.Closure} code to wake up
        build: function (wakeUp) {
          I.$super.build.call(this);
          this.wakeUp = wakeUp;
        },
        sortCharge: function (delays, delay) {
          var deadline = delay.deadline;
          var i = 0, j = delays.length;
          // binary search in sorted array of delays
          while (i < j) {
            var probe = Math.floor((i + j) / 2);
            if (delays[probe].deadline <= deadline) {
              i = probe + 1;
            } else {
              j = probe;
            }
          }
          // is it an insertion? otherwise append delay at end
          if (i < delays.length) {
            // convert to one-based list index where delay should be inserted
            return i + 1;
          }
        },
        testIgnition: function (delay) {
          if (delay.seconds <= 0) {
            // fire immediately
            return true;
          }
          // deadline is needed for sorting charged delay events
          delay.deadline = this.get() + delay.seconds;
          return false;
        },
        delay: function (seconds) {
          return I.$outer.Delay.create(this, seconds);
        },
        //@ Adjust clock whilst awake.
        //@return {number} current clock time
        awake: function () {
          this.resetAlarm(false);
          var uptime = this.get();
          // fire delay events whose deadline passed
          for (var delay; (delay = this.getFirstCharge()) && delay.deadline <= uptime;) {
            delay.fire();
          }
          return uptime;
        },
        //@ Schedule next wake-up call as soon as possible.
        //@return nothing
        awakeSoon: function () {
          if (this.sleeping !== null) {
            clearTimeout(this.sleeping);
            this.sleeping = this.deadline = null;
            // continue after control has returned to global event loop
            this.$rt.asap(this.wakeUp);
          }
          // otherwise wake-up call is already scheduled
        },
        //@ Clear pending alarm and continue with new sleeping status.
        //@param sleeping {any} null, boolean or JavaScript alarm
        resetAlarm: function (sleeping) {
          if (this.sleeping) {
            clearTimeout(this.sleeping);
            this.deadline = null;
          }
          this.sleeping = sleeping;
        },
        //@ Schedule wake-up call for deep sleep, otherwise wake up as soon as possible.
        //@param deep {boolean} true for deep sleep, otherwise wake up asap
        //@return {number} current clock time
        sleep: function (deep) {
          var delay = deep && this.getFirstCharge();
          var uptime = this.get();
          var seconds = delay ? delay.deadline - uptime : Infinity;
          if (!deep || seconds <= 0) {
            this.awakeSoon();
          } else if (!delay) {
            // deep sleep without alarm
            this.resetAlarm(true);
          } else if (delay.deadline !== this.deadline) {
            // wake up from deep sleep on time for new deadline
            this.deadline = delay.deadline;
            this.resetAlarm(setTimeout(this.wakeUp, seconds * 1000));
          }
          // else keep alarm of first deadline intact
          return uptime;
        }
      });
    }),
    //@ A delay event stems from a theater clock.
    Delay: 'FullEvent'.subclass(function (I) {
      I.have({
        //@{number} seconds to wait
        seconds: null,
        //@{number} uptime when this delay event fires
        deadline: null
      });
      I.know({
        //@param clock {Std.Theater.Service._.Clock} theater clock
        //@param seconds {number} seconds to wait
        build: function (clock, seconds) {
          I.$super.build.call(this, clock);
          this.seconds = seconds;
        }
      });
    })
  });
  I.setup(function () {
    // register theater instance and lock it for actors
    I._.Actor.lockInstanceConstants({ $theater: I.$.$rt.register(I.$.create()) });
  });
})