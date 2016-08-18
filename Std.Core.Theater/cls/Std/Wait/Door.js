//@ A door blocks entrants or it allows entrants to pass.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{boolean} true if entrants can pass, otherwise block entrants
    entranceOpen: null,
    //@{Std.Event.$._.CommonAgeStrategy} manage charged events
    doorStrategy: null
  });
  I.know({
    //@param initiallyOpen {boolean} true if door should be open, otherwise door is shut
    build: function(initiallyOpen) {
      I.$super.build.call(this);
      this.entranceOpen = !!initiallyOpen;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.doorStrategy = I.When.CommonAgeStrategy.create(false, () => this.entranceOpen);
    },
    //@ Create event to pass this door.
    //@return {Std.Event} entrance event
    enter: function() {
      return this.doorStrategy.createEvent();
    },
    //@ Allow any waiting entrants to pass, without opening this door.
    //@return nothing
    inviteEntrants: function() {
      this.doorStrategy.fireAll();
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