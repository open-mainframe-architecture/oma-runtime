//@ A clock counts a number of seconds since a past moment.
'BaseObject+Indirect+Eventful'.subclass(I => {
  "use strict";
  I.am({
    Service: true
  });
  I.know({
    //@ Obtain current clock time.
    //@return {number} uptime of runtime system in seconds
    get: function() {
      return this.$rt.getUptime();
    },
    sortCharge: function(delays, delay) {
      const deadline = delay.deadline;
      let i = 0, j = delays.length;
      // binary search in sorted array of delays
      while (i < j) {
        const probe = Math.floor((i + j) / 2);
        if (delays[probe].deadline <= deadline) {
          i = probe + 1;
        } else {
          j = probe;
        }
      }
      // is it an insertion? otherwise append delay at end
      if (i < delays.length) {
        // convert to one-based list index where delay should be inserted
        return i + 1;
      }
    },
    testIgnition: function(moment) {
      if (moment.seconds <= 0) {
        // fire immediately when delay is zero or negative
        return true;
      }
      const deadline = moment.deadline, uptime = this.get();
      if (!deadline) {
        // set deadline based on delay and current time
        moment.deadline = uptime + moment.seconds;
      } else if (deadline <= uptime) {
        // fire immediately when deadline has already been reached
        return true;
      }
      // sort charged event based on deadline
      return false;
    },
    //@ Create event that fires after a delay in seconds.
    //@param delay {number} number of seconds to delay after charging
    //@return {Std.FullEvent} clock event from this origin
    delay: function(seconds) {
      // set deadline when clock event is charged
      return I.Moment.create(this, seconds);
    },
    //@ Create event that fires when this clock reaches some moment.
    //@param until {number} clock time when this event should fire
    //@return {Std.FullEvent} clock event from this origin
    wait: function(until) {
      // create clock event whose deadline is already set
      return I.Moment.create(this, Infinity, until || -1);
    }
  });
  I.nest({
    //@ A moment is an event that stems from a clock.
    Moment: 'FullEvent'.subclass(I => {
      I.have({
        //@{number} this moment fires after waiting for a number of seconds
        seconds: null,
        //@{number} this moment fires when deadline passes
        deadline: null
      });
      I.know({
        //@param clock {Std.Theater.Service._.Clock} theater clock
        //@param seconds {number} seconds to wait or nothing
        //@param deadline {number?} deadline when this moment fires or nothing
        build: function(clock, seconds, deadline) {
          I.$super.build.call(this, clock);
          this.seconds = seconds;
          this.deadline = deadline;
        }
      });
    })
  });
})