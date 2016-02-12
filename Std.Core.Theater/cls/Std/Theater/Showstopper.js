//@ A showstopper is a root event that blocks a job.
'Event'.subclass(function (I) {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Event} child event of this showstopper
    childEvent: null,
    //@{any|Rt.Closure} plain or computed effect of this showstopper
    ignitionEffect: null,
    //@{Std.Theater.Job} the job whose scene is blocked
    blockedJob: null,
    //@{Std.Theater.Blooper?} blooper for fallible child event
    blooperEvent: null,
    //@{Std.Event} ignition is event that fired
    ignitionEvent: null
  });
  I.know({
    //@param event {Std.Event} child event
    //@param effect {any|Rt.Closure} ignition effect
    build: function (event, effect) {
      I.$super.build.call(this);
      // root event is its own parent
      this.parentEvent = this;
      this.childEvent = event;
      this.ignitionEffect = effect;
    },
    //@ A showstopper is a root event that cannot be charged.
    charge: I.shouldNotOccur,
    //@ A showstopper is a root event that cannot be discharged.
    discharge: I.shouldNotOccur,
    fire: function (ignition, fromChild) {
      var child = this.childEvent, blooper = this.blooperEvent;
      if (this.ignitionEvent) {
        this.bad();
      }
      if (fromChild === child) {
        if (blooper) {
          blooper.discharge();
        }
      } else if (fromChild === blooper) {
        child.discharge();
      } else {
        this.bad();
      }
      // repost job to produce effect of ignition on stage
      this.ignitionEvent = ignition;
      this.blockedJob.repost();
      this.childEvent = this.blooperEvent = this.blockedJob = null;
    },
    //@ Charge event and block scene until event fires.
    //@param job {Std.Theater.Job} job to block
    //@return nothing
    blockScene: function (job) {
      if (this.blockedJob) {
        this.bad();
      }
      this.blockedJob = job;
      var child = this.childEvent;
      if (child.isFallible()) {
        var blooper = this.blooperEvent = I._.Blooper.create();
        // charge with blooper for asynchronous failures
        this.ignitionEvent = child.charge(this, blooper) || blooper.charge(this);
      } else {
        // charge without blooper
        this.ignitionEvent = child.charge(this);
      }
    },
    //@ Discharge child event if this showstopper was still waiting for the event to fire.
    //@return nothing
    cancel: function () {
      if (!this.ignitionEvent && this.childEvent) {
        var child = this.childEvent, blooper = this.blooperEvent;
        this.childEvent = this.blooperEvent = this.ignitionEffect = this.blockedJob = null;
        child.discharge();
        if (blooper) {
          blooper.discharge();
        }
      }
    },
    //@ Did some event fire to unblock this showstopper?
    //@return {boolean} true if this showstopper has an ignition, otherwise false
    hasIgnition: function () {
      return !!this.ignitionEvent;
    },
    //@ Produce effect caused by ignition.
    //@return {any} computed or plain effect of ignition
    //@except when this showstopper does not have an ignition
    //@except when the ignition is a blooper with an asynchronous failure
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