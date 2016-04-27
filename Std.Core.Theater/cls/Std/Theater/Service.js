//@ A theater schedules actors on stage.
'BaseObject+Eventful'.subclass(I => {
  "use strict";
  const Ring = I._.Ring;
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
    //@{Std.Theater.Service._.Clock} clock keeps track of time
    theaterClock: null,
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
      this.idleActors = Ring.create();
      this.workingActors = Ring.create();
      this.activeActor = Ring.create();
      this.waitingActors = Ring.create();
      this.troubledActors = Ring.create();
      this.theaterClock = I.Clock.create(this.wakeUp.bind(this));
    },
    //@ Get clock that ticks for this theater.
    //@return {Std.Wait.Clock} a clock for delays and pauses
    getClock: function() {
      return this.theaterClock;
    },
    //@ Interrupt stage break for one scene.
    //@param job {Std.Theater.Job} interrupting job
    //@return nothing
    interrupt: function(job) {
      this.assert(!this.curtainOpen, job.isInert());
      const actor = job.getActor();
      if (actor.isInTrouble()) {
        // run job but do not open curtain to handle interrupt on stage with suspended actor
        job.run();
      } else {
        // open curtain for one scene to handle interrupt on stage
        this.curtainOpen = true;
        ++this.interruptCount;
        const beginning = this.theaterClock.get();
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
    reschedActor: function(actor) {
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
        // actor without work and agenda is idle
        this.idleActors.add(actor);
      }
    },
    //@ Create event that fires when this theater ends next or current time slice.
    //@return {Std.FullEvent} event fires when curtains close
    stageBreak: function() {
      return this.createEvent();
    },
    //@ Wake up to open curtain and to let actors work on theater stage until time's up.
    //@return nothing
    //@except when curtain is already open
    wakeUp: function() {
      this.assert(!this.curtainOpen);
      this.curtainOpen = true;
      ++this.sliceCount;
      const clock = this.theaterClock, beginning = clock.awake();
      // if necessary, leave curtain open until deadline of time slice passes
      const deadline = beginning + this.curtainSlice;
      const working = this.workingActors, active = this.activeActor;
      // while there are actors ready for work and the deadline of time slice hasn't passed yet
      for (let now = beginning; !working.isEmpty() && now <= deadline; now = clock.awake()) {
        ++this.slicePerformances;
        // first working actor becomes active actor on stage
        const actor = working.firstIndex();
        active.add(actor);
        // actor performs some work on stage
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
    walkActors: function() {
      return I.Loop.concat(
        this.activeActor.walk(),
        this.workingActors.walk(),
        this.waitingActors.walk(),
        this.idleActors.walk()
      );
    }
  });
  I.nest({
    //@ A theater clock wakes up on time for charged events.
    Clock: 'Wait.Clock'.subclass(I => {
      I.am({
        Abstract: false
      });
      I.have({
        //@{Std.Closure} wake-up call
        wakeUp: null,
        //@{any} false (awake), null (waking up), true (deep sleep) or JavaScript alarm to wake up
        sleeping: true,
        //@{number} deadline for next JavaScript alarm
        deadline: null
      });
      I.know({
        //@param wakeUp {Std.Closure} code to wake up
        build: function(wakeUp) {
          I.$super.build.call(this);
          this.wakeUp = wakeUp;
        },
        //@ Adjust clock whilst awake.
        //@return {number} current clock time
        awake: function() {
          this.resetAlarm(false);
          const uptime = this.get();
          // fire delay events whose deadline passed
          let delay;
          while ((delay = this.getFirstCharge()) && delay.deadline <= uptime) {
            delay.fire();
          }
          return uptime;
        },
        //@ Schedule next wake-up call as soon as possible.
        //@return nothing
        awakeSoon: function() {
          if (this.sleeping !== null) {
            clearTimeout(this.sleeping);
            this.sleeping = this.deadline = null;
            // continue after control has returned to global event loop
            this.$rt.asap(this.wakeUp);
          }
          // otherwise wake-up call is already scheduled
        },
        //@ Clear pending alarm/deadline and continue with new sleeping status.
        //@param sleeping {any} null, boolean or JavaScript alarm
        //@return nothing
        resetAlarm: function(sleeping) {
          if (this.sleeping) {
            clearTimeout(this.sleeping);
            this.deadline = null;
          }
          this.sleeping = sleeping;
        },
        //@ Schedule wake-up call for deep sleep, otherwise wake up as soon as possible.
        //@param deep {boolean} true for deep sleep, otherwise wake up asap
        //@return {number} current clock time
        sleep: function(deep) {
          const uptime = this.get();
          // check first delay if going to deep sleep
          const delay = deep && this.getFirstCharge();
          // if delayed, compute seconds left until first delay should fire
          const seconds = delay ? delay.deadline - uptime : Infinity;
          if (!deep || seconds <= 0) {
            // awake from light sleep or awake to fire first delay
            this.awakeSoon();
          } else if (!delay) {
            // deep sleep without alarm
            this.resetAlarm(true);
          } else if (delay.deadline !== this.deadline) {
            // wake up from deep sleep on time for new deadline
            this.resetAlarm(setTimeout(this.wakeUp, seconds * 1000));
            this.deadline = delay.deadline;
          }
          // else keep alarm of first deadline intact
          return uptime;
        }
      });
    })
  });
  I.setup(function() {
    I._.Actor.lockInstanceConstants({ $theater: I.$.create() });
  });
})