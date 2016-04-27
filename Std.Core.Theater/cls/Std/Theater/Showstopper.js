//@ A showstopper blocks the scene of a job until the child event fires.
'AbstractEvent+Production'.subclass(I => {
  "use strict";
  const Blooper = I._.Blooper, Production = I._.Production;
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Std.Event} child event of this showstopper
    childEvent: null,
    //@{any|Std.Closure} plain or computed effect of this showstopper
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
    //@param effect {any|Std.Closure} ignition effect
    build: function(event, effect) {
      I.$super.build.call(this);
      this.childEvent = event;
      this.ignitionEffect = effect;
    },
    fire: function(ignition, fromChild) {
      this.assert(!this.ignitionEvent);
      const child = this.childEvent, blooper = this.blooperEvent;
      if (fromChild === child) {
        if (blooper) {
          blooper.discharge();
        }
      } else {
        this.assert(fromChild === blooper);
        child.discharge();
      }
      // repost job to produce effect of ignition on stage
      this.ignitionEvent = ignition;
      this.blockedJob.repost();
      this.childEvent = this.blooperEvent = this.blockedJob = null;
    },
    propels: function(progress) {
      this.assert(!this.blockedJob, this.childEvent);
      // install new effect that continues after old effect
      const oldEffect = this.ignitionEffect;
      this.ignitionEffect = function(ignition) {
        const intermediate = I.isClosure(oldEffect) ? oldEffect.call(this, ignition) : oldEffect;
        // intermediate error result prevents progress
        return I.isErroneous(intermediate) ? intermediate :
          // intermediate production result propels future progress
          Production.describes(intermediate) ? intermediate.propels(progress) :
            // if progress is a closure, apply closure on successful intermediate result
            I.isClosure(progress) ? progress.call(this, intermediate) :
              // ignore successful intermediate result and proceed job with given progress
              progress;
      };
      // reuse this showstopper to propel more progress
      return this;
    },
    //@ Charge event and block scene until event fires.
    //@param job {Std.Theater.Job} job to block
    //@return nothing
    blockScene: function(job) {
      this.assert(!this.blockedJob);
      this.blockedJob = job;
      const child = this.childEvent;
      if (child.isFallible()) {
        const blooper = this.blooperEvent = Blooper.create();
        // charge with blooper for asynchronous failures
        this.ignitionEvent = child.charge(this, blooper) || blooper.charge(this);
      } else {
        // charge without blooper
        this.ignitionEvent = child.charge(this);
      }
    },
    //@ Discharge child event if this showstopper was still waiting for the event to fire.
    //@return nothing
    cancel: function() {
      if (!this.ignitionEvent && this.childEvent) {
        const child = this.childEvent, blooper = this.blooperEvent;
        this.childEvent = this.blooperEvent = this.ignitionEffect = this.blockedJob = null;
        child.discharge();
        if (blooper) {
          blooper.discharge();
        }
      }
    },
    //@ Did some event fire to unblock this showstopper?
    //@return {boolean} true if this showstopper has an ignition, otherwise false
    hasIgnition: function() {
      return !!this.ignitionEvent;
    },
    //@ Produce effect caused by ignition.
    //@param role {Std.Role} theater role
    //@return {any} computed or plain effect of ignition
    //@except when this showstopper does not have an ignition
    //@except when the ignition is a blooper with an asynchronous failure
    produceEffect: function(role) {
      const ignition = this.ignitionEvent, effect = this.ignitionEffect;
      this.assert(ignition);
      this.ignitionEffect = this.ignitionEvent = null;
      if (Blooper.describes(ignition)) {
        // throw failure while on theater stage to produce effect of blooper
        throw ignition.getFailure();
      }
      return I.isClosure(effect) ? effect.call(role, ignition) : effect;
    }
  });
})