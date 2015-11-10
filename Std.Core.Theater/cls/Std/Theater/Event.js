'BaseObject'.subclass(function(I) {
  'use strict';
  // I describe events in a theater that yield effects after their occurrence.
  I.have({
    // parent of this charged event
    parentEvent: null,
    // true if effect is computed with closure, false if effect is plain, otherwise null
    computesEffect: null,
    // installed effect if computes effect is a boolean
    continueEffect: null,
    // allow leaf event to be fired more than once, but avoid firing up twice
    firedOnce: false
  });
  I.know({
    // a charged event has a parent
    charge: function(parent) {
      if (this.parentEvent) {
        this.bad();
      }
      this.parentEvent = parent;
    },
    // a discharged event is an orphan without a parent
    discharge: function() {
      if (!this.parentEvent) {
        this.bad();
      }
      this.parentEvent = null;
    },
    // fire ignition upwards to root event if event is charged
    fire: function(ignition, fromChild) {
      if (this.parentEvent && !this.firedOnce) {
        this.firedOnce = true;
        this.parentEvent.fire(ignition || this, this);
      }
    },
    // proceed with effect of ignition
    proceed: function(ignition, fromChild) {
      if (!this.parentEvent) {
        this.bad();
      }
      var continuation = this.continueEffect;
      switch (this.computesEffect) {
        case true: return continuation(ignition || this);
        case false: return continuation;
        default: return this.parentEvent.proceed(ignition || this, this);
      }
    },
    // install deferred effect with a closure, otherwise install plain result
    yields: function(effect) {
      if (this.computesEffect !== null || this.parentEvent) {
        this.bad();
      }
      this.computesEffect = typeof effect === 'function';
      this.continueEffect = effect;
      return this;
    },
    // install plain result, e.g. a closure
    yieldsPlain: function(result) {
      if (this.computesEffect !== null || this.parentEvent) {
        this.bad();
      }
      this.computesEffect = false;
      this.continueEffect = result;
      return this;
    }
  });
  I.nest({
    Composition: 'Event'.subclass(function(I) {
      // I describe events with two or more children.
      I.have({
        // array with children of this composed event
        children: null
      });
      I.know({
        build: function(children) {
          I.$super.build.call(this);
          this.children = children;
        }
      });
    }),
    Conjunction: 'Event._.Composition'.subclass(function(I) {
      // I describe composed events that fire when all children have fired.
      I.have({
        // array with events that already fired
        triggers: null
      });
      I.know({
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          var children = this.children;
          var triggers = this.triggers = [];
          for (var i = 0, n = children.length; i < n; ++i) {
            var ignition = children[i].charge(this);
            if (ignition) {
              children[i] = null;
              // add event that fired while charging
              triggers.push(ignition);
            }
          }
          // this event fires, when all children fired 
          if (triggers.length === children.length) {
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
          var children = this.children;
          var triggers = this.triggers;
          triggers.push(ignition);
          children[children.indexOf(fromChild)] = null;
          // this event fires, when all children fired
          if (triggers.length === children.length) {
            I.$super.fire.call(this);
          }
        }
      });
    }),
    Disjunction: 'Event._.Composition'.subclass(function(I) {
      // I describe composed events that fire when some child has fired.
      I.know({
        charge: function(parent) {
          I.$super.charge.call(this, parent);
          var children = this.children;
          for (var i = 0, n = children.length; i < n; ++i) {
            var ignition = children[i].charge(this), j;
            if (ignition) {
              for (j = i + 1; j < n; ++j) {
                children[j] = null;
              }
              for (j = i - 1; i >= 0; --j) {
                var child = children[j];
                children[j] = null;
                // discharge children that were already charged before ignition occured
                child.discharge();
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
            if (child !== fromChild) {
              children[i] = null;
              child.discharge();
            }
          }
          I.$super.fire.call(this, ignition);
        }
      });
    }),
  });
})