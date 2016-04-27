//@ A doubly-linked ring element is contained in at most one ring.
'Trait'.subclass(I => {
  I.have({
    //@{Std.Ring} ring container
    linkingRing: null,
    //@{Std.RingLink} previous element in ring
    prevInRing: null,
    //@{Std.RingLink} next element in ring
    nextInRing: null
  });
  I.know({
    //@ Set ring of this link without adding it to the ring.
    //@param ring {Std.Ring} linking ring
    //@return nothing
    buildRingLink: function(ring) {
      this.linkingRing = ring;
    },
    //@ Get current ring of this link.
    //@return {Std.Ring?} ring container or nothing if this link is unlinked
    getLinkingRing: function() {
      return this.linkingRing;
    },
    //@ Remove this link from linking ring.
    //@return nothing
    unlinkFromRing: function() {
      if (this.prevInRing) {
        this.linkingRing.remove(this);
      }
      this.linkingRing = null;
    }
  });
})