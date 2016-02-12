//@ An event with an eventful origin.
'Event'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Eventful} origin from which this event was created
    eventfulOrigin: null
  });
  I.know({
    //@param origin {Std.Eventful} event origin
    build: function (origin) {
      I.$super.build.call(this);
      this.eventfulOrigin = origin;
    },
    charge: function (parent, blooper) {
      I.$super.charge.call(this, parent);
      // fire while charging?
      if (this.eventfulOrigin.testIgnition(this, this.isFallible() ? blooper : null)) {
        return this;
      } else {
        // add charged event to origin
        this.eventfulOrigin.addCharge(this);
      }
    },
    discharge: function () {
      I.$super.discharge.call(this);
      // remove discharged event
      this.eventfulOrigin.removeCharge(this, true);
    },
    fire: function () {
      I.$super.fire.call(this);
      // remove fired event
      this.eventfulOrigin.removeCharge(this, false);
    },
    //@ Get origin.
    //@return {Std.Eventful} event origin
    origin: function () {
      return this.eventfulOrigin;
    }
  });
})