//@ A theater cue is a unique, onetime occasion on stage.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Theater.Cue?} parent of this charged cue, otherwise this cue is uncharged
    parentCue: null
  });
  const Showstopper = I._.Showstopper;
  I.know({
    //@ A charged cue has a parent. A cue can only fire after it has been charged.
    //@param parent {Std.Theater.Cue} charging parent
    //@param blooper {Std.Theater.Blooper?} blooper for fallible events
    //@return {Std.Event?} nothing or event that fired upon charging
    //@except when this event is already charged
    charge: function(parent, blooper) {
      I.failUnless('charged twice', !this.parentCue);
      this.parentCue = parent;
    },
    //@ A discharged cue is an orphan without a parent. A discharged cue cannot fire.
    //@return nothing
    //@except when this event is already discharged
    discharge: function() {
      I.failUnless('discharged twice', this.parentCue);
      this.parentCue = null;
    },
    //@ Fire ignition to announce the occasion.
    //@param ignition {Std.Event?} event that fired
    //@param fromChild {Std.Theater.Cue?} cue that propagated ignition
    //@return nothing
    fire: function(ignition, fromChild) {
      const parent = this.parentCue;
      if (parent) {
        this.parentCue = null;
        parent.fire(fromChild ? ignition : this, this);
      } else {
        // a child cannot fire up to an ancestor which has not been charged
        I.failUnless('unexpected ignition from below', !fromChild);
      }
    },
    //@ Is this a fallible cue? Fallible cues are charged with a blooper.
    //@return {boolean} true for cue that potentiallly fails asynchronously, otherwise false
    isFallible: I.returnFalse,
    //@ Install effect that an ignition triggers.
    //@param effect {*|function} plain or computed effect of ignition
    //@return {Std.Theater.Showstopper} job showstopper
    //@except when this event is already charged
    triggers: function(effect) {
      I.failUnless('triggers while charged', !this.parentEvent);
      return Showstopper.create(this, effect);
    }
  });
  I.share({
    //@ Create cue that fires when some result has been assigned with a closure.
    //@param install {function} called with assignment closure
    //@return {Std.Theater.Cue.$._.Deferred} cue with asynchronous value
    deferred: function(install) {
      return I.Deferred.create(install);
    },
    //@ Create conjunction cue that fires when every child has fired.
    //@param cues {[Std.Theater.Cue]} child cues
    //@return {Std.Theater.Cue?} conjunction event or nothing if there are no children
    every: cues => {
      const n = cues.length;
      if (n > 1) {
        return I.Conjunction.create(cues);
      } else if (n === 1) {
        return cues[0];
      }
    },
    //@ Create disjunction cue that fires when some child has fired.
    //@param cues {[Std.Event]} child cues
    //@return {Std.Theater.Cue?} disjunction event or nothing if there are no children
    some: cues => {
      const n = cues.length;
      if (n > 1) {
        return I.Disjunction.create(cues);
      } else if (n === 1) {
        return cues[0];
      }
    }
  });
  I.nest({
    //@ A deferred cue fires after the result has been assigned.
    Deferred: 'Cue'.subclass(I => {
      I.have({
        //@{*} available result if not unassigned
        result: null
      });
      const Unassigned = Symbol();
      I.access({
        //@return {*|Std.Theater.Showstopper} available result or a showstopper to get it
        value:function() {
          return this.result !== Unassigned ? this.result : this.triggers(() => this.result);
        }
      });
      I.know({
        //@param install {function} install assignment to call with result
        build: function(install) {
          I.$super.build.call(this);
          this.result = Unassigned;
          install(result => {
            if (result !== Unassigned && this.result === Unassigned) {
              this.result = result;
              this.fire();
            }
          });
        },
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          if (this.result !== Unassigned) {
            return this;
          }
        }
      });
    }),
    //@ A cue with two or more children.
    Composition: 'Cue'.subclass(I => {
      I.have({
        //@{Set[Std.Theater.Cue]} set with charged children of this composed cue
        children: null,
        //@{boolean} true if this composition has at least one fallible child, otherwise false
        fallible: null
      });
      I.know({
        //@param children {[Std.Event]} child events
        build: function(children) {
          I.$super.build.call(this);
          this.children = new Set(children);
          this.fallible = children.some(child => child.isFallible());
        },
        discharge: function() {
          I.$super.discharge.call(this);
          this.children.forEach(child => child.discharge());
        },
        isFallible: function() {
          // this composition is fallible if one or more children are fallible
          return this.fallible;
        },
        //@ Discharge charged children.
        //@return nothing
        undoCharge: function() {
          for (let child of this.children) {
            if (!child.parentCue) {
              return;
            }
            child.discharge();
          }
        }
      });
    }),
    //@ A conjunction cue fires when all children have fired.
    Conjunction: 'Cue.$._.Composition'.subclass(I => {
      I.have({
        //@{Set[Std.Theater.Cue]} set with cues that already fired
        ignitions: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          I.failUnless('charge with mistake', !blooper || !blooper.isMistake());
          const children = this.children, ignitions = this.ignitions = new Set();
          for (let child of children) {
            const ignition = child.charge(this, blooper);
            if (blooper && blooper.isMistake()) {
              this.undoCharge();
              return;
            }
            if (ignition) {
              // add ignition that fired while charging child
              children.delete(child);
              ignitions.add(ignition);
            }
          }
          // this event fires, when all children fired
          if (!children.size) {
            return this;
          }
        },
        fire: function(ignition, fromChild) {
          const children = this.children, ignitions = this.ignitions;
          ignitions.add(ignition);
          children.delete(fromChild);
          // this event fires, when all children fired
          if (!children.size) {
            I.$super.fire.call(this);
          }
        }
      });
    }),
    //@ A disjunction event fires when some child has fired.
    Disjunction: 'Cue.$._.Composition'.subclass(I => {
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          I.failUnless('charge with mistake', !blooper || !blooper.isMistake());
          const children = this.children;
          for (let child of children) {
            const ignition = child.charge(this, blooper);
            if (blooper && blooper.isMistake()) {
              this.undoCharge();
              return;
            }
            if (ignition) {
              children.delete(child);
              this.undoCharge();
              return ignition;
            }
          }
        },
        fire: function(ignition, fromChild) {
          // discharge other children when some child has fired
          this.children.delete(fromChild);
          this.undoCharge();
          I.$super.fire.call(this, ignition, fromChild);
        }
      });
    })
  });
})