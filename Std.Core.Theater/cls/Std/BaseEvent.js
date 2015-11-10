'Theater.Event'.subclass(function(I) {
  "use strict";
  // I describe base events with eventful origins.
  I.have({
    // origin from which this event was created
    eventfulOrigin: null
  });
  I.know({
    build: function(origin) {
      I.$super.build.call(this);
      this.eventfulOrigin = origin;
    },
    charge: function(parent) {
      I.$super.charge.call(this, parent);
      // fire while charging?
      if (this.eventfulOrigin.testIgnition(this)) {
        return this;
      } else {
        // add charged event to origin
        this.eventfulOrigin.addCharge(this);
      }
    },
    discharge: function() {
      I.$super.discharge.call(this);
      // remove discharged event
      this.eventfulOrigin.removeCharge(this, true);
    },
    fire: function() {
      I.$super.fire.call(this);
      // remove fired event
      this.eventfulOrigin.removeCharge(this, false);
    },
    origin: function() {
      return this.eventfulOrigin;
    }
  });
  I.share({
    all: function(events) {
      var n = events.length;
      if (n > 1) {
        return I.Conjunction.create(events);
      } else if (n === 1) {
        return events[0];
      }
    },
    one: function(events) {
      var n = events.length;
      if (n > 1) {
        return I.Disjunction.create(events);
      } else if (n === 1) {
        return events[0];
      }
    },
    spark: function() {
      return I._.Theater._.Event.create();
    }
  });
})