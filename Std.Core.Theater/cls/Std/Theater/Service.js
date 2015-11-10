'BaseObject+Eventful'.subclass(function(I) {
  "use strict";
  // I describe the theater that schedules actors on stage.
  I.am({
    Abstract: false,
    Service: true
  });
  I.have({
    // ring with actors that have nothing to do, not even something planned in their agendas
    idleActors: null,
    // ring with actors that are ready to work on jobs
    workingActors: null,
    // ring with actor on theater stage
    activeActor: null,
    // ring with actors that are out of work and waiting for events in their agendas to fire
    waitingActors: null,
    // ring with actors in trouble whose managers decide what to do next
    troubledActors: null,
    // clock keeps track of real-time
    theaterClock: null,
    // curtain is either open or closed
    curtainOpen: false,
    // by default, curtain remains open for 8ms in a time slice unless there's nothing to do
    curtainSlice: 0.008,
    // count number of times curtain has been opened to schedule actors in a time slice 
    sliceCount: 0,
    // count number of actor performances in time slices
    slicePerformances: 0,
    // total time that curtain has been open for a time slice
    sliceTime: 0,
    // count number of interrupts on stage
    interruptCount: 0,
    // total time that curtain has been open to handle interrupts
    interruptTime: 0
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.idleActors = I._.Ring.create();
      this.workingActors = I._.Ring.create();
      this.activeActor = I._.Ring.create();
      this.waitingActors = I._.Ring.create();
      this.troubledActors = I._.Ring.create();
      this.theaterClock = this.$rt.register(I.Clock.create(this.wakeUp.bind(this)));
    },
    // handle interrupt on theater stage
    interrupt: function(job) {
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
        // actor without work is idle
        this.idleActors.add(actor);
      }
    },
    // create event that fires when this theater ends a time slice and goes back to sleep
    sleeps: function() {
      return this.createEvent();
    },
    // wake up to open curtain and to let actors work on theater stage until time's up
    wakeUp: function() {
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
      // fire events when this theater goes back to sleep
      this.fireAll();
      // start deep sleep when out of work, otherwise wake up for next slice as soon as possible
      this.sliceTime += clock.sleep(working.isEmpty()) - beginning;
      this.curtainOpen = false;
    },
    // iterate over actors that live in this theater
    walkActors: function() {
      var active = this.activeActor.walk();
      var working = this.workingActors.walk();
      var waiting = this.waitingActors.walk();
      var idle = this.idleActors.walk();
      return I.Loop.concat(active, working, waiting, idle);
    }
  });
  I.nest({
    Clock: 'Wait.Clock'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      // I describe clocks that wake up on time for delay events.
      I.have({
        // closure for wake-up call
        wakeUp: null,
        // false (awake), null (waking up), true (deep sleep) or JavaScript alarm to wake up
        sleeping: true,
        // deadline for next JavaScript alarm
        deadline: null
      });
      I.know({
        build: function(wakeUp) {
          I.$super.build.call(this);
          this.wakeUp = wakeUp;
        },
        createEvent: function(seconds) {
          return I.$outer.Delay.create(this, seconds);
        },
        sortCharge: function(delays, delay) {
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
        testIgnition: function(delay) {
          if (delay.seconds <= 0) {
            // fire immediately
            return true;
          }
          // deadline is needed for sorting charged delay events
          delay.deadline = this.get() + delay.seconds;
          return false;
        },
        // advance clock whilst awake
        awake: function() {
          this.resetAlarm(false);
          var uptime = this.get();
          // fire delay events whose deadline passed
          for (var delay; (delay = this.getFirstCharge()) && delay.deadline <= uptime; ) {
            delay.fire();
          }
          return uptime;
        },
        // schedule wake-up call as soon as possible
        awakeSoon: function() {
          if (this.sleeping !== null) {
            clearTimeout(this.sleeping);
            this.sleeping = this.deadline = null;
            // continue after control has returned to global event loop
            this.$rt.asap(this.wakeUp);
          }
          // otherwise wake-up call is already scheduled
        },
        // clear pending alarm and continue with new sleeping status
        resetAlarm: function(sleeping) {
          if (this.sleeping) {
            clearTimeout(this.sleeping);
            this.deadline = null;
          }
          this.sleeping = sleeping;
        },
        // schedule wake-up call for deep sleep, otherwise wake up as soon as possible
        sleep: function(deep) {
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
    Delay: 'BaseEvent'.subclass(function(I) {
      // I describe delay events of clocks.
      I.have({
        // seconds to wait
        seconds: null,
        // uptime when this delay event fires
        deadline: null
      });
      I.know({
        build: function(clock, seconds) {
          I.$super.build.call(this, clock);
          this.seconds = seconds;
        }
      });
    })
  });
  I.setup(function() {
    I._.Actor.lockInstanceConstants({$theater: I.$.$rt.register(I.$.create())});
  });
})