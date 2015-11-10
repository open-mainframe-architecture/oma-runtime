'BaseObject'.subclass(function(I) {
  "use strict";
  // I describe typespaces with data types.
  I.have({
    // dictionary to map name to a type definition
    typeDefinitions: null,
    // evaluator for type expression
    typeEvaluator: null,
    // none type describes null value
    noneType: null,
    // boolean type describes true and false value
    booleanType: null,
    // integer type describes integer numbers
    integerType: null,
    // number type describes finite numbers
    numberType: null,
    // string type describes string value
    stringType: null,
    // wildcard type describes any value except null
    wildcardType: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.typeDefinitions = I._.Dictionary.create();
      this.typeEvaluator = I.Evaluator.create(this);
      var Definitions = I._.AbstractDefinition._.Cache;
      this.noneType = I._.Type._.None.create(this, Definitions.createNone());
      this.booleanType = I._.Type._.Boolean.create(this, Definitions.createBoolean());
      this.integerType = I._.Type._.Integer.create(this, Definitions.createInteger());
      this.numberType = I._.Type._.Number.create(this, Definitions.createNumber());
      this.stringType = I._.Type._.String.create(this, Definitions.createString());
      this.wildcardType = I._.Type._.Wildcard.create(this, Definitions.createWildcard());
    },
    // add type definition to this typespace
    defineType: function(name, source) {
      if (this.typeDefinitions.containsIndex(name)) {
        this.bad('name', name);
      }
      var definition = this.parseDefinition(source);
      this.typeDefinitions.store(definition, name);
      return definition;
    },
    // evaluate (source of) type expression
    evaluate: function(input) {
      return this.typeEvaluator.reduceExpression(this.express(input));
    },
    // turn source input into a type expression that can be evaluated
    express: function(input) {
      return typeof input === 'string' ? this.parseDefinition(input).express() : input.express();
    },
    // represent data value in JSON
    marshal: function(value, inferred) {
      var type = this.type(value) || this.bad(value);
      var expression = this.express(inferred || '*?');
      return type.marshalValue(value, expression);
    },
    // parse source string to build AST of type definition
    parseDefinition: function(source) {
      return I._.AbstractDefinition._.Cache.parse(source);
    },
    // type of value is none, boolean, string, number, dictionary, list or record
    type: function(value) {
      if (value === null) {
        return this.noneType;
      } else if (value === false || value === true) {
        return this.booleanType;
      } else if (typeof value === 'string') {
        return this.stringType;
      } else if (I.isFiniteNumber(value)) {
        return this.numberType;
      } else if (I.Datatype.isComposedValue(value) && value.$type.typespace === this) {
        return value.$type;
      }
      // else type is undefined
    },
    // construct value from JSON representation
    unmarshal: function(json, inferred) {
      var type = this.evaluate(json && json.$ || inferred || '*?');
      var expression = this.express(inferred || '*?');
      return type.unmarshalJSON(json, expression);
    },
  });
  I.nest({
    Evaluator: 'BaseObject'.subclass(function(I) {
      // I describe stack-based evaluators for type expressions.
      I.have({
        // typespace that owns this evaluator
        typespace: null,
        // cache with evaluated types
        cache: null,
        // stack whose top expression is being evaluated
        stack: null,
        // array with types and callbacks, sorted on dependencies
        sorted: null,
        // table to detect cyclic evaluation
        cyclic_: null
      });
      I.know({
        build: function(typespace) {
          I.$super.build.call(this);
          this.typespace = typespace;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.cache = I._.Dictionary.create();
          this.stack = [];
          this.sorted = [];
        },
        // cache reduction of top expression
        cacheTopReduction: function(depth) {
          var cache = this.cache, stack = this.stack;
          var top = stack.length;
          var expression = stack[top - 1];
          var source = expression.unparse();
          var type = cache.lookup(source);
          if (type) {
            // nothing to do if already cached
            return type;
          }
          var cyclic_ = this.cyclic_;
          // push subexpressions on stack and return initial type, possibly a preliminary one
          var initial = expression.pushEvaluation(this);
          // cache initial type if any, also reject cyclic definitions
          if (initial) {
            cache.store(initial, source);
          } else if (cyclic_[source]) {
            this.bad('cyclic', source);
          } else {
            cyclic_[source] = (cyclic_[source] === false);
          }
          // reduce subexpressions on stack if any
          var aboveTop = stack.length - top;
          var reductions = aboveTop && this.reduce(depth + 1, aboveTop);
          var recursive = !initial && cache.lookup(source);
          if (recursive) {
            // avoid popping recursive type more than once
            return recursive;
          }
          // pop with reductions of subexpressions
          type = expression.popEvaluation(this, reductions, initial) || initial;
          if (!type || initial && initial !== type) {
            this.bad('type', source);
          }
          // add reduction to cache
          cache.store(type, source);
          return type;
        },
        // lookup definition, i.e. a macro or expression, with given type name
        lookupDefinition: function(name) {
          return this.typespace.typeDefinitions.lookup(name);
        },
        pushExpressions: function(expressions) {
          var stack = this.stack;
          if (Array.isArray(expressions)) {
            stack.push.apply(stack, expressions);
          } else {
            stack.push(expressions);
          }
        },
        reduce: function(depth, expected) {
          if (depth > 100) {
            // assume infinite recursion after 100 nested reductions
            this.bad('recursion');
          }
          var stack = this.stack, sorted = this.sorted;
          if (stack.length < expected) {
            this.bad('expectation');
          }
          var results = [];
          while (results.length !== expected) {
            // cache reduced top expression and copy it to expected results (in reverse order)
            results.unshift(this.cacheTopReduction(depth));
            --stack.length;
            // trigger dependency callbacks after evaluation of preliminary types
            while (sorted.length) {
              var first = sorted[0];
              if (typeof first === 'function') {
                first();
              } else if (first.isPreliminary()) {
                break;
              }
              sorted.shift();
            }
          }
          return expected === 1 ? results[0] : results;
        },
        reduceExpression: function(expression) {
          var type = this.cache.lookup(expression.unparse());
          // skip stack-based evaluation if expression has already been evaluated
          if (!type) {
            if (this.stack.length) {
              this.bad();
            }
            this.cyclic_ = I.createTable();
            this.stack.push(expression);
            type = this.reduce(0, 1);
            this.cyclic_ = null;
            if (this.stack.length || this.sorted.length) {
              this.bad();
            }
          }
          return type;
        },
        // add callback in sorted array with dependencies
        sortCallback: function(types, preliminary, callback) {
          var dependencies = false;
          for (var i = 0, n = types.length; i < n; ++i) {
            if (types[i].isPreliminary()) {
              dependencies = dependencies || [];
              dependencies.push(types[i]);
            }
          }
          if (dependencies) {
            // insert callback before sorted position of preliminary type
            this.sorted.splice(this.sortPreliminary(dependencies, preliminary), 0, callback);
          } else {
            // put callback in front when there are no preliminary dependencies
            this.sorted.unshift(callback);
          }
        },
        // add preliminary type after preliminary dependencies
        sortPreliminary: function(dependencies, preliminary) {
          var sorted = this.sorted;
          var position = sorted.indexOf(preliminary);
          if (position < 0) {
            position = sorted.push(preliminary) - 1;
            if (typeof sorted[position - 1] === 'function') {
              this.bad('dependency');
            }
          }
          var stack = this.stack;
          for (var i = 0, n = dependencies.length; i < n; ++i) {
            var dependency = dependencies[i];
            var expression = dependency.typeExpression;
            if (stack.indexOf(expression) < 0) {
              // circular dependency was popped earlier from the stack
              this.bad('cyclic', expression.unparse());
            }
            var index = sorted.indexOf(dependency);
            if (index < 0) {
              sorted.splice(position++, 0, dependency);
            } else if (index > position) {
              // reposition behind dependency in sorted array
              for (var j = position + 1; j < index; ++j) {
                if (typeof sorted[j] === 'function') {
                  //  cannot jump over a callback closure when dependencies are swapped
                  this.bad('cycle');
                }
              }
              sorted[index] = sorted[position];
              sorted[position] = dependency;
              position = index;
            }
          }
          // sorted position of preliminary
          return position;
        }
      });
    })
  });
})