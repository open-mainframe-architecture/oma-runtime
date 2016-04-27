//@ A typespace manages and evaluates datatypes.
'BaseObject'.subclass(I => {
  "use strict";
  const AbstractDefinition = I._.AbstractDefinition, Dictionary = I._.Dictionary, Type = I._.Type;
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
      this.typeDefinitions = Dictionary.create();
      this.typeCache = Dictionary.create();
      const AST = AbstractDefinition._.AST;
      this.noneType = Type._.None.create(this, AST.createNone());
      this.booleanType = Type._.Boolean.create(this, AST.createBoolean());
      this.integerType = Type._.Integer.create(this, AST.createInteger());
      this.numberType = Type._.Number.create(this, AST.createNumber());
      this.stringType = Type._.String.create(this, AST.createString());
      this.wildcardType = Type._.Wildcard.create(this, AST.createWildcard());
    },
    //@ Add type definition to this typespace.
    //@param name {string} type name
    //@param source {string} source of type definition
    //@return {Std.Data.AbstractDefinition} added type definition
    defineType: function(name, source) {
      this.assert(!this.typeDefinitions.containsIndex(name));
      const definition = this.parseDefinition(source);
      this.typeDefinitions.store(definition, name);
      return definition;
    },
    //@ Evaluate type definition.
    //@param input {Std.Data.AbstractDefinition|string} type definition or source
    //@return {Std.Data.AbstractType} evaluated datatype
    evaluate: function(input) {
      const expression = this.express(input);
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
      const type = this.type(value) || this.assert(false);
      const expression = this.express(inferred || '*?');
      return type.marshalValue(value, expression);
    },
    //@ Parse source string to build AST of type definition.
    //@param source {string} source of type macro or expression
    //@return {Std.Data.AbstractDefinition} AST of type definition
    parseDefinition: function(source) {
      return AbstractDefinition._.AST.parse(source);
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
      const type = this.evaluate(json && json.$ || inferred || '*?');
      const expression = this.express(inferred || '*?');
      return type.unmarshalJSON(json, expression);
    }
  });
  I.nest({
    //@ A stack-based evaluation in a typespace.
    Evaluation: 'BaseObject'.subclass(I => {
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
          const cache = this.typespace.typeCache, stack = this.stack;
          const top = stack.length, expression = stack[top - 1], source = expression.unparse();
          const cachedType = cache.lookup(source);
          if (cachedType) {
            // nothing to do if already cached
            return cachedType;
          }
          const cyclic_ = this.cyclic_;
          // push subexpressions on stack and return initial type, possibly a preliminary one
          const initial = expression.pushEvaluation(this);
          // cache initial type if any, also reject cyclic definitions
          if (initial) {
            cache.store(initial, source);
          } else {
            // detect cyclic evaluation on third attempt that checks same source
            this.assert(!cyclic_[source]);
            cyclic_[source] = (cyclic_[source] === false);
          }
          // reduce subexpressions on stack if any
          const aboveTop = stack.length - top;
          const reductions = aboveTop && this.reduce(depth + 1, aboveTop);
          const recursive = !initial && cache.lookup(source);
          if (recursive) {
            // avoid popping recursive type more than once
            return recursive;
          }
          // pop with reductions of subexpressions
          const type = expression.popEvaluation(this, reductions, initial) || initial;
          this.assert(type, !initial || initial === type);
          // add reduction to cache
          cache.store(type, source);
          return type;
        },
        //@ Push one or more expressions on the stack.
        //@param expressions {Std.Data.Definition.Expression|[Std.Data.Definition.Expression]}
        //@return nothing
        pushExpressions: function(expressions) {
          const stack = this.stack;
          if (Array.isArray(expressions)) {
            stack.push(...expressions);
          } else {
            stack.push(expressions);
          }
        },
        //@ Reduce top expressions on stack.
        //@param depth {integer} current reduction depth
        //@param expected {integer} expected number of type reductions
        //@param {Std.Data.AbstractType|[Std.Data.AbstractType]} one or more reduced types
        reduce: function(depth, expected) {
          // assume infinite recursion after 100 nested reductions
          const stack = this.stack, sorted = this.sorted, results = [];
          this.assert(depth < 100);
          this.assert(stack.length >= expected);
          while (results.length !== expected) {
            // cache reduced top expression and copy it to expected results (in reverse order)
            results.unshift(this.cacheTopReduction(depth));
            --stack.length;
            // trigger dependency callbacks after evaluation of preliminary types
            while (sorted.length) {
              const first = sorted[0];
              if (I.isClosure(first)) {
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
          const type = this.reduce(0, 1);
          this.assert(!this.stack.length, !this.sorted.length);
          return type;
        },
        //@ Add callback in sorted array with dependencies.
        //@param types {[Std.Data.AbstractType]} type dependencies to sort
        //@param preliminary {Std.Data.AbstractType} preliminary type to sort
        //@param callback {Std.Closure} called after preliminary has been evaluated
        //@return nothing
        sortCallback: function(types, preliminary, callback) {
          let dependencies = null;
          // collect preliminary types that have to be evaluated first
          for (let type of types) {
            if (type.isPreliminary()) {
              dependencies = dependencies || [];
              dependencies.push(type);
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
        //@ Add preliminary type after preliminary dependencies.
        //@param dependencies {[Std.Data.AbstractType]} preliminary type dependencies
        //@param preliminary {Std.Data.AbstractType} preliminary type
        //@return {integer} sorted position of preliminary type
        sortPreliminary: function(dependencies, preliminary) {
          const sorted = this.sorted;
          let position = sorted.indexOf(preliminary);
          if (position < 0) {
            position = sorted.push(preliminary) - 1;
            this.assert(!I.isClosure(sorted[position - 1]));
          }
          const stack = this.stack;
          for (let dependency of dependencies) {
            const expression = dependency.typeExpression;
            this.assert(stack.indexOf(expression) >= 0);
            const index = sorted.indexOf(dependency);
            if (index < 0) {
              sorted.splice(position++, 0, dependency);
            } else if (index > position) {
              // reposition behind dependency in sorted array
              for (let j = position + 1; j < index; ++j) {
                //  cannot jump over a callback closure when dependencies are swapped
                this.assert(!I.isClosure(sorted[j]));
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