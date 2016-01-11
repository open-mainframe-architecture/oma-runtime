'Trait'.subclass(function (I) {
  "use strict";
  // I describe an eventful object that implements a strategy to create and to manage events.
  I.have({
    // null, false or array with events
    chargedEvents: null
  });
  I.know({
    addCharge: function (event) {
      // lazy initialization of array, because an eventful object might never charge an event
      var charged = this.chargedEvents || (this.chargedEvents = []);
      // find one-based sort index
      var listIndex = this.sortCharge(charged, event);
      if (listIndex) {
        // insert charged event at appropriate location
        charged.splice(listIndex - 1, 0, event);
      } else {
        // otherwise a charged event is added at the end
        charged.push(event);
      }
    },
    createEvent: function () {
      return I._.FullEvent.create(this);
    },
    // fire charged events
    fireAll: function () {
      var charged = this.chargedEvents;
      this.chargedEvents = false;
      if (charged) {
        charged.forEach(function (event) { event.fire(); });
      }
    },
    getFirstCharge: function () {
      var charged = this.chargedEvents;
      if (charged && charged.length) {
        return charged[0];
      }
    },
    hasFiredAll: function () {
      return this.chargedEvents === false;
    },
    removeCharge: function (event, discharged) {
      var charged = this.chargedEvents;
      if (charged !== false) {
        var index = charged.indexOf(event);
        if (index < 0) {
          this.bad('event');
        }
        charged.splice(index, 1);
      } else if (discharged) {
        // cannot discharge when all events should fire
        this.bad('discharge');
      }
    },
    sortCharge: I.doNothing,
    testIgnition: I.returnFalse
  });
})