//@ An eventful object implements a strategy to create and to manage events.
'Trait'.subclass(function(I) {
  "use strict";
  I.have({
    //@{any} null, false or array with events
    chargedEvents: null
  });
  I.know({
    //@ Add charged event that didn't fire immediately.
    //@param event {Std.FullEvent} charged event to add
    //@return nothing
    addCharge: function(event) {
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
    //@ Create default event.
    //@return {Std.FullEvent} event from this origin
    createEvent: function() {
      return I._.FullEvent.create(this);
    },
    //@ Fire charged events.
    //@return nothing
    fireAll: function() {
      var charged = this.chargedEvents;
      this.chargedEvents = false;
      if (charged) {
        charged.forEach(function(event) { event.fire(); });
      }
    },
    //@ Get first charge, in sort order if any.
    //@return {Std.FullEvent?} first charged event or nothing
    getFirstCharge: function() {
      var charged = this.chargedEvents;
      if (charged && charged.length) {
        return charged[0];
      }
    },
    //@ Did this origin fire all charged events?
    //@return {boolean} true if all charged events have been fired, otherwise false
    hasFiredAll: function() {
      return this.chargedEvents === false;
    },
    //@ Remove charged event.
    //@param event {Std.FullEvent} event to remove
    //@param discharged {boolean} true if event was discharged, otherwise event fired
    //@return nothing
    //@exception when event is not charged by this origin
    removeCharge: function(event, discharged) {
      var charged = this.chargedEvents;
      if (charged !== false) {
        var index = charged.indexOf(event);
        if (index < 0) {
          this.bad();
        }
        charged.splice(index, 1);
      } else if (discharged) {
        // cannot discharge when all events should fire
        this.bad();
      }
    },
    //@ Find sorted position for new charged event.
    //@param events {[Std.FullEvent]} charged events
    //@param event {Std.FullEvent} new charged event to add
    //@return {integer?} one-based sort index or nothing/zero to insert new event at end
    sortCharge: I.doNothing,
    //@ Does the charged event fire immediately?
    //@param event {Std.FullEvent} charged event
    //@param blooper {Std.Theater.Blooper?} blooper if event is fallible
    //@return {boolean} true to fire immediately, otherwise false
    testIgnition: I.returnFalse
  });
})