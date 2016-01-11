'BaseObject'.subclass(function (I) {
  'use strict';
  // I describe an events in a theater that can fire when it's charged.
  I.have({
    // parent of this charged event, otherwise uncharged event
    parentEvent: null
  });
  I.know({
    // a charged event has a parent
    charge: function (parent) {
      if (this.parentEvent) {
        this.bad();
      }
      this.parentEvent = parent;
    },
    // a discharged event is an orphan without a parent
    discharge: function () {
      if (!this.parentEvent) {
        this.bad();
      }
      this.parentEvent = null;
    },
    // enumerate ignitions
    enumerate: function (visit) {
      // assume this event is the only ignition
      return visit(this, 1) !== false;
    },
    // fire ignition upwards to root event if event is charged
    fire: function (ignition, fromChild) {
      var parent = this.parentEvent;
      if (parent) {
        this.parentEvent = null;
        parent.fire(fromChild ? ignition : this, this);
      } else if (fromChild) {
        // a child fired upwards to an ancestor without a parent
        this.bad();
      }
    },
    // fallible events can fail asynchronously
    isFallible: I.returnFalse,
    // prepare child event before parent can charge it
    precharge: function () {
      return this.isFallible() ? I.Tryout.create(this) : this;
    },
    // install triggered effect when ignition is not a blooper
    triggers: function (effect) {
      if (this.parentEvent) {
        this.bad();
      }
      return I._.Theater._.Showstopper.create(this, effect);
    }
  });
  I.share({
    all: function (events) {
      var n = events.length;
      if (n > 1) {
        return I.Conjunction.create(events);
      } else if (n === 1) {
        return events[0];
      } else {
        return I.countdown(0);
      }
    },
    countdown: function (count) {
      return I.Countdown.create(count || 0);
    },
    one: function (events) {
      var n = events.length;
      if (n > 1) {
        return I.Disjunction.create(events);
      } else if (n === 1) {
        return events[0];
      } else {
        return I.countdown(0);
      }
    },
    spark: function () {
      return I.$.create();
    }
  });
  I.nest({
    Composition: 'Event'.subclass(function (I) {
      // I describe an event with two or more children.
      I.have({
        // array with children of this composed event
        children: null
      });
      I.know({
        build: function (children) {
          I.$super.build.call(this);
          this.children = children;
        }
      });
    }),
    Conjunction: 'Event._.Composition'.subclass(function (I) {
      // I describe a composed event that fires when all children have fired.
      I.have({
        // array with events that already fired
        ignitions: null,
        // true if this conjunction has at least one fallible child, otherwise false
        faulty: null
      });
      I.know({
        unveil: function () {
          I.$super.unveil.call(this);
          this.faulty = this.children.some(function (child) { return child.isFallible(); });
        },
        charge: function (parent, blooper) {
          I.$super.charge.call(this, parent);
          var children = this.children, ignitions = this.ignitions = [];
          for (var i = 0, n = children.length; i < n; ++i) {
            // pass same blooper to all children
            var ignition = children[i].charge(this, blooper);
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
        discharge: function () {
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
        enumerate: function (visit) {
          return this.ignitions.enumerate(visit, 1);
        },
        fire: function (ignition, fromChild) {
          var children = this.children, ignitions = this.ignitions;
          ignitions.push(ignition);
          children[children.indexOf(fromChild)] = null;
          // this event fires, when all children fired
          if (ignitions.length === children.length) {
            I.$super.fire.call(this);
          }
        },
        isFallible: function () {
          return this.faulty;
        }
      });
    }),
    Disjunction: 'Event._.Composition'.subclass(function (I) {
      // I describe a composed event that fires when some child has fired.
      I.know({
        charge: function (parent) {
          I.$super.charge.call(this, parent);
          var children = this.children, j;
          for (var i = 0, n = children.length; i < n; ++i) {
            var child = children[i] = children[i].precharge();
            var ignition = child.charge(this);
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
        discharge: function () {
          I.$super.discharge.call(this);
          var children = this.children;
          for (var i = 0, n = children.length; i < n; ++i) {
            var child = children[i];
            children[i] = null;
            child.discharge();
          }
        },
        fire: function (ignition, fromChild) {
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
    Tryout: 'Event'.subclass(function (I) {
      // I describe an events that charges a fallible child events with a child blooper.
      I.have({
        // fallible child event
        fallible: null,
        // blooper for asynchronous failures
        blooper: null
      });
      I.know({
        build: function (child) {
          I.$super.build.call(this);
          this.fallible = child;
          this.blooper = I._.Theater._.Blooper.create();
        },
        charge: function (parent) {
          I.$super.charge.call(this, parent);
          // charge fallible child before blooper
          var ignition = this.fallible.charge(this, this.blooper) || this.blooper.charge(this);
          if (ignition) {
            return ignition;
          }
        },
        discharge: function () {
          I.$super.discharge.call(this);
          this.fallible.discharge();
          this.blooper.discharge();
          this.fallible = this.blooper = null;
        },
        fire: function (ignition, fromChild) {
          // disjunction of fallible and blooper event
          if (fromChild === this.fallible) {
            this.blooper.discharge();
          } else if (fromChild === this.blooper) {
            this.fallible.discharge();
          }
          I.$super.fire.call(this, ignition, fromChild);
        }
      });
    }),
    Countdown: 'Event'.subclass(function (I) {
      // I describe an event that fires upwards after it has been fired a number of times.
      I.have({
        count: null
      });
      I.know({
        build: function (count) {
          I.$super.build.call(this);
          this.count = count;
        },
        charge: function (parent) {
          I.$super.charge.call(this, parent);
          if (this.count <= 0) {
            // zero count fires immediately upon charging
            return this;
          }
        },
        fire: function () {
          if (--this.count <= 0) {
            // fire up when count reaches zero
            I.$super.fire.call(this);
          }
        }
      });
    })
  });
})