//@ An iterator iterates over values until it's done.
'Object'.subclass(I => {
  "use strict";
  I.know({
    //@ Standard iterator is iterable.
    //@unique Symbol.iterator
    //@return {iterator} this iterator
    [Symbol.iterator]: I.returnThis,
    //@ Concatenate this iterator with supplied values and iterators.
    //@param ... {*|iterator} thing or iterator to concatenate
    //@return {Std.Iterator} new iterator that iterates over concatenation
    concat: function() {
      return I.Flat.create([this, ...arguments][Symbol.iterator](), 1);
    },
    //@ Filter values from this iterator.
    //@param predicate {function} predicate test
    //@param thisReceiver {*} this receiver in code
    //@return {Std.Iterator} new iterator that iterates over filtered values
    filter: function(predicate, thisReceiver) {
      return I.Filter.create(this, predicate, thisReceiver);
    },
    //@ Flatten iterators from this iterator.
    //@param depth {integer?} maximum depth to expand, negative or missing for limitless expansion
    flatten: function(depth) {
      return I.Flat.create(this, arguments.length ? depth : -1);
    },
    //@ Perform routine on every enumerated value.
    //@param routine {function} routine to perform on enumerated value
    //@param thisReceiver {*} this receiver in code
    //@return nothing
    forEach: function(routine, thisReceiver) {
      return I.forEach(this, routine, thisReceiver);
    },
    //@ Map values from this iterator.
    //@param conversion {function} value conversion
    //@param thisReceiver {*} this receiver in code
    //@return {Std.Iterator} new iterator that iterates over converted values
    map: function(conversion, thisReceiver) {
      return I.Map.create(this, conversion, thisReceiver);
    },
    //@ Iterate to next value.
    //@return {object} object with done and value property
    next: I.returnWith(Object.freeze({ done: true })),
    //@ Iterate over values and reduce it to one value.
    //@param reduction {function} reduce previous and current value to next value
    //@param initial {*} initial previous value
    //@param thisReceiver {*} this receiver in code
    //@return {*} reduced value after all iterated values have been reduced
    reduce: function(reduction, initial, thisReceiver) {
      return I.reduce(this, reduction, initial, thisReceiver);
    }
  });
  I.share({
    //@ Create iterator that iterates over arguments.
    //@param ... {*|iterator} iterated thing or iterator to expand
    //@return {Std.Iterator} an iterator over expanded values
    concat: function() {
      // clone arguments and flatten this clone one level deep
      return I.Flat.create([...arguments][Symbol.iterator](), 1);
    },
    //@ Filter values from iterator.
    //@param iterator {iterator} JavaScript iterator
    //@param predicate {function} predicate test
    //@param thisReceiver {*} this receiver in code
    //@return {Std.Iterator} new iterator that iterates over filtered values
    filter: (iterator, predicate, thisReceiver) =>
      I.Filter.create(iterator, predicate, thisReceiver),
    //@ Flatten iterator over iterators.
    //@param iterator {iterator} JavaScript iterator
    //@param depth {integer?} maximum expansion level of iterated iterator
    //@return {Std.Iterator} a flat iterator
    flatten: (iterator, depth) =>
      I.Flat.create(iterator, I.isDefined(depth) ? depth : -1),
    //@ Perform routine on enumerated values.
    //@param iterator {iterator} JavaScript iterator
    //@param routine {function} routine to perform on enumerated value
    //@param thisReceiver {*} this receiver in code
    //@return nothing
    forEach: (iterator, routine, thisReceiver) => {
      for (let iteration = iterator.next(); !iteration.done; iteration = iterator.next()) {
        routine.call(thisReceiver, iteration.value);
      }
    },
    //@ Map values from iterator.
    //@param iterator {iterator} JavaScript iterator
    //@param predicate {function} value conversion
    //@param thisReceiver {*} this receiver in code
    //@return {Std.Iterator} new iterator that iterates over converted values
    map: (iterator, conversion, thisReceiver) =>
      I.Map.create(iterator, conversion, thisReceiver),
    //@ Create iterator over arguments, without iterator expansion.
    //@param ... {*} iterated value
    //@return {Std.Iterator} new iterator over arguments
    over: function() {
      return I.Flat.create([...arguments][Symbol.iterator](), 0);
    },
    //@ Reduce iterated values to one value.
    //@param iterator {iterator} JavaScript iterator
    //@param reduction {function} reduce previous and current value to next value
    //@param initial {*} initial previous value
    //@param thisReceiver {*} this receiver in code
    //@return {*} reduced value after all iterated values have been reduced
    reduce: (iterator, reduction, initial, thisReceiver) => {
      let accumulator = initial;
      for (let iteration = iterator.next(); !iteration.done; iteration = iterator.next()) {
        accumulator = reduction.call(thisReceiver, accumulator, iteration.value);
      }
      return accumulator;
    }
  });
  I.nest({
    //@ A filter iterates over values that satisfy a predicate.
    Filter: 'Iterator'.subclass(I => {
      I.have({
        //@{iterator} JavaScript iterator
        iterator: null,
        //@{function} predicate test
        predicate: null,
        //@{*} this receiver in predicate test
        receiver: null
      });
      I.know({
        //@param iterator {iterator} JavaScript iterator
        //@param predicate {function} predicate test
        //@param receiver {*} this receiver in predicate test
        build: function(iterator, predicate, receiver) {
          I.$super.build.call(this);
          this.iterator = iterator;
          this.predicate = predicate;
          this.receiver = receiver;
        },
        next: function() {
          const iterator = this.iterator, predicate = this.predicate, receiver = this.receiver;
          let iteration = iterator.next();
          while (!iteration.done) {
            if (predicate.call(receiver, iteration.value)) {
              return iteration;
            } else {
              iteration = iterator.next();
            }
          }
          return iteration;
        }
      });
    }),
    //@ A flat iterator expands nested iterated iterators.
    Flat: 'Iterator'.subclass(I => {
      I.have({
        //@{number?} maximum depth to expand iterators or negative if there is no limit
        depth: null,
        //@{[iterator]} stack with expanded iterators
        stack: null
      });
      I.know({
        //@param iterator {iterator} iterator over original things
        //@param depth {integer} maximum expansion depth of flattened iterators or negative
        build: function(iterator, depth) {
          I.$super.build.call(this);
          this.depth = depth;
          this.stack = [iterator];
        },
        next: function() {
          const stack = this.stack, depth = this.depth;
          for (; ;) {
            const topIteration = stack[stack.length - 1].next();
            if (!topIteration.done) {
              const topValue = topIteration.value;
              if ((depth < 0 || stack.length <= depth) && I.isIteratorLike(topValue)) {
                // push new top iterator and continue loop
                stack.push(topValue);
              } else {
                return topIteration;
              }
            } else if (stack.length > 1) {
              // pop exhausted top iterator and continue loop with iterator below
              stack.pop();
            } else {
              // leave exhausted iterator on stack, with nothing below
              return topIteration;
            }
          }
        }
      });
    }),
    //@ A map iterates over converted values.
    Map: 'Iterator'.subclass(I => {
      I.have({
        //@{iterator} JavaScript iterator
        iterator: null,
        //@{function} value conversion
        conversion: null,
        //@{*} this receiver in value conversion
        receiver: null
      });
      I.know({
        //@param iterator {iterator} JavaScript iterator
        //@param conversion {function} value conversion
        //@param receiver {*} this receiver in value conversion
        build: function(iterator, conversion, receiver) {
          I.$super.build.call(this);
          this.iterator = iterator;
          this.conversion = conversion;
          this.receiver = receiver;
        },
        next: function() {
          const iteration = this.iterator.next();
          if (!iteration.done) {
            return { value: this.conversion.call(this.receiver, iteration.value), done: false };
          }
          return iteration;
        }
      });
    })
  });
  I.setup({
    //@{Std.Iterator} empty iterator has nothing to iterate
    Empty: () => I.$.create()
  });
})