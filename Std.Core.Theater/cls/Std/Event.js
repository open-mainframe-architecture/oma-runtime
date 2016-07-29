//@ An event is a theater cue that delegates to a strategy object.
'Theater.Cue'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Event.$._.Strategy} strategy of this event
    eventStrategy: null
  });
  I.know({
    //@param strategy {Std.Event.$._.Strategy} event strategy
    build: function(strategy) {
      I.$super.build.call(this);
      this.eventStrategy = strategy;
    },
    charge: function(parent, blooper) {
      I.$super.charge.call(this, parent, blooper);
      const strategy = this.eventStrategy;
      if (strategy.testIgnition(this, blooper)) {
        // this event fired upon charging
        return this;
      } else {
        // add charged event
        strategy.addCharge(this);
      }
    },
    discharge: function() {
      I.$super.discharge.call(this);
      // delete discharged event
      this.eventStrategy.deleteCharge(this, true);
    },
    fire: function() {
      I.$super.fire.call(this);
      // delete fired event
      this.eventStrategy.deleteCharge(this, false);
    },
    isFallible: function() {
      return this.eventStrategy.testFallibility(this);
    }
  });
  I.nest({
    //@ A strategy creates, charges, collects, discharges and tests events.
    Strategy: 'Object'.subclass(I => {
      const Event = I._.Event;
      I.know({
        //@ Add charged event that didn't fire immediately.
        //@param event {Std.Event} charged event to add
        //@return nothing
        addCharge: I.shouldNotOccur,
        //@ Create default event.
        //@return {Std.Event} new event
        createEvent: function() {
          return Event.create(this);
        },
        //@ Delete charged event.
        //@param event {Std.Event} event to delete
        //@param discharged {boolean} true if event was discharged, otherwise event fired
        //@return nothing
        deleteCharge: I.shouldNotOccur,
        //@ Can the event fail asynchronously? A fallible event needs a blooper when charging.
        //@param event {Std.Event} event of this strategy
        //@return {boolean} true if event can fail asynchronously, otherwise false
        testFallibility: I.returnFalse,
        //@ Does the charged event fire immediately? Default strategy fires immediately.
        //@param event {Std.Event} charged event
        //@param blooper {Std.Theater.Blooper?} blooper for fallible event
        //@return {boolean} true to fire immediately, otherwise false
        testIgnition: I.returnTrue
      });
    }),
    //@ A strategy that collects charged events and fires them from oldest to youngest.
    CollectStrategy: 'Event.$._.Strategy'.subclass(I => {
      I.have({
        //@{Set[Std.Event]|boolean?} set with charged events or false if all events fired
        chargedEvents: null
      });
      I.know({
        addCharge: function(event) {
          const charged = this.chargedEvents || (this.chargedEvents = new Set());
          charged.add(event);
        },
        deleteCharge: function(event, discharged) {
          const charged = this.chargedEvents;
          if (charged !== false) {
            I.failUnless('discharge without charge', charged && charged.delete(event));
          } else {
            I.failUnless('discharge after all fired', !discharged);
          }
        },
        //@ Collect all charged events. They never ignite immediately.
        testIgnition: I.returnFalse,
        //@ Fire charged events, from oldest to youngest.
        //@return nothing
        fireAll: function() {
          const charged = this.chargedEvents;
          this.chargedEvents = false;
          if (charged) {
            charged.forEach(event => event.fire());
          }
        },
        //@ Try to fire oldest charged event.
        //@return {boolean} true if oldest event was fired, otherwise false
        fireOldest: function() {
          const charged = this.chargedEvents;
          if (charged && charged.size) {
            charged.values().next().value.fire();
            return true;
          }
          return false;
        }
      });
    }),
    //@ A common strategy collects events and delegates fallibility and ignition test to closures.
    CommonStrategy: 'Event.$._.CollectStrategy'.subclass(I => {
      I.have({
        //@{function} closure that tests fallibility of event
        fallibilityTest: null,
        //@{function} closure that tests ignition of event and blooper
        ignitionTest: null
      });
      I.know({
        //@param fallibilityTest {boolean|function} boolean or closure to test fallibility
        //@param ignitionTest {boolean|function} boolean or closure to test ignition
        build: function(fallibilityTest, ignitionTest) {
          I.$super.build.call(this);
          this.fallibilityTest = I.isClosure(fallibilityTest) ? fallibilityTest :
            fallibilityTest ? I.returnTrue : I.returnFalse;
          this.ignitionTest = I.isClosure(ignitionTest) ? ignitionTest :
            ignitionTest ? I.returnTrue : I.returnFalse;
        },
        testFallibility: function(event) {
          const test = this.fallibilityTest;
          return test(event);
        },
        testIgnition: function(event, blooper) {
          const test = this.ignitionTest;
          return test(event, blooper);
        }
      });
    })
  });
})