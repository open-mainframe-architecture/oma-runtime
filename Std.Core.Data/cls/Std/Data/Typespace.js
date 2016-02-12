//@ A typespace manages datatypes.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Dictionary} map type name to definition
    typeDefinitions: null,
    //@{Std.Data.Typespace._.Evaluator} evaluator for type expressions
    typeEvaluator: null,
    //@{Std.Data.Type.None} none type describes null value
    noneType: null,
    //@{Std.Data.Type.Boolean} boolean type describes true and false values
    booleanType: null,
    //@{Std.Data.Type.Integer} integer type describes integer numbers
    integerType: null,
    //@{Std.Data.Type.Number} number type describes finite numbers
    numberType: null,
    //@{Std.Data.Type.String} string type describes string values
    stringType: null,
    //@{Std.Data.Type.Wildcard} wildcard type describes any value except null
    wildcardType: null
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      this.typeDefinitions = I._.Dictionary.create();
      this.typeEvaluator = I.Evaluator.create(this);
      var AST = I._.AbstractDefinition._.AST;
      this.noneType = I._.Type._.None.create(this, AST.createNone());
      this.booleanType = I._.Type._.Boolean.create(this, AST.createBoolean());
      this.integerType = I._.Type._.Integer.create(this, AST.createInteger());
      this.numberType = I._.Type._.Number.create(this, AST.createNumber());
      this.stringType = I._.Type._.String.create(this, AST.createString());
      this.wildcardType = I._.Type._.Wildcard.create(this, AST.createWildcard());
    },
    //@ Add type definition to this typespace.
    //@param name {string} type name
    //@param source {string} source of type definition
    //@return {Std.Data.AbstractDefinition} added type definition
    defineType: function (name, source) {
      if (this.typeDefinitions.containsIndex(name)) {
        this.bad('name', name);
      }
      var definition = this.parseDefinition(source);
      this.typeDefinitions.store(definition, name);
      return definition;
    },
    //@ Evaluate type definition.
    //@param input {Std.Data.AbstractDefinition|string} type definition or source
    //@return {Std.Data.AbstractType} evaluated datatype
    evaluate: function (input) {
      return this.typeEvaluator.reduceExpression(this.express(input));
    },
    //@ Turn source input into a type expression that can be evaluated
    //@param input {Std.Data.AbstractDefinition|string} type definition or source
    //@return {Std.Data.Definition.Expression} type expression
    express: function (input) {
      return (typeof input === 'string' ? this.parseDefinition(input) : input).express();
    },
    //@ Represent data value in JSON.
    //@param value {any} data value
    //@param inferred {Std.Data.AbstractDefinition|string} inferred type definition
    //@return {any} JSON representation
    marshal: function (value, inferred) {
      var type = this.type(value) || this.bad(value);
      var expression = this.express(inferred || '*?');
      return type.marshalValue(value, expression);
    },
    //@ Parse source string to build AST of type definition.
    //@param source {string} source of type macro or expression
    //@return {Std.Data.AbstractDefinition} AST of type definition
    parseDefinition: function (source) {
      return I._.AbstractDefinition._.AST.parse(source);
    },
    //@ Type of value is none, boolean, string, number, dictionary, list or record.
    //@param value {any} JavaScript object or value
    //@return {Std.Data.AbstractType?} type of value or nothing if invalid value
    type: function (value) {
      if (value === null) {
        return this.noneType;
      } else if (value === false || value === true) {
        return this.booleanType;
      } else if (typeof value === 'string') {
        return this.stringType;
      } else if (I.isFiniteNumber(value)) {
        return this.numberType;
      } else if (I.Data.isComposedValue(value) && value.$type.typespace === this) {
        return value.$type;
      }
      // else type is undefined
    },
    //@ Construct value from JSON representation.
    //@param json {any} JSON representation
    //@param inferred {Std.Data.AbstractDefinition|string} inferred type definition
    //@return {any} data value
    unmarshal: function (json, inferred) {
      var type = this.evaluate(json && json.$ || inferred || '*?');
      var expression = this.express(inferred || '*?');
      return type.unmarshalJSON(json, expression);
    }
  });
  I.nest({
    //@ A stack-based evaluator for a typespace.
    Evaluator: 'BaseObject'.subclass(function (I) {
      I.have({
        //@{Std.Data.Typespace} typespace that owns this evaluator
        typespace: null,
        //@{Std.Dictionary} cache with evaluated types
        cache: null,
        //@{[Std.Data.Definition.Expression]} stack whose top expression is being evaluated
        stack: null,
        //@{[Std.Data.AbstractType|Rt.Closure]} array with types/callbacks, sorted on dependencies
        sorted: null,
        //@{Rt.Table} table to detect cyclic evaluation
        cyclic_: null
      });
      I.know({
        //@param typespace {Std.Data.Typespace} typespace of this evaluator
        build: function (typespace) {
          I.$super.build.call(this);
          this.typespace = typespace;
        },
        unveil: function () {
          I.$super.unveil.call(this);
          this.cache = I._.Dictionary.create();
          this.stack = [];
          this.sorted = [];
        },
        //@ Cache reduction of expression on top of stack.
        //@param depth {integer} reduction depth
        //@return {Std.Data.AbstractType} evaluated type
        cacheTopReduction: function (depth) {
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
        //@ Look up definition, i.e. a macro or expression, with given type name.
        //@param name {string} name to look up
        //@return {Std.Data.AbstractDefinition?} definition or nothing
        lookupDefinition: function (name) {
          return this.typespace.typeDefinitions.lookup(name);
        },
        //@ Push one or more expressions on the stack.
        //@param expressions {Std.Data.Definition.Expression|[Std.Data.Definition.Expression]}
        //@return nothing
        pushExpressions: function (expressions) {
          var stack = this.stack;
          if (Array.isArray(expressions)) {
            stack.push.apply(stack, expressions);
          } else {
            stack.push(expressions);
          }
        },
        //@ Reduce top expressions on stack.
        //@param depth {integer} reduction depth
        //@param expected {integer} expected number of type reductions
        //@param {Std.Data.AbstractType|[Std.Data.AbstractType]} one or more reduced types
        reduce: function (depth, expected) {
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
        //@ Reduce type expression to type.
        //@param expression {Std.Data.Definition.Expression} type expression
        //@return {Std.Data.AbstractType} reduced type
        reduceExpression: function (expression) {
          var type = this.cache.lookup(expression.unparse());
          // skip stack-based evaluation if expression has already been evaluated
          if (!type) {
            if (this.stack.length) {
              this.bad();
            }
            this.cyclic_ = I.createTable();
            // push one expression one stack
            this.stack.push(expression);
            try {
              // expect one type after reduction
              type = this.reduce(0, 1);
              if (this.stack.length || this.sorted.length) {
                this.bad();
              }
            } finally {
              this.cyclic_ = null;
              this.stack.length = this.sorted.length = 0;
            }
          }
          return type;
        },
        //@ Add callback in sorted array with dependencies.
        //@param types {[Std.Data.AbstractType]} type dependencies to sort
        //@param preliminary {Std.Data.AbstractType} preliminary type to sort
        //@param callback {Rt.Closure} called after preliminary has been evaluated
        //@return nothing
        sortCallback: function (types, preliminary, callback) {
          var dependencies = null;
          // collect preliminary types that have to be evaluated first
          types.forEach(function(type) {
            if (type.isPreliminary()) {
              dependencies = dependencies || [];
              dependencies.push(type);
            }
          });
          if (dependencies) {
            // insert callback before sorted position of preliminary type
            this.sorted.splice(this.sortPreliminary(dependencies, preliminary), 0, callback);
          } else {
            // put callback in front when there are no preliminary dependencies
            this.sorted.unshift(callback);
          }
        },
        //@ Add preliminary type after preliminary dependencies.
        //@param dependencies {[Std.Data.AbstractType]} preliminary type dependencies
        //@param preliminary {Std.Data.AbstractType} preliminary type
        //@return {integer} sorted position of preliminary type
        sortPreliminary: function (dependencies, preliminary) {
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