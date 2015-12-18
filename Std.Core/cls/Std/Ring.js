'SeqContainer+Growable'.subclass(function (I) {
  // I describe exclusive, set-like containers whose doubly-linked elements form a circular ring.
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    // number of links in this ring
    ringLength: 0,
    // first link is first element in this circular ring
    firstLink: null
  });
  I.know({
    contains: function (it) {
      return this.containsIndex(it);
    },
    containsIndex: function (ix) {
      return !!ix && !!ix.prevInRing && ix.linkingRing === this;
    },
    enumerate: function (visit) {
      var link = this.firstLink;
      if (link) {
        do {
          if (visit(link, link) === false) {
            return false;
          }
          link = link.nextInRing;
        } while (link !== this.firstLink);
      }
      return true;
    },
    indexOf: function (it) {
      return this.lookup(it);
    },
    lookup: function (ix) {
      if (ix && ix.prevInRing && ix.linkingRing === this) {
        return ix;
      }
    },
    size: function () {
      return this.ringLength;
    },
    clear: function () {
      var link = this.firstLink;
      if (link) {
        ++this.modificationCount;
        do {
          var nextLink = link.nextInRing;
          link.prevInRing = link.nextInRing = null;
          link = nextLink;
        } while (link !== this.firstLink);
        this.firstLink = null;
        this.ringLength = 0;
      }
      return this;
    },
    remove: function (ix) {
      var prevLink = ix && ix.prevInRing;
      if (!prevLink || ix.linkingRing !== this) {
        this.bad(ix);
      }
      ++this.modificationCount;
      var nextLink = prevLink.nextInRing = ix.nextInRing;
      nextLink.prevInRing = prevLink;
      ix.prevInRing = ix.nextInRing = null;
      --this.ringLength;
      if (this.firstLink === ix) {
        this.firstLink = this.ringLength ? nextLink : null;
      }
      return this;
    },
    replace: function (it, ix) {
      if (!ix || !ix.prevInRing || ix.linkingRing !== this) {
        this.bad(ix);
      }
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
    store: function (it, ix) {
      if (!it || it !== ix) {
        this.bad(ix);
      }
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
    walk: function () {
      return this.walkIndices();
    },
    firstIndex: function () {
      return this.firstLink;
    },
    lastIndex: function () {
      // make sure first and last index are identical if ring is empty
      return this.firstLink && this.firstLink.prevInRing;
    },
    nextIndex: function (ix) {
      return ix.nextInRing;
    },
    add: function () {
      for (var i = 0, n = arguments.length; i < n; ++i) {
        this.store(arguments[i], arguments[i]);
      }
      return this;
    },
    // rotate ring left or right
    rotate: function (steps) {
      var n = this.ringLength;
      if (steps && n > 1 && (steps = steps % n)) {
        if (steps > n / 2) {
          steps -= n;
        } else if (-steps > n / 2) {
          steps += n;
        }
        ++this.modificationCount;
        var link = this.firstLink;
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
  I.nest({
    Link: 'Trait'.subclass(function (I) {
      // I describe doubly-linked elements that are contained in at most one ring.
      I.have({
        // ring container of this link
        linkingRing: null,
        // previous link in ring
        prevInRing: null,
        // next link in ring
        nextInRing: null
      });
      I.know({
        // initialize ring of this link without adding it to the ring 
        buildRingLink: function (ring) {
          this.linkingRing = ring;
        },
        // get current ring of this link (or most recent ring if this link has been removed)
        getLinkingRing: function () {
          return this.linkingRing;
        },
        // remove this link from current ring or leave link untouched if it's not part of a ring
        unlinkFromRing: function () {
          if (this.prevInRing) {
            this.linkingRing.remove(this);
          }
        }
      });
    })
  });
})