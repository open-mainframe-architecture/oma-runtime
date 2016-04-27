//@ A ring is an exclusive, set-like container whose doubly-linked elements form a circle.
'SeqContainer+Growable'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{integer} number of links in this ring
    ringLength: 0,
    //@{Std.RingLink} first element in this circular ring
    firstLink: null
  });
  I.know({
    contains: function(it) {
      return this.containsIndex(it);
    },
    containsIndex: function(ix) {
      return !!ix && !!ix.prevInRing && ix.linkingRing === this;
    },
    enumerate: function(visit) {
      const first = this.firstLink;
      let link = first;
      if (link) {
        do {
          if (visit(link, link) === false) {
            return false;
          }
          link = link.nextInRing;
        } while (link !== first);
      }
      return true;
    },
    indexOf: function(it) {
      return this.lookup(it);
    },
    lookup: function(ix) {
      if (ix && ix.prevInRing && ix.linkingRing === this) {
        return ix;
      }
    },
    size: function() {
      return this.ringLength;
    },
    clear: function() {
      const first = this.firstLink;
      if (first) {
        ++this.modificationCount;
        this.firstLink = null;
        this.ringLength = 0;
        let link = first;
        do {
          const nextLink = link.nextInRing;
          link.prevInRing = link.nextInRing = link.linkingRing = null;
          link = nextLink;
        } while (link !== first);
      }
      return this;
    },
    //@except when index is not a link in this ring
    remove: function(ix) {
      this.assert(ix)
        .assert(ix.prevInRing, ix.linkingRing === this);
      ++this.modificationCount;
      const next = ix.prevInRing.nextInRing = ix.nextInRing;
      ix.nextInRing.prevInRing = ix.prevInRing;
      ix.prevInRing = ix.nextInRing = ix.linkingRing = null;
      --this.ringLength;
      if (this.firstLink === ix) {
        this.firstLink = this.ringLength ? next : null;
      }
      return this;
    },
    //@except when index is not a link in this ring
    replace: function(it, ix) {
      this.assert(ix)
        .assert(ix.prevInRing, ix.linkingRing === this);
      if (it !== ix) {
        ++this.modificationCount;
        it.unlinkFromRing();
        it.linkingRing = this;
        if (this.ringLength === 1) {
          this.firstLink = it.prevInRing = it.nextInRing = it;
        } else {
          it.nextInRing = ix.nextInRing;
          it.prevInRing = ix.prevInRing;
          it.nextInRing.prevInRing = it.prevInRing.nextInRing = it;
          if (this.firstLink === ix) {
            this.firstLink = it;
          }
        }
        ix.prevInRing = ix.nextInRing = null;
      }
      return this;
    },
    //@except when index and element are not identical links
    store: function(it, ix) {
      this.assert(it, it === ix);
      if (!it.prevInRing || it.linkingRing !== this) {
        ++this.modificationCount;
        it.unlinkFromRing();
        it.linkingRing = this;
        ++this.ringLength;
        if (this.ringLength === 1) {
          this.firstLink = it.prevInRing = it.nextInRing = it;
        } else {
          it.nextInRing = this.firstLink;
          it.prevInRing = this.firstLink.prevInRing;
          this.firstLink.prevInRing = it.prevInRing.nextInRing = it;
        }
      }
      return this;
    },
    walk: function() {
      return this.walkIndices();
    },
    firstIndex: function(sentinel) {
      return this.firstLink || sentinel;
    },
    nextIndex: function(ix, sentinel) {
      this.assert(ix.prevInRing, ix.linkingRing === this);
      return ix.nextInRing === this.firstLink ? sentinel : ix.nextInRing;
    },
    add: function() {
      const n = arguments.length;
      for (let i = 0; i < n; ++i) {
        this.store(arguments[i], arguments[i]);
      }
      return this;
    },
    //@ Rotate this ring to the left or to the right. This is destructive.
    //@param steps {integer} number of steps to rotate to the left (negative) or right (positive)
    //@return {Std.Ring} this ring
    rotate: function(steps) {
      const n = this.ringLength;
      if (steps && n > 1 && (steps = steps % n)) {
        if (steps > n / 2) {
          steps -= n;
        } else if (-steps > n / 2) {
          steps += n;
        }
        ++this.modificationCount;
        let link = this.firstLink;
        if (steps > 0) {
          do {
            link = link.nextInRing;
          } while (--steps);
        } else {
          do {
            link = link.prevInRing;
          } while (++steps);
        }
        this.firstLink = link;
      }
      return this;
    }
  });
})