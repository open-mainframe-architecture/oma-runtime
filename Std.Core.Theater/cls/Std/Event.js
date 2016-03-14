//@ An event in a theater can fire when it's charged.
'BaseObject'.subclass(function(I) {
  'use strict';
  I.have({
    //@{Std.Event?} parent of this charged event, otherwise this event is uncharged
    parentEvent: null
  });
  I.know({
    //@ A charged event has a parent. An event can only fire after it has been charged.
    //@param parent {Std.Event} charging parent
    //@param blooper {Std.Theater.Blooper?} blooper for fallible events
    //@return {Std.Event?} nothing or event that fired upon charging
    //@except when this event is already charged
    charge: function(parent) {
      if (this.parentEvent) {
        this.bad();
      }
      this.parentEvent = parent;
    },
    //@ A discharged event is an orphan without a parent. Once discharged, an event cannot fire.
    //@return nothing
    //@except when this event is already discharged
    discharge: function() {
      if (!this.parentEvent) {
        this.bad();
      }
      this.parentEvent = null;
    },
    //@ Fire ignition upwards to root event if event is charged.
    //@param ignition {Std.Event?} event that fired, otherwise this event fired
    //@param fromChild {Std.Event?} child event that propagated upwards
    //@return nothing
    fire: function(ignition, fromChild) {
      var parent = this.parentEvent;
      if (parent) {
        this.parentEvent = null;
        parent.fire(fromChild ? ignition : this, this);
      } else if (fromChild) {
        // a child with a parent fired upwards to an ancestor without a parent
        this.bad();
      }
    },
    //@ Is this a fallible event? Fallible events are charged with a blooper.
    //@return {boolean} true for event that potentiallly fails asynchronously, otherwise false
    isFallible: I.returnFalse,
    //@ Install effect that an ignition triggers.
    //@param effect {any|Std.Closure} plain or computed effect of ignition
    //@return {Std.Theater.Showstopper} shopstopper event for job
    triggers: function(effect) {
      if (this.parentEvent) {
        this.bad();
      }
      return I._.Theater._.Showstopper.create(this, effect);
    }
  });
  I.share({
    //@ Create event that fires when some result is available.
    //@param install {Std.Closure} called with setter closure
    //@return {Std.Event+Std.Indirect} event for and indirection to asynchronous result
    available: function(install) {
      return I.AsynchronousResult.create(install);
    },
    //@ Create successful completion event of job.
    //@param job {Std.Theater.Job} theater job
    //@return {Std.FullEvent} completion event
    complete: function(job) {
      return job.completion();
    },
    //@ Create conjunction event that fires when every event has fired.
    //@param events {[Std.Event]} child events
    //@return {Std.Event?} conjunction event or nothing if there are no children
    every: function(events) {
      var n = events.length;
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
      var n = events.length;
      if (n > 1) {
        return I.Disjunction.create(events);
      } else if (n === 1) {
        return events[0];
      }
    }
  });
  I.nest({
    //@ An event with two or more children.
    Composition: 'Event'.subclass(function(I) {
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
          this.fallible = children.some(function(child) { return child.isFallible(); });
        },
        isFallible: function() {
          // this composition is fallible if one or more children are fallible
          return this.fallible;
        }
      });
    }),
    //@ A conjunction event fires when all children have fired.
    Conjunction: 'Event._.Composition'.subclass(function(I) {
      I.have({
        //@{[Std.Event]} array with events that already fired
        ignitions: null
      });
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          if (blooper && blooper.getFailure()) {
            this.bad();
          }
          var children = this.children, ignitions = this.ignitions = [];
          for (var i = 0, n = children.length; i < n; ++i) {
            var ignition = children[i].charge(this, blooper);
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
          var children = this.children;
          for (var i = 0, n = children.length; i < n; ++i) {
            var child = children[i];
            if (child) {
              children[i] = null;
              child.discharge();
            }
          }
        },
        fire: function(ignition, fromChild) {
          var children = this.children, ignitions = this.ignitions;
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
    Disjunction: 'Event._.Composition'.subclass(function(I) {
      I.know({
        charge: function(parent, blooper) {
          I.$super.charge.call(this, parent, blooper);
          if (blooper && blooper.getFailure()) {
            this.bad();
          }
          var children = this.children, j;
          for (var i = 0, n = children.length; i < n; ++i) {
            var ignition = children[i].charge(this, blooper);
            if (blooper && blooper.getFailure()) {
              return;
            }
            if (ignition) {
              for (j = i + 1; j < n; ++j) {
                children[j] = null;
              }
              // discharge children that were already charged before ignition occured
              for (j = i - 1; i >= 0; --j) {
                var chargedChild = children[j];
                children[j] = null;
                chargedChild.discharge();
              }
              return ignition;
            }
          }
        },
        discharge: function() {
          I.$super.discharge.call(this);
          var children = this.children;
          for (var i = 0, n = children.length; i < n; ++i) {
            var child = children[i];
            children[i] = null;
            child.discharge();
          }
        },
        fire: function(ignition, fromChild) {
          var children = this.children;
          // discharge other children when some child has fired
          for (var i = children.length - 1; i >= 0; --i) {
            var child = children[i];
            children[i] = null;
            if (child !== fromChild) {
              child.discharge();
            }
          }
          I.$super.fire.call(this, ignition, fromChild);
        }
      });
    }),
    //@ An asynchronous result fires after the setter has been called.
    AsynchronousResult: 'Event+Indirect'.subclass(function(I) {
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
          this.result = Unassigned;
          install(setter.bind(this));
        },
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          if (this.result !== Unassigned) {
            return this;
          }
        },
        //@return {any|Std.Theater.Showstopper} available result or a showstopper to get it
        get: function() {
          return this.result !== Unassigned ? this.result :
            this.triggers(function(asynchronous) { return asynchronous.result; });
        }
      });
      var Unassigned = {};
      function setter(result) { //jshint validthis:true
        if (result !== Unassigned && this.result === Unassigned) {
          this.result = result;
          this.fire();
        }
      }
    })
  });
})