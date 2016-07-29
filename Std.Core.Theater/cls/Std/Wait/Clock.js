//@ A clock creates events that fire after some time has passed.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Event.$._.Strategy} strategy sorts clock events on moments when they should fire
    clockStrategy: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.clockStrategy = I.Strategy.create();
    },
    //@ Fire clock events whose deadline passed.
    //@return {number} current uptime
    fireNow: function() {
      const sortedMoments = this.clockStrategy.sortedMoments, now = this.$rt.uptime();
      for (let firstMoment; (firstMoment = sortedMoments[0]) && firstMoment.deadline <= now;) {
        // fire first moment, removing it from the sorted array
        firstMoment.fire();
      }
      return now;
    },
    //@ Get uptime of first clock event to fire.
    //@return {number?} uptime of moment, if any
    firstDeadline: function() {
      const firstMoment = this.clockStrategy.sortedMoments[0];
      if (firstMoment) {
        return firstMoment.deadline;
      }
    },
    //@ Create event that fires after a delay in seconds.
    //@param delay {number} number of seconds to delay after charging
    //@return {Std.Event} clock event
    delay: function(seconds) {
      // set deadline when clock event is charged
      return I.Moment.create(this.clockStrategy, seconds);
    },
    //@ Create event that fires when this clock reaches some moment.
    //@param until {number} clock time when this event should fire
    //@return {Std.Event} clock event
    wait: function(until) {
      // create clock event whose deadline is already set
      return I.Moment.create(this.clockStrategy, Infinity, until || -1);
    }
  });
  I.nest({
    //@ A moment is a clock event.
    Moment: 'Event'.subclass(I => {
      I.have({
        //@{number} this moment fires after waiting for a number of seconds
        seconds: null,
        //@{number} this moment fires when deadline passes
        deadline: null
      });
      I.know({
        //@param strategy {Std.Wait.Clock.$._.Strategy} clock strategy
        //@param seconds {number} seconds to wait or nothing
        //@param deadline {number?} deadline when this moment fires or nothing
        build: function(strategy, seconds, deadline) {
          I.$super.build.call(this, strategy);
          this.seconds = seconds;
          this.deadline = deadline;
        }
      });
    }),
    //@ A clock strategy sorts events on time.
    Strategy: 'Event.$._.Strategy'.subclass(I => {
      I.have({
        //@{[Std.Wait.Clock.$._.Moment]} sorted array with clock events
        sortedMoments: null
      });
      I.know({
        unveil: function() {
          I.$super.unveil.call(this);
          this.sortedMoments = [];
        },
        addCharge: function(moment) {
          const deadline = moment.deadline, sortedMoments = this.sortedMoments;
          let i = 0, j = sortedMoments.length;
          // binary search in sorted array
          while (i < j) {
            const probe = Math.floor((i + j) / 2);
            if (sortedMoments[probe].deadline <= deadline) {
              i = probe + 1;
            } else {
              j = probe;
            }
          }
          // insert moment at sorted position
          sortedMoments.splice(i, 0, moment);
        },
        deleteCharge: function(moment) {
          // use linear search to find moment object in array
          const sortedMoments = this.sortedMoments, index = sortedMoments.indexOf(moment);
          I.failUnless('discharge moment without charge', index >= 0);
          sortedMoments.splice(index, 1);
        },
        testIgnition: function(moment) {
          if (moment.seconds <= 0) {
            // fire immediately when delay is zero or negative
            return true;
          }
          const deadline = moment.deadline, now = this.$rt.uptime();
          if (!deadline) {
            // set deadline based on delay and current time
            moment.deadline = now + moment.seconds;
          } else if (deadline <= now) {
            // fire immediately when deadline has already been reached
            return true;
          }
          // sort charged event based on deadline
          return false;
        }
      });
    })
  });
})