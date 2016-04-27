//@ An eventful object implements a strategy to create and to manage events.
'Trait'.subclass(I => {
  "use strict";
  const FullEvent = I._.FullEvent;
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
      const charged = this.chargedEvents || (this.chargedEvents = []);
      // find one-based sort index
      const listIndex = this.sortCharge(charged, event);
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
      return FullEvent.create(this);
    },
    //@ Fire charged events.
    //@return nothing
    fireAll: function() {
      const charged = this.chargedEvents;
      this.chargedEvents = false;
      if (charged) {
        for (let event of charged) {
          event.fire();
        }
      }
    },
    //@ Get first charge, in sort order if any.
    //@return {Std.FullEvent?} first charged event or nothing
    getFirstCharge: function() {
      const charged = this.chargedEvents;
      if (charged && charged.length) {
        return charged[0];
      }
    },
    //@ Remove charged event.
    //@param event {Std.FullEvent} event to remove
    //@param discharged {boolean} true if event was discharged, otherwise event fired
    //@return nothing
    //@exception when event is not charged by this origin
    removeCharge: function(event, discharged) {
      const charged = this.chargedEvents;
      if (charged !== false) {
        const index = charged.indexOf(event);
        this.assert(index >= 0);
        charged.splice(index, 1);
      } else {
        // cannot discharge when all events should fire
        this.assert(!discharged);
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