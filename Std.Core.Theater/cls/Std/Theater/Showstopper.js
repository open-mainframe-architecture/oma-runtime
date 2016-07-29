//@ A showstopper blocks the scene of a job until the child cue fires.
'Cue'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Theater.Cue} child cue of this showstopper
    childCue: null,
    //@{Std.Theater.Blooper?} blooper for fallible child cue
    blooperCue: null,
    //@{*|function} plain or computed effect of this showstopper
    ignitionEffect: null,
    //@{Std.Theater.Job} the job whose scene is blocked
    blockedJob: null,
    //@{Std.Event} ignition is event or conjunction that fired
    ignitionCue: null
  });
  const Blooper = I._.Blooper;
  I.know({
    //@param cue {Std.Theater.Cue} child cue
    //@param effect {*|function} ignition effect
    build: function(cue, effect) {
      I.$super.build.call(this);
      this.childCue = cue;
      this.ignitionEffect = effect;
    },
    fire: function(ignition, fromChild) {
      I.failUnless('second ignition', !this.ignitionCue);
      const child = this.childCue, blooper = this.blooperCue;
      if (fromChild === child) {
        if (blooper) {
          blooper.discharge();
        }
      } else {
        I.failUnless('bad ignition', fromChild === blooper);
        child.discharge();
      }
      // repost job to produce effect of ignition on stage
      this.ignitionCue = ignition;
      this.blockedJob.repost();
      this.childCue = this.blockedJob = null;
    },
    //@ Charge child cue and block scene until child ignites.
    //@param job {Std.Theater.Job} job to block
    //@return nothing
    blockScene: function(job) {
      I.failUnless('block job twice', !this.blockedJob);
      this.blockedJob = job;
      const child = this.childCue;
      if (child.isFallible()) {
        const blooper = this.blooperCue = Blooper.create();
        // charge with blooper for asynchronous errors
        this.ignitionCue = child.charge(this, blooper) || blooper.charge(this);
      } else {
        // charge without blooper
        this.ignitionCue = child.charge(this);
      }
    },
    //@ Discharge child cue if this showstopper was still waiting for the child to fire.
    //@return nothing
    cancel: function() {
      if (!this.ignitionCue && this.childCue) {
        const child = this.childCue, blooper = this.blooperCue;
        this.childCue = this.blooperCue = this.ignitionEffect = this.blockedJob = null;
        child.discharge();
        if (blooper) {
          blooper.discharge();
        }
      }
    },
    //@ Did some cue fire to unblock this showstopper?
    //@return {boolean} true if this showstopper has an ignition, otherwise false
    hasIgnition: function() {
      return !!this.ignitionCue;
    },
    //@ Produce effect caused by ignition.
    //@param role {Std.Role} theater role
    //@return {*} computed or plain effect of ignition
    //@except when this showstopper does not have an ignition
    //@except when the ignition is a blooper with an asynchronous error
    produceEffect: function(role) {
      const ignition = this.ignitionCue, effect = this.ignitionEffect, blooper = this.blooperCue;
      I.failUnless('effect without ignition', ignition);
      this.ignitionEffect = this.ignitionCue = this.blooperCue = null;
      if (ignition === blooper) {
        // throw error while on theater stage to produce effect of blooper
        throw blooper.getError();
      }
      return I.isClosure(effect) ? effect.call(role, ignition) : effect;
    },
    //@ This showstopper can propel more future progress. Errors are thrown on stage.
    //@param progress {*|function} plain or computed progress
    //@return {Std.Theater.Showstopper} this showstopper
    propels: function(progress) {
      I.failUnless('propel after blocking', !this.blockedJob);
      I.failUnless('propel without child', this.childCue);
      // install new effect that continues after old effect
      const oldEffect = this.ignitionEffect;
      this.ignitionEffect = function(ignition) {
        const intermediate = I.isClosure(oldEffect) ? oldEffect.call(this, ignition) : oldEffect;
        // intermediate error result prevents progress
        return I.isError(intermediate) ? intermediate :
          // intermediate job or showstopper propels future progress
          intermediate && I.isClosure(intermediate.propels) ? intermediate.propels(progress) :
            // if progress is a closure, apply closure on successful intermediate result
            I.isClosure(progress) ? progress.call(this, intermediate) :
              // ignore successful intermediate result and proceed job with given progress
              progress;
      };
      // reuse this showstopper to propel more progress
      return this;
    }
  });
})