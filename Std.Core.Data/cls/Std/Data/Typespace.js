//@ A typespace manages and evaluates datatypes.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.have({
    //@{Std.Dictionary} map type name to definition
    typeDefinitions: null,
    //@{Std.Dictionary} map source of type definition to datatype
    typeCache: null,
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
    unveil: function() {
      I.$super.unveil.call(this);
      this.typeDefinitions = I._.Dictionary.create();
      this.typeCache = I._.Dictionary.create();
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
    defineType: function(name, source) {
      if (this.typeDefinitions.containsIndex(name)) {
        this.bad(name);
      }
      var definition = this.parseDefinition(source);
      this.typeDefinitions.store(definition, name);
      return definition;
    },
    //@ Evaluate type definition.
    //@param input {Std.Data.AbstractDefinition|string} type definition or source
    //@return {Std.Data.AbstractType} evaluated datatype
    evaluate: function(input) {
      var expression = this.express(input);
      // grab evaluated expression from cache
      return this.typeCache.lookup(expression.unparse()) ||
        // evalate expression for the first, and only, time
        I.Evaluation.create(this, expression).reduction();
    },
    //@ Turn source input into a type expression that can be evaluated
    //@param input {Std.Data.AbstractDefinition|string} type definition or source
    //@return {Std.Data.Definition.Expression} type expression
    express: function(input) {
      return (typeof input === 'string' ? this.parseDefinition(input) : input).express();
    },
    //@ Look up definition, i.e. a macro or expression, with given type name.
    //@param name {string} name to look up
    //@return {Std.Data.AbstractDefinition?} definition or nothing
    getDefinition: function(name) {
      return this.typeDefinitions.lookup(name);
    },
    //@ Represent data value in JSON.
    //@param value {any} data value
    //@param inferred {Std.Data.AbstractDefinition|string} inferred type definition
    //@return {any} JSON representation
    marshal: function(value, inferred) {
      var type = this.type(value) || this.bad(value);
      var expression = this.express(inferred || '*?');
      return type.marshalValue(value, expression);
    },
    //@ Parse source string to build AST of type definition.
    //@param source {string} source of type macro or expression
    //@return {Std.Data.AbstractDefinition} AST of type definition
    parseDefinition: function(source) {
      return I._.AbstractDefinition._.AST.parse(source);
    },
    //@ Type of value is none, boolean, string, number, dictionary, list or record.
    //@param value {any} JavaScript object or value
    //@return {Std.Data.AbstractType?} type of value or nothing if invalid value
    type: function(value) {
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
      // else type is not defined in this typespace
    },
    //@ Construct value from JSON representation.
    //@param json {any} JSON representation
    //@param inferred {Std.Data.AbstractDefinition|string} inferred type definition
    //@return {any} data value
    unmarshal: function(json, inferred) {
      var type = this.evaluate(json && json.$ || inferred || '*?');
      var expression = this.express(inferred || '*?');
      return type.unmarshalJSON(json, expression);
    }
  });
  I.nest({
    //@ A stack-based evaluation in a typespace.
    Evaluation: 'BaseObject'.subclass(function(I) {
      I.have({
        //@{Std.Data.Typespace} evaluate in some typespace
        typespace: null,
        //@{[Std.Data.Definition.Expression]} stack whose top expression is being evaluated
        stack: null,
        //@{[Std.Data.AbstractType|Std.Closure]} types/callbacks, sorted on dependencies
        sorted: null,
        //@{Std.Table} table to detect cyclic evaluation
        cyclic_: null
      });
      I.know({
        //@param typespace {Std.Data.Typespace} typespace of this evaluation
        //@param expression {Std.Data.Definition.Expression} type expression
        build: function(typespace, expression) {
          I.$super.build.call(this);
          this.typespace = typespace;
          this.stack = [expression];
        },
        unveil: function() {
          I.$super.unveil.call(this);
          this.sorted = [];
          this.cyclic_ = I.createTable();
        },
        //@ Cache reduction of expression on top of stack.
        //@param depth {integer} reduction depth
        //@return {Std.Data.AbstractType} evaluated type
        cacheTopReduction: function(depth) {
          var cache = this.typespace.typeCache, stack = this.stack;
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
            this.bad(source);
          } else {
            // detect cyclic evaluation on third attempt that checks same source
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
            this.bad(source);
          }
          // add reduction to cache
          cache.store(type, source);
          return type;
        },
        //@ Push one or more expressions on the stack.
        //@param expressions {Std.Data.Definition.Expression|[Std.Data.Definition.Expression]}
        //@return nothing
        pushExpressions: function(expressions) {
          var stack = this.stack;
          if (Array.isArray(expressions)) {
            stack.push.apply(stack, expressions);
          } else {
            stack.push(expressions);
          }
        },
        //@ Reduce top expressions on stack.
        //@param depth {integer} current reduction depth
        //@param expected {integer} expected number of type reductions
        //@param {Std.Data.AbstractType|[Std.Data.AbstractType]} one or more reduced types
        reduce: function(depth, expected) {
          if (depth > 100) {
            // assume infinite recursion after 100 nested reductions
            this.bad();
          }
          var stack = this.stack, sorted = this.sorted;
          if (stack.length < expected) {
            this.bad();
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
        //@ Evaluate resulting type.
        //@return {Std.Data.AbstractType} reduced type
        reduction: function() {
          var type = this.reduce(0, 1);
          if (this.stack.length || this.sorted.length) {
            this.bad();
          }
          return type;
        },
        //@ Add callback in sorted array with dependencies.
        //@param types {[Std.Data.AbstractType]} type dependencies to sort
        //@param preliminary {Std.Data.AbstractType} preliminary type to sort
        //@param callback {Std.Closure} called after preliminary has been evaluated
        //@return nothing
        sortCallback: function(types, preliminary, callback) {
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
        sortPreliminary: function(dependencies, preliminary) {
          var sorted = this.sorted;
          var position = sorted.indexOf(preliminary);
          if (position < 0) {
            position = sorted.push(preliminary) - 1;
            if (typeof sorted[position - 1] === 'function') {
              this.bad();
            }
          }
          var stack = this.stack;
          for (var i = 0, n = dependencies.length; i < n; ++i) {
            var dependency = dependencies[i];
            var expression = dependency.typeExpression;
            if (stack.indexOf(expression) < 0) {
              // circular dependency was popped earlier from the stack
              this.bad(expression.unparse());
            }
            var index = sorted.indexOf(dependency);
            if (index < 0) {
              sorted.splice(position++, 0, dependency);
            } else if (index > position) {
              // reposition behind dependency in sorted array
              for (var j = position + 1; j < index; ++j) {
                if (typeof sorted[j] === 'function') {
                  //  cannot jump over a callback closure when dependencies are swapped
                  this.bad();
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