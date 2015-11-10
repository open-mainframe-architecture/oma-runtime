'BaseObject+Eventful'.subclass(function(I) {
  "use strict";
  I.have({
    entranceOpen: null
  });
  I.know({
    build: function(initiallyOpen) {
      I.$super.build.call(this);
      this.entranceOpen = !!initiallyOpen;
    },
    testIgnition: function() {
      return this.entranceOpen;
    },    
    enters: function() {
      return this.createEvent();
    },
    inviteEntrants: function() {
      this.fireAll();
    },
    isOpen: function() {
      return this.entranceOpen;
    },
    openEntrance: function() {
      if (!this.entranceOpen) {
        this.entranceOpen = true;
        this.inviteEntrants();
      }
    },
    shutEntrance: function() {
      this.entranceOpen = false;
    }
  });
})