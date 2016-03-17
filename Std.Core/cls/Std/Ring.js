//@ A ring is an exclusive, set-like container whose doubly-linked elements form a circle.
'SeqContainer+Growable'.subclass(function(I) {
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
      var first = this.firstLink;
      if (first) {
        ++this.modificationCount;
        this.firstLink = null;
        this.ringLength = 0;
        var link = first;
        do {
          var nextLink = link.nextInRing;
          link.prevInRing = link.nextInRing = link.linkingRing = null;
          link = nextLink;
        } while (link !== first);
      }
      return this;
    },
    //@except when index is not a link in this ring
    remove: function(ix) {
      var prevLink = ix && ix.prevInRing;
      if (!prevLink || ix.linkingRing !== this) {
        this.bad();
      }
      ++this.modificationCount;
      var nextLink = prevLink.nextInRing = ix.nextInRing;
      nextLink.prevInRing = prevLink;
      ix.prevInRing = ix.nextInRing = ix.linkingRing = null;
      --this.ringLength;
      if (this.firstLink === ix) {
        this.firstLink = this.ringLength ? nextLink : null;
      }
      return this;
    },
    //@except when index is not a link in this ring
    replace: function(it, ix) {
      if (!ix || !ix.prevInRing || ix.linkingRing !== this) {
        this.bad();
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
    //@except when index and element are not identical links
    store: function(it, ix) {
      if (!it || it !== ix) {
        this.bad();
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
    walk: function() {
      return this.walkIndices();
    },
    firstIndex: function() {
      return this.firstLink;
    },
    lastIndex: function() {
      // make sure first and last index are identical if ring is empty
      return this.firstLink && this.firstLink.prevInRing;
    },
    nextIndex: function(ix) {
      return ix.nextInRing;
    },
    add: function() {
      for (var i = 0, n = arguments.length; i < n; ++i) {
        this.store(arguments[i], arguments[i]);
      }
      return this;
    },
    //@ Rotate this ring to the left or to the right. This is destructive.
    //@param steps {integer} number of steps to rotate to the left (negative) or right (positive)
    //@return {Std.Ring} this ring
    rotate: function(steps) {
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
})