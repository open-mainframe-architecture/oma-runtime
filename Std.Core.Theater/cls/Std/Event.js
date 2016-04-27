//@ An event can fire when it's charged.
'Theater.AbstractEvent'.subclass(I => {
  'use strict';
  const Showstopper = I._.Theater._.Showstopper;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Theater.AbstractEvent?} parent of this charged event, otherwise this event is uncharged
    parentEvent: null
  });
  I.know({
    fire: function(ignition, fromChild) {
      const parent = this.parentEvent;
      if (parent) {
        this.parentEvent = null;
        parent.fire(fromChild ? ignition : this, this);
      } else {
        // a child cannot fire to an ancestor without a parent
        this.assert(!fromChild);
      }
    },
    //@ A charged event has a parent. An event can only fire after it has been charged.
    //@param parent {Std.Theater.AbstractEvent} charging parent
    //@param blooper {Std.Theater.Blooper?} blooper for fallible events
    //@return {Std.Event?} nothing or event that fired upon charging
    //@except when this event is already charged
    charge: function(parent) {
      this.assert(!this.parentEvent);
      this.parentEvent = parent;
    },
    //@ A discharged event is an orphan without a parent. A discharged event cannot fire.
    //@return nothing
    //@except when this event is already discharged
    discharge: function() {
      this.assert(this.parentEvent);
      this.parentEvent = null;
    },
    //@ Is this a fallible event? Fallible events are charged with a blooper.
    //@return {boolean} true for event that potentiallly fails asynchronously, otherwise false
    isFallible: I.returnFalse,
    //@ Install effect that an ignition triggers.
    //@param effect {any|Std.Closure} plain or computed effect of ignition
    //@return {Std.Theater.Showstopper} showstopper event for job
    //@except when this event is already charged
    triggers: function(effect) {
      this.assert(!this.parentEvent);
      return Showstopper.create(this, effect);
    }
  });
  I.share({
    //@ Create event that fires when some result has been set with setter closure.
    //@param install {Std.Closure} called with setter closure
    //@return {Std.Event+Std.Indirect} event for and indirection to asynchronous result
    deferred: function(install) {
      return I.AsynchronousHolder.create(install);
    },
    //@ Create conjunction event that fires when every event has fired.
    //@param events {[Std.Event]} child events
    //@return {Std.Event?} conjunction event or nothing if there are no children
    every: function(events) {
      const n = events.length;
      if (n > 1) {
        return I.Conjunction.create(events);
      } else if (n === 1) {
        return events[0];
      }
    },
    //@ Create disjunction event that fires when some event has fired.
    //@param events {[Std.Event]} child events
    //@return {Std.Event?} disjunction event or nothing if there are no children
    some: function(events) {
      const n = events.length;
      if (n > 1) {
        return I.Disjunction.create(events);
      } else if (n === 1) {
        return events[0];
      }
    }
  });
  I.nest({
    //@ An event with two or more children.
    Composition: 'Event'.subclass(I => {
      I.have({
        //@{[Std.Event]} array with children of this composed event
        children: null,
        //@{boolean} true if this composition has at least one fallible child, otherwise false
        fallible: null
      });
      I.know({
        //@param children {[Std.Event]} child events
        build: function(children) {
          I.$super.build.call(this);
          this.children = children;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.fallible = this.children.some(child => child.isFallible());
        },
        isFallible: function() {
          // this composition is fallible if one or more children are fallible
          return this.fallible;
        }
      });
    }),
    //@ A conjunction event fires when all children have fired.
    Conjunction: 'Event._.Composition'.subclass(I => {
      I.have({
        //@{[Std.Event]} array with events that already fired
        ignitions: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          this.assert(!blooper || !blooper.getFailure());
          const children = this.children, n = children.length, ignitions = this.ignitions = [];
          for (let i = 0; i < n; ++i) {
            const ignition = children[i].charge(this, blooper);
            if (blooper && blooper.getFailure()) {
              return;
            }
            if (ignition) {
              children[i] = null;
              // add event that fired while charging
              ignitions.push(ignition);
            }
          }
          // this event fires, when all children fired 
          if (ignitions.length === children.length) {
            return this;
          }
        },
        discharge: function() {
          I.$super.discharge.call(this);
          const children = this.children, n = children.length;
          for (let i = 0; i < n; ++i) {
            const child = children[i];
            if (child) {
              children[i] = null;
              child.discharge();
            }
          }
        },
        fire: function(ignition, fromChild) {
          const children = this.children, ignitions = this.ignitions;
          ignitions.push(ignition);
          children[children.indexOf(fromChild)] = null;
          // this event fires, when all children fired
          if (ignitions.length === children.length) {
            I.$super.fire.call(this);
          }
        }
      });
    }),
    //@ A disjunction event fires when some child has fired.
    Disjunction: 'Event._.Composition'.subclass(I => {
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          this.assert(!blooper || !blooper.getFailure());
          const children = this.children, n = children.length;
          for (let i = 0; i < n; ++i) {
            const ignition = children[i].charge(this, blooper);
            if (blooper && blooper.getFailure()) {
              return;
            }
            if (ignition) {
              for (let j = i + 1; j < n; ++j) {
                children[j] = null;
              }
              // discharge children that were already charged before ignition occured
              for (let j = i - 1; i >= 0; --j) {
                const chargedChild = children[j];
                children[j] = null;
                chargedChild.discharge();
              }
              return ignition;
            }
          }
        },
        discharge: function() {
          I.$super.discharge.call(this);
          const children = this.children, n = children.length;
          for (let i = 0; i < n; ++i) {
            const child = children[i];
            children[i] = null;
            child.discharge();
          }
        },
        fire: function(ignition, fromChild) {
          const children = this.children;
          // discharge other children when some child has fired
          for (let i = children.length - 1; i >= 0; --i) {
            const child = children[i];
            children[i] = null;
            if (child !== fromChild) {
              child.discharge();
            }
          }
          I.$super.fire.call(this, ignition, fromChild);
        }
      });
    }),
    //@ An asynchronous holder fires after the setter has been called.
    AsynchronousHolder: 'Event+Indirect'.subclass(I => {
      const UNASSIGNED = Symbol();
      I.am({
        Abstract: false
      });
      I.have({
        //@{any} available result if not unassigned
        result: null
      });
      I.know({
        //@param install {Std.Closure} install setter of this asynchronous result
        build: function(install) {
          I.$super.build.call(this);
          this.result = UNASSIGNED;
          install(result => {
            if (result !== UNASSIGNED && this.result === UNASSIGNED) {
              this.result = result;
              this.fire();
            }
          });
        },
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          if (this.result !== UNASSIGNED) {
            return this;
          }
        },
        //@return {any|Std.Theater.Showstopper} available result or a showstopper to get it
        get: function() {
          return this.result !== UNASSIGNED ? this.result : this.triggers(() => this.result);
        }
      });
    })
  });
})