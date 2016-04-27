//@ A door blocks entrants or it allows entrants to pass.
'BaseObject+Eventful'.subclass(I => {
  "use strict";
  I.have({
    //@{boolean} true if entrants can pass, otherwise block entrants
    entranceOpen: null
  });
  I.know({
    //@param initiallyOpen {boolean} true if door should be open, otherwise door is shut
    build: function(initiallyOpen) {
      I.$super.build.call(this);
      this.entranceOpen = !!initiallyOpen;
    },
    testIgnition: function() {
      return this.entranceOpen;
    },
    //@ Create event to pass this door.
    //@return {Std.FullEvent} entrance event
    enter: function() {
      return this.createEvent();
    },
    //@ Allow any waiting entrants to pass, without opening this door.
    //@return nothing
    inviteEntrants: function() {
      this.fireAll();
    },
    //@ Is the door open for entrants?
    //@return {boolean} true if open, otherwise this door is shut
    isOpen: function() {
      return this.entranceOpen;
    },
    //@ Open this door for entrants to pass.
    //@return nothing
    openEntrance: function() {
      if (!this.entranceOpen) {
        this.entranceOpen = true;
        this.inviteEntrants();
      }
    },
    //@ Shut this door for entrants. Any future entrants have to wait until it opens.
    //@return nothing
    shutEntrance: function() {
      this.entranceOpen = false;
    }
  });
})