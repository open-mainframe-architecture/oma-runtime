'Event'.subclass(function (I) {
  "use strict";
  // I describe root events that block jobs.
  I.am({
    Final: true
  });
  I.have({
    // child event of this showstopper
    childEvent: null,
    // plain or computed effect of this showstopper
    ignitionEffect: null,
    // the job whose scene is blocked
    blockedJob: null,
    // ignition is event that fired
    ignitionEvent: null
  });
  I.know({
    build: function (event, effect) {
      I.$super.build.call(this);
      // root event is its own parent
      this.parentEvent = this;
      this.childEvent = event.precharge();
      this.ignitionEffect = effect;
    },
    // disable charging and discharging for showstoppers
    charge: I.shouldNotOccur,
    discharge: I.shouldNotOccur,
    // continue working on job when ignition of this showstopper fires up
    fire: function (ignition, fromChild) {
      if (this.ignitionEvent || this.childEvent !== fromChild) {
        this.bad();
      }
      // repost job to produce effect of ignition on stage
      this.ignitionEvent = ignition;
      this.blockedJob.repost();
      this.childEvent = this.blockedJob = null;
    },
    // charge event and block scene until event fires
    blockScene: function (job) {
      if (this.blockedJob) {
        this.bad();
      }
      this.blockedJob = job;
      // charge child event and set ignition when child fires immediately
      this.ignitionEvent = this.childEvent.charge(this);
    },
    // discharge child event if this showstopper was still waiting for the event to fire
    cancel: function () {
      if (!this.ignitionEvent && this.childEvent) {
        var event = this.childEvent;
        this.childEvent = this.ignitionEffect = this.blockedJob = null;
        event.discharge();
      }
    },
    hasIgnition: function () {
      return !!this.ignitionEvent;
    },
    // produce effect caused by ignition
    produceEffect: function () {
      var ignition = this.ignitionEvent, effect = this.ignitionEffect;
      if (!ignition) {
        this.bad();
      }
      this.ignitionEffect = this.ignitionEvent = null;
      if (I._.Blooper.describes(ignition)) {
        // throw failure while on theater stage to produce effect of blooper
        throw ignition.getFailure();
      }
      return typeof effect === 'function' ? effect(ignition) : effect;
    }
  });
})