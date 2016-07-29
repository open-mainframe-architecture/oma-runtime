//@ A status is an exclusive, set-like container whose doubly-linked members form a ring.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{string} descriptive status name
    statusName: null,
    //@{Std.Status.$._.Link?} first member link of this status
    firstLink: null,
    //@{integer} number of members in this status
    memberCount: 0
  });
  I.access({
    //@{string} get status name
    name: function() {
      return this.statusName;
    },
    //@{integer} get number of members in this status
    size: function() {
      return this.memberCount;
    }
  });
  I.know({
    [Symbol.iterator]: function* () {
      const first = this.firstLink;
      if (first) {
        let link, next = first;
        do {
          link = next;
          next = link.next;
          yield link.member;
        } while (next !== first);
      }
      return;
    },
    //@param name {string?} descriptive status name
    build: function(name) {
      I.$super.build.call(this);
      this.statusName = name || '<anonymous>';
    },
    //@ Put member in this status.
    //@param member {object} status member
    //@return {Std.Status} this status
    add: function(member) {
      const link = member[I.Symbol]();
      if (link.next) {
        const old = link.status;
        if (this === old) {
          // member is already in this status
          return this;
        }
        if (--old.memberCount === 0) {
          // old status is empty
          old.firstLink = null;
        } else {
          const previous = link.previous, next = link.next;
          previous.next = next;
          next.previous = previous;
          if (old.firstLink === link) {
            // removed first link from old status
            old.firstLink = next;
          }
        }
      }
      // add member link to this status
      link.status = this;
      if (++this.memberCount === 1) {
        // first and only link in this status
        this.firstLink = link.previous = link.next = link;
      } else {
        // add last link to this status
        const first = this.firstLink, previous = first.previous;
        link.previous = previous;
        link.next = first;
        first.previous = previous.next = link;
      }
      return this;
    },
    //@ Delete all members from this status.
    //@return nothing
    clear: function() {
      const first = this.firstLink;
      if (first) {
        this.firstLink = null;
        this.memberCount = 0;
        let link, next = first;
        do {
          link = next;
          next = link.next;
          link.status = link.previous = link.next = null;
        } while (next !== first);
      }
    },
    //@ Create link for a future member of this status.
    //@param member {object} status member
    //@return {Std.Status.$._.Link} member link
    createLink: function(member) {
      return I.Link.create(this, member);
    },
    //@ Remove member from this status.
    //@param member {*} candidate status member
    //@return {boolean} true if member was removed, otherwise false
    delete: function(member) {
      const link = member && member[I.Symbol] && member[I.Symbol]();
      const next = link && link.next;
      if (next && link.status === this) {
        if (--this.memberCount === 0) {
          // removed last link from this status
          this.firstLink = link.status = link.previous = link.next = null;
        } else {
          const previous = link.previous;
          next.previous = previous;
          previous.next = next;
          link.status = link.previous = link.next = null;
          if (this.firstLink === link) {
            // removed first link from this status
            this.firstLink = next;
          }
        }
        return true;
      }
      return false;
    },
    //@ Iterate over member pairs in this status.
    //@return {iterable} iterable over pairs with two identical members
    entries: function () {
      return I.Loop.map(this.values(), member => [member, member]);
    },
    //@ Perform routine on enumerated members.
    //@param routine {function} routine to perform on enumerated member
    //@param thisReceiver {*} this receiver in code
    //@return nothing
    forEach: function(routine, thisReceiver) {
      const first = this.firstLink;
      if (first) {
        let link, next = first;
        do {
          link = next;
          next = link.next;
          routine.call(thisReceiver, link.member, link.member, this);
        } while (next !== first);
      }
    },
    //@ Test whether member is in this status.
    //@param member {*} candidate status member
    //@return {boolean} true if member is in this status, otherwise false
    has: function(member) {
      const link = member && member[I.Symbol] && member[I.Symbol]();
      return !!link && !!link.next && link.status === this;
    },
    //@ Iterate over members in this status.
    //@return {iterable} iterable members
    values: function () {
      return this[Symbol.iterator]();
    }
  });
  I.share({
    //@{symbol} unique symbol for member method that obtains status link
    Symbol: Symbol('status link')
  });
  I.nest({
    //@ A link between a member and its status.
    Link: 'Object'.subclass(I => {
      I.am({
        Final: true
      });
      I.have({
        //@{Std.Status} status of this link
        status: null,
        //@{object} member of this link
        member: null,
        //@{Std.Status.$._.Link?} next link of status or nothing if not contained
        next: null,
        //@{Std.Status.$._.Link?} previous link of status or nothing if not contained
        previous: null
      });
      I.know({
        //@param status {Std.Status} status of this link
        //@param member {object} member of this link
        build: function(status, member) {
          I.$super.build.call(this);
          this.status = status;
          this.member = member;
        }
      });
    })
  });
})