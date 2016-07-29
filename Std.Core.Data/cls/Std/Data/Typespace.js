//@ A typespace manages and evaluates datatypes.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Table} map type name to definition
    typeDefinitions: null,
    //@{Std.Table} map source of type definition to datatype
    typeCache: null,
    //@{Std.Table} map source of field definition to descriptor
    descriptorCache: null,
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
  const Descriptor = I._.Descriptor, Difference = I._.Difference, Language = I._.Language;
  const Type = I._.Type, Value = I._.Value;
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.typeDefinitions = I.createTable();
      this.typeCache = I.createTable();
      this.descriptorCache = I.createTable();
      this.noneType = Type._.None.create(this, I.TypeDefinitionLanguage.createNone());
      this.booleanType = Type._.Boolean.create(this, I.TypeDefinitionLanguage.createBoolean());
      this.integerType = Type._.Integer.create(this, I.TypeDefinitionLanguage.createInteger());
      this.numberType = Type._.Number.create(this, I.TypeDefinitionLanguage.createNumber());
      this.stringType = Type._.String.create(this, I.TypeDefinitionLanguage.createString());
      this.wildcardType = Type._.Wildcard.create(this, I.TypeDefinitionLanguage.createWildcard());
    },
    //@ Create descriptor or obtain cached version.
    //@param expression {Std.Data.Definition.Expression} field type expression
    //@param type {Std.Data.Type.Object} field type
    //@param annotations {Std.Data.Value.Dictionary?} annotations dictionary
    //@return {Std.Data.Descriptor} field descriptor
    createDescriptor: function(expression, type, annotations) {
      const cache = this.descriptorCache;
      const id = expression.unparse() +
        (annotations ? Language._.unparseAnnotations(annotations._) : '');
      return cache[id] || (cache[id] = Descriptor.create(expression, type, annotations));
    },
    //@ Add type definition to this typespace.
    //@param name {string} type name
    //@param source {string} source of type definition
    //@return {Std.Data.Definition.Object} added type definition
    defineType: function(name, source) {
      if (this.typeDefinitions[name]) {
        I.fail(`duplicate type ${name}`);
      }
      const definition = this.parseDefinition(source);
      this.typeDefinitions[name] = definition;
      return definition;
    },
    //@ Evaluate type definition.
    //@param input {Std.Data.Definition.Object|string} type definition or source
    //@return {Std.Data.Type.Object} evaluated datatype
    evaluate: function(input) {
      const expression = this.express(input), source = expression.unparse();
      // grab expression from cache or evalate expression for the first, and only, time
      return this.typeCache[source] || I.Evaluation.create(this, expression).reduction();
    },
    //@ Turn source input into a type expression that can be evaluated
    //@param input {Std.Data.Definition.Object|string} type definition or source
    //@return {Std.Data.Definition.Expression} type expression
    express: function(input) {
      return (I.isString(input) ? this.parseDefinition(input) : input).express();
    },
    //@ Represent data value in JSON.
    //@param value {*} data value
    //@param inferred {Std.Data.Definition.Object|string} inferred type definition
    //@return {*} JSON representation
    marshal: function(value, inferred) {
      const type = this.type(value) || I.fail('bad value');
      const expression = this.express(inferred || '*?');
      return type.marshalValue(value, expression);
    },
    //@ Parse source string to build type definition.
    //@param source {string} source of type macro or expression
    //@return {Std.Data.Definition.Object} type definition
    //@except when there are parse errors
    parseDefinition: function(source) {
      return I.TypeDefinitionLanguage.parse(source);
    },
    //@ Select definition, i.e. a macro or expression, with given type name.
    //@param name {string} name to find
    //@return {Std.Data.Definition.Object?} definition or nothing
    selectDefinition: function(name) {
      return this.typeDefinitions[name];
    },
    //@ Type of value is none, boolean, string, number, dictionary, list or record.
    //@param value {*} JavaScript object or value
    //@return {Std.Data.Type.Object?} type of value or nothing if invalid value
    type: function(value) {
      if (value === null) {
        return this.noneType;
      } else if (I.isBoolean(value)) {
        return this.booleanType;
      } else if (I.isString(value)) {
        return this.stringType;
      } else if (I.isFiniteNumber(value)) {
        return this.numberType;
      } else if (I.isComposed(value) && value.$type.typespace === this) {
        return value.$type;
      }
      // else type is not defined in this typespace
    },
    //@ Construct value from JSON representation.
    //@param json {*} JSON representation
    //@param inferred {Std.Data.Definition.Object|string} inferred type definition
    //@return {*} data value
    unmarshal: function(json, inferred) {
      const type = this.evaluate(json && json.$ || inferred || '*?');
      const expression = this.express(inferred || '*?');
      return type.unmarshalJSON(json, expression);
    }
  });
  I.share({
    //@ Perform deep comparison.
    //@param lhs {*} JavaScript object or value on left-hand side
    //@param rhs {*} JavaScript object or value on right-hand side
    //@return {Std.Data.Difference} difference between left and right value
    compare: (lhs, rhs) =>
      // replace left-hand side with bottom
      !I.isValue(rhs) ? Difference._.Bottom :
        // identical values are equal values
        lhs === rhs ? Difference._.Zero :
          I.isComposed(lhs) && I.isComposed(rhs) &&
            // recursively compare values of same type and expression
            lhs.$expr === rhs.$expr && lhs.$type === rhs.$type ? lhs.$compare(rhs) :
            // replace left-hand side with right value
            Difference.create(rhs),
    //@ Test deep equality.
    //@param lhs {*} JavaScript object or value on left-hand side
    //@param rhs {*} JavaScript object or value on right-hand side
    //@return {boolean} true if left and right-hand side are equal data values, otherwise false
    equals: (lhs, rhs) =>
      lhs === rhs ? I.isValue(lhs) :
        I.isComposed(lhs) && I.isComposed(rhs) &&
        lhs.$expr === rhs.$expr && lhs.$type === rhs.$type && lhs.$equals(rhs),
    //@ Test whether it is a basic boolean, number or string value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a basic value, otherwise false
    isBasic: it => I.isBoolean(it) || I.isString(it) || I.isFiniteNumber(it),
    //@ Test whether it is a composed list, dictionary or record value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a composed value, otherwise false
    isComposed: it => Value._.Object.describes(it),
    //@ Test whether it is a dictionary value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a dictionary value, otherwise false
    isDictionary: it => Value._.Dictionary.describes(it),
    //@ Test whether it is a list value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a list value, otherwise false
    isList: it => Value._.List.describes(it),
    //@ Test whether it is a record value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a record value, otherwise false
    isRecord: it => Value._.Record.describes(it),
    //@ Test whether it is a data value.
    //@param it {*} JavaScript object or value
    //@return {boolean} true it is a data value, otherwise false
    isValue: it => it === null || I.isBasic(it) || I.isComposed(it)
  });
  I.nest({
    //@ A stack-based evaluation in a typespace.
    Evaluation: 'Object'.subclass(I => {
      I.have({
        //@{Std.Data.Typespace} evaluate in some typespace
        typespace: null,
        //@{[Std.Data.Definition.Expression]} stack whose top expression is being evaluated
        stack: null,
        //@{[Std.Data.Type.Object|function]} types and callbacks, sorted on dependencies
        sorted: null,
        //@{Std.Table} table to detect cyclic evaluation
        cyclic: null
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
          this.cyclic = I.createTable();
        },
        //@ Cache reduction of expression on top of stack.
        //@param depth {integer} reduction depth
        //@return {Std.Data.Type.Object} evaluated type
        cacheTopReduction: function(depth) {
          const cache = this.typespace.typeCache, stack = this.stack;
          const top = stack.length, expression = stack[top - 1], source = expression.unparse();
          const cachedType = cache[source];
          if (cachedType) {
            // nothing to do if already cached
            return cachedType;
          }
          const cyclic = this.cyclic;
          // push subexpressions on stack and return initial type, possibly a preliminary one
          const initial = expression.pushEvaluation(this);
          // cache initial type if any, also reject cyclic definitions
          if (initial) {
            cache[source] = initial;
          } else if (cyclic[source]) {
            // detect cyclic evaluation on third attempt that checks same source
            I.fail(`bad type ${source}`);
          } else {
            cyclic[source] = (cyclic[source] === false);
          }
          // reduce subexpressions on stack if any
          const aboveTop = stack.length - top;
          const reductions = aboveTop && this.reduce(depth + 1, aboveTop);
          const recursive = !initial && cache[source];
          if (recursive) {
            // avoid popping recursive type more than once
            return recursive;
          }
          // pop with reductions of subexpressions
          const type = expression.popEvaluation(this, reductions, initial) || initial;
          // add reduction to cache
          cache[source] = type;
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
        //@return {Std.Data.Type.Object|[Std.Data.Type.Object]} one or more reduced types
        reduce: function(depth, expected) {
          const stack = this.stack, sorted = this.sorted, results = [];
          // assume infinite recursion after 100 nested reductions
          I.failUnless('too much type recursion', depth <= 100);
          I.failUnless('bad type stack', stack.length >= expected);
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
        //@return {Std.Data.Type.Object} reduced type
        reduction: function() {
          const type = this.reduce(0, 1);
          I.failUnless('bad reduction state', !this.stack.length && !this.sorted.length);
          return type;
        },
        //@ Add callback in sorted array with dependencies.
        //@param types {[Std.Data.Type.Object]} type dependencies to sort
        //@param preliminary {Std.Data.Type.Object} preliminary type to sort
        //@param callback {function} called after preliminary has been evaluated
        //@return nothing
        sortCallback: function(types, preliminary, callback) {
          // collect preliminary types that have to be evaluated first
          const sorted = this.sorted, dependencies = types.filter(type => type.isPreliminary());
          if (dependencies.length) {
            // insert callback before sorted position of preliminary type
            let position = sorted.indexOf(preliminary);
            if (position < 0) {
              position = sorted.push(preliminary) - 1;
            }
            dependencies.forEach(dependency => {
              const index = sorted.indexOf(dependency);
              if (index < 0) {
                sorted.splice(position++, 0, dependency);
              } else if (index > position) {
                // reposition behind dependency in sorted array
                sorted[index] = sorted[position];
                sorted[position] = dependency;
                position = index;
              }
            });
            sorted.splice(position, 0, callback);
          } else {
            // put callback in front when there are no preliminary dependencies
            sorted.unshift(callback);
          }
        }
      });
    })
  });
  I.setup({
    //@{Std.Data.Language} parser for the type definition language
    TypeDefinitionLanguage: () => I._.Language.create()
  });
})