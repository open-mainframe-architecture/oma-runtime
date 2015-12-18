'BaseObject+Indirect'.subclass(function (I) {
  "use strict";
  // I describe iterators that walk until the last step has been taken.
  I.am({
    Abstract: false
  });
  I.know({
    // get whatever this iterator currently has behind the indirection (caller ensures it has!)
    get: I.shouldNotOccur,
    // test whether this iterator has anything behind the indirection
    has: I.returnFalse,
    // advance this iterator one step further, resetting the indirection
    step: I.shouldNotOccur
  });
  I.share({
    // create iterator that converts elements of decoratee
    collect: function (decoratee, conversion) {
      return decoratee === I.Empty ? I.Empty : I.Converter.create(decoratee, conversion);
    },
    // create iterator that walks over arguments, iterator arguments are expanded one level deep
    concat: function () {
      return arguments.length ? I.flatten(I.slice(arguments).walk(), 1) : I.Empty;
    },
    // create iterator that counts up or down until the limit is reached
    count: function (from, to, incr) {
      incr = incr || 1;
      return (incr > 0 ? from > to : from < to) ? I.Empty : I.Counter.create(from, to, incr);
    },
    // create iterator that flattens iterators in decoratee until depth is reached
    flatten: function (decoratee, depth) {
      if (decoratee === I.Empty) {
        return I.Empty;
      }
      return depth === 0 ? decoratee : I.Flattener.create(decoratee, depth);
    },
    // create iterator over results of repeated computation
    generate: function (sentinel, computation) {
      return I.Generator.create(computation || sentinel, computation && sentinel);
    },
    // create iterator that computes next generation from previous generation
    inject: function (finalSentinel, firstGeneration, advance) {
      var first = advance ? firstGeneration : finalSentinel;
      var sentinel = advance && finalSentinel;
      var computation = advance || firstGeneration;
      return first === sentinel ? I.Empty : I.Injector.create(computation, first, sentinel);
    },
    // create iterator that walks over rejected elements from decoratee
    reject: function (decoratee, rejection) {
      return decoratee === I.Empty ? I.Empty : I.Filter.create(decoratee, function (it) {
        return !rejection(it);
      });
    },
    // create iterator that walks over selected elements from decoratee
    select: function (decoratee, selection) {
      // optionally convert selected elements
      return decoratee === I.Empty ? I.Empty : I.Filter.create(decoratee, selection);
    }
  });
  I.nest({
    Converter: 'Iterator._.Decorator'.subclass(function (I) {
      // I describe iterators that convert elements of another iterator.
      I.have({
        // conversion closure
        conversion: null,
        // current converted element
        converted: null
      });
      I.know({
        build: function (decoratee, conversion) {
          I.$super.build.call(this, decoratee);
          this.conversion = conversion;
          this.converted = Unassigned;
        },
        get: function () {
          if (this.converted === Unassigned) {
            var conversion = this.conversion;
            this.converted = conversion(this.decoratee.get());
          }
          return this.converted;
        },
        step: function () {
          this.converted = Unassigned;
          this.decoratee.step();
        }
      });
      var Unassigned = {};
    }),
    Counter: 'Iterator'.subclass(function (I) {
      // I describe iterators that count up or down.
      I.have({
        // current count
        count: 0,
        // limit that this counter cannot pass
        limit: 0,
        // counter increment
        increment: 0
      });
      I.know({
        build: function (from, to, increment) {
          I.$super.build.call(this);
          this.count = from;
          this.limit = to;
          this.increment = increment;
        },
        get: function () {
          return this.count;
        },
        has: function () {
          return this.increment > 0 ? this.count <= this.limit : this.count >= this.limit;
        },
        step: function () {
          this.count += this.increment;
        }
      });
    }),
    Decorator: 'Iterator'.subclass(function (I) {
      // I describe iterators that wrap another iterator.
      I.have({
        // wrapped iterator
        decoratee: null
      });
      I.know({
        build: function (decoratee) {
          I.$super.build.call(this);
          this.decoratee = decoratee;
        },
        get: function () {
          return this.decoratee.get();
        },
        has: function () {
          return this.decoratee.has();
        },
        step: function () {
          this.decoratee.step();
        }
      });
    }),
    Filter: 'Iterator._.Verifier'.subclass(function (I) {
      // I describe iterators that filter elements from another iterator.
      I.have({
        // selection closure
        selection: null,
        // true if decoratee is positioned at selected element
        selected: false
      });
      I.know({
        build: function (decoratee, selection) {
          I.$super.build.call(this, decoratee);
          this.selection = selection;
        },
        step: function () {
          I.$super.step.call(this);
          // find selected element on next access
          this.selected = false;
        },
        verifyCondition: function () {
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
    Flattener: 'Iterator._.Decorator'.subclass(function (I) {
      // I describe iterators that flatten iterators in decoratee.
      I.have({
        // maximum depth to expand flattened iterators (or null if there is no limit)
        depth: null,
        // array with expanded iterators
        stack: null,
        // current iterated element on top
        top: null
      });
      I.know({
        build: function (decoratee, depth) {
          I.$super.build.call(this, decoratee);
          this.depth = depth;
          this.stack = [decoratee];
          this.top = Unassigned;
        },
        get: function () {
          return this.top === Unassigned ? this.reposition() : this.top;
        },
        has: function () {
          if (this.top === Unassigned && this.stack.length) {
            this.reposition();
          }
          return this.decoratee.has();
        },
        step: function () {
          if (this.top === Unassigned) {
            this.reposition();
          }
          this.stack[this.stack.length - 1].step();
          this.top = Unassigned;
        },
        // expand iterators on stack until next top is found
        reposition: function () {
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
    Generator: 'Iterator'.subclass(function (I) {
      // I describe iterators that compute their elements.
      I.have({
        // closure to compute next element
        computation: null,
        // current element
        generated: null,
        // sentinel signals end of iteration
        sentinel: null
      });
      I.know({
        build: function (computation, sentinel) {
          I.$super.build.call(this);
          this.computation = computation;
          this.generated = Unassigned;
          this.sentinel = sentinel;
        },
        get: function () {
          if (this.generated === Unassigned) {
            this.step();
          }
          return this.generated;
        },
        has: function () {
          if (this.generated === Unassigned) {
            this.step();
          }
          return this.generated !== this.sentinel;
        },
        step: function () {
          var computation = this.computation;
          this.generated = computation();
        }
      });
      var Unassigned = {};
    }),
    Injector: 'Iterator'.subclass(function (I) {
      // I describe iterators that compute next element with current element.
      I.have({
        // closure to compute next element (aka generation)
        computation: null,
        // current generation
        generated: null,
        // sentinel indicates end of iteration
        sentinel: null
      });
      I.know({
        build: function (advance, first, sentinel) {
          I.$super.build.call(this);
          this.computation = advance;
          this.generated = first;
          this.sentinel = sentinel;
        },
        get: function () {
          return this.generated;
        },
        has: function () {
          return this.generated !== this.sentinel;
        },
        step: function () {
          var computation = this.computation;
          this.generated = computation(this.generated);
        }
      });
    }),
    Verifier: 'Iterator._.Decorator'.subclass(function (I) {
      // I describe iterators that verify a condition on every access.
      I.know({
        get: function () {
          this.verifyCondition();
          return this.decoratee.get();
        },
        has: function () {
          this.verifyCondition();
          return this.decoratee.has();
        },
        step: function () {
          this.verifyCondition();
          this.decoratee.step();
        },
        // verify condition on every iterator access
        verifyCondition: I.doNothing
      });
    })
  });
  I.setup(function () {
    I.share({
      // create empty iterator after Iterator class has been unveiled
      Empty: I.$.create()
    });
  });
})