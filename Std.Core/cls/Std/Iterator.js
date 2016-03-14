//@ An iterator walks until the last step has been taken.
'BaseObject+Indirect'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ Get whatever this iterator is currently iterating. Caller ensures it has something.
    //@return {any} iterated thing
    get: I.shouldNotOccur,
    //@ Test whether this iterator has anything behind the indirection.
    //@return {boolean} true if iterator can get something, otherwise false
    has: I.returnFalse,
    //@ Advance this iterator one step further, resetting the indirection.
    //@return nothing
    step: I.shouldNotOccur
  });
  I.share({
    //@ Create iterator that converts things of decoratee.
    //@param decoratee {Std.Iterator} iterator over original things
    //@param conversion {Std.Closure} called with original to produce converted thing
    //@return {Std.Iterator} an iterator over converted things
    collect: function(decoratee, conversion) {
      return decoratee === I.Empty ? I.Empty : I.Converter.create(decoratee, conversion);
    },
    //@ Create iterator that walks over arguments. Iterator arguments are expanded one level deep.
    //@param ... {any} iterated thing or iterator to expand
    //@return {Std.Iterator} an iterator over expanded arguments
    concat: function() {
      return !arguments.length ? I.Empty : I.flatten(I.slice(arguments).walk(), 1);
    },
    //@ Create iterator that counts up or down until the limit has been passed.
    //@param from {number} initial count
    //@param to {number} count limit
    //@param increment {number?} positive increment to count up (default 1), otherwise count down
    //@return {Std.Iterator} an iterator over counted numbers
    count: function(from, to, increment) {
      increment = increment || 1;
      function advance(count) { return count + increment; }
      // different conditions for counting up and down
      var condition = increment > 0 ? function(count) { return count <= to; } :
        function(count) { return count >= to; };
      return I.whilst(from, condition, advance);
    },
    //@ Create iterator that flattens iterators in decoratee until depth is reached.
    //@param decoratee {Std.Iterator} iterator over original things
    //@param depth {number} maximum expansion depth of flattened iterators
    //@return {Std.Iterator} an iterator over flattened things
    flatten: function(decoratee, depth) {
      return decoratee === I.Empty ? I.Empty :
        depth === 0 ? decoratee : I.Flattener.create(decoratee, depth);
    },
    //@ Create iterator that generates next iterated thing from previous one.
    //@param first {any} first iterated thing
    //@param advance {Std.Closure} called with iterated thing to produce next one
    //@return {Std.Iterator} an iterator over generated things while generated thing is defined
    inject: function(first, advance) {
      return I.whilst(first, I.isDefined, advance);
    },
    //@ Create iterator that walks over selected things from decoratee.
    //@param decoratee {Std.Iterator} iterator over original things
    //@param selection {Std.Closure} called with original thing
    //@return {Std.Iterator} an iterator over selected things
    select: function(decoratee, selection) {
      return decoratee === I.Empty ? I.Empty : I.Filter.create(decoratee, selection);
    },
    //@ Create iterator that generates next iterated thing from previous one.
    //@param first {any} first iterated thing
    //@param condition {Std.Closure} called with iterated thing to test condition
    //@param advance {Std.Closure} called with iterated thing to produce next one
    //@return {Std.Iterator} an iterator over generated things while condition holds
    whilst: function(first, condition, advance) {
      return !condition(first) ? I.Empty : I.Repeater.create(first, advance, condition);
    }
  });
  I.nest({
    //@ A converter converts iterated things of another iterator.
    Converter: 'Iterator._.Decorator'.subclass(function(I) {
      I.have({
        //@{Std.Closure} conversion closure
        conversion: null,
        //@{any} current converted element
        converted: null
      });
      I.know({
        //@param decoratee {Std.Iterator} iterator over original things
        //@param conversion {Std.Closure} compute converted thing from original one
        build: function(decoratee, conversion) {
          I.$super.build.call(this, decoratee);
          this.conversion = conversion;
          this.converted = Unassigned;
        },
        get: function() {
          if (this.converted === Unassigned) {
            var conversion = this.conversion;
            this.converted = conversion(this.decoratee.get());
          }
          return this.converted;
        },
        step: function() {
          this.converted = Unassigned;
          this.decoratee.step();
        }
      });
      var Unassigned = {};
    }),
    //@ A decorator wraps another iterator.
    Decorator: 'Iterator'.subclass(function(I) {
      I.have({
        //@{Std.Iterator} wrapped iterator
        decoratee: null
      });
      I.know({
        //@param decoratee {Std.Iterator} iterator over things
        build: function(decoratee) {
          I.$super.build.call(this);
          this.decoratee = decoratee;
        },
        get: function() {
          return this.decoratee.get();
        },
        has: function() {
          return this.decoratee.has();
        },
        step: function() {
          this.decoratee.step();
        }
      });
    }),
    //@ A filter selects iterated things of another iterator.
    Filter: 'Iterator._.Verifier'.subclass(function(I) {
      I.have({
        //@{Std.Closure} selection closure
        selection: null,
        //@{boolean} true if decoratee is positioned at selected element
        selected: false
      });
      I.know({
        //@param decoratee {Std.Iterator} iterator over original things
        //@param selection {Std.Closure} test whether original thing is selected
        build: function(decoratee, selection) {
          I.$super.build.call(this, decoratee);
          this.selection = selection;
        },
        step: function() {
          I.$super.step.call(this);
          // find selected element on next access
          this.selected = false;
        },
        verifyCondition: function() {
          if (!this.selected) {
            // advance decoratee until selected element is found or decoratee is exhausted
            var decoratee = this.decoratee;
            var selection = this.selection;
            while (decoratee.has() && !selection(decoratee.get())) {
              decoratee.step();
            }
            this.selected = true;
          }
        }
      });
    }),
    //@ A flattener expands iterators in decoratee.
    Flattener: 'Iterator._.Decorator'.subclass(function(I) {
      I.have({
        //@{number?} maximum depth to expand flattened iterators or null if there is no limit
        depth: null,
        //@{[Std.Iterator]} stack with expanded iterators
        stack: null,
        //@{any} current iterated thing on top
        top: null
      });
      I.know({
        //@param decoratee {Std.Iterator} iterator over original things
        //@param depth {number?} maximum expansion depth of flattened iterators
        build: function(decoratee, depth) {
          I.$super.build.call(this, decoratee);
          this.depth = depth;
          this.stack = [decoratee];
          this.top = Unassigned;
        },
        get: function() {
          return this.top === Unassigned ? this.reposition() : this.top;
        },
        has: function() {
          if (this.top === Unassigned && this.stack.length) {
            this.reposition();
          }
          return I.$super.has.call(this);
        },
        step: function() {
          if (this.top === Unassigned) {
            this.reposition();
          }
          this.stack[this.stack.length - 1].step();
          this.top = Unassigned;
        },
        //@ Expand iterators on stack until next thing on top is found.
        //@return {any} thing on top of stack
        reposition: function() {
          var n = this.stack.length;
          for (; ;) {
            var topIterator = this.stack[n - 1];
            if (topIterator.has()) {
              var topCandidate = topIterator.get();
              if (I._.Iterator.describes(topCandidate) && (!this.depth || n <= this.depth)) {
                // push new iterator below maximum depth and continue loop
                this.stack[n++] = topCandidate;
              } else {
                // found new top result
                this.top = topCandidate;
                break;
              }
            }
            else {
              if (--n) {
                // pop iterator, advance iterator below it, and continue loop
                this.stack[n - 1].step();
              } else {
                // exhausted decoratee
                this.top = Unassigned;
                break;
              }
            }
          }
          this.stack.length = n;
          return this.top;
        }
      });
      var Unassigned = {};
    }),
    //@ A repeater computes the next iterated thing from the previous one.
    Repeater: 'Iterator'.subclass(function(I) {
      I.have({
        //@{any} current generation
        generated: null,
        //@{boolean?} null to test current generation, otherwise validity of current generation
        selected: null,
        //@{Std.Closure} compute next generation from previous generation
        computation: null,
        //@{Std.Closure} repeat while test condition holds
        condition: null
      });
      I.know({
        //@param first {any} first generation passes test
        //@param advance {Std.Closure} compute sequence of generations
        //@param condition {Std.Closure} test generation validity
        build: function(first, advance, condition) {
          I.$super.build.call(this);
          this.generated = first;
          this.selected = true;
          this.computation = advance;
          this.condition = condition;
        },
        get: function() {
          return this.generated;
        },
        has: function() {
          if (this.selected === null) {
            var condition = this.condition;
            this.selected = !!condition(this.generated);
          }
          return this.selected;
        },
        step: function() {
          var computation = this.computation;
          this.generated = computation(this.generated);
          this.selected = null;
        }
      });
    }),
    //@ A verifier checks a condition on every access.
    Verifier: 'Iterator._.Decorator'.subclass(function(I) {
      I.know({
        get: function() {
          this.verifyCondition();
          return I.$super.get.call(this);
        },
        has: function() {
          this.verifyCondition();
          return I.$super.has.call(this);
        },
        step: function() {
          this.verifyCondition();
          I.$super.step.call(this);
        },
        //@ Verify condition on every iterator access.
        //@return nothing
        verifyCondition: I.doNothing
      });
    })
  });
  I.setup({
    //@{Std.Iterator} empty iterator has nothing to iterate
    Empty: function() {
      // defer creation of empty iterator until Iterator class has been unveiled
      return I.$.create();
    }
  });
})