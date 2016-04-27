//@ A parser for the type definition language.
'Syntax'.subclass(I => {
  "use strict";
  const Definition = I._.Definition, Dictionary = I._.Dictionary;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Dictionary} cache parsed type definitions
    definitionCache: null,
    //@{Std.Dictionary} cache parsed field definitions
    fieldCache: null,
    //@{Std.Data.Definition.None} AST for none type
    noneExpression: null,
    //@{Std.Data.Definition.Boolean} AST for boolean type
    booleanExpression: null,
    //@{Std.Data.Definition.Integer} AST for integer type
    integerExpression: null,
    //@{Std.Data.Definition.Number} AST for number type
    numberExpression: null,
    //@{Std.Data.Definition.String} AST for string type
    stringExpression: null,
    //@{Std.Data.Definition.Wildcard} AST for wildcard type
    wildcardExpression: null
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.definitionCache = Dictionary.create();
      this.fieldCache = Dictionary.create();
      this.noneExpression = this.cache(Definition._.None.create('none'));
      this.booleanExpression = this.cache(Definition._.Boolean.create('boolean'));
      this.integerExpression = this.cache(Definition._.Integer.create('integer'));
      this.numberExpression = this.cache(Definition._.Number.create('number'));
      this.stringExpression = this.cache(Definition._.String.create('string'));
      this.wildcardExpression = this.cache(Definition._.Wildcard.create('*'));
    },
    parse: function(source) {
      const cached = this.definitionCache.lookup(source);
      if (cached) {
        // no need to parse. use parsed definition from cache
        return cached;
      }
      const definition = I.$super.parse.call(this, source);
      if (definition.unparse() !== source) {
        // cache source if it differs from normalized source, which is already cached
        this.definitionCache.store(definition, source);
      }
      return definition;
    },
    createAddition: function(cascade) {
      const source = I.unparseAddition(cascade);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Addition.create(source, cascade));
    },
    createApplication: function(name, parameters) {
      const source = I.unparseApplication(name, parameters);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Application.create(source, name, parameters));
    },
    createBoolean: function() {
      return this.booleanExpression;
    },
    createDictionary: function(expression) {
      const source = I.unparseDictionary(expression);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Dictionary.create(source, expression));
    },
    createEnumeration: function(choices) {
      const source = I.unparseEnumeration(choices);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Enumeration.create(source, choices));
    },
    createField: function(expression, annotations_) {
      const fieldSource = expression.unparse() + I.unparseAnnotations(annotations_);
      const cached = this.fieldCache.lookup(fieldSource);
      if (cached) {
        return cached;
      }
      const field = Definition._.Record._.Field.create(expression, annotations_);
      this.fieldCache.store(field, fieldSource);
      return field;
    },
    createInteger: function() {
      return this.integerExpression;
    },
    createList: function(expression) {
      const source = I.unparseList(expression);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.List.create(source, expression));
    },
    createMacro: function(formals, expression) {
      const source = I.unparseMacro(formals, expression);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Macro.create(source, formals, expression));
    },
    createNone: function() {
      return this.noneExpression;
    },
    createNumber: function() {
      return this.numberExpression;
    },
    createOptional: function(mandatory) {
      const source = I.unparseOptional(mandatory);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Optional.create(source, mandatory));
    },
    createRecord: function(fields_) {
      const source = I.unparseRecord(fields_);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Record.create(source, fields_));
    },
    createReference: function(name) {
      const cached = this.definitionCache.lookup(name);
      return cached || this.cache(Definition._.Reference.create(name));
    },
    createString: function() {
      return this.stringExpression;
    },
    createUnion: function(alternatives) {
      const source = I.unparseUnion(alternatives);
      const cached = this.definitionCache.lookup(source);
      return cached || this.cache(Definition._.Union.create(source, alternatives));
    },
    createVariable: function(letter) {
      const cached = this.definitionCache.lookup(letter);
      return cached || this.cache(Definition._.Variable.create(letter));
    },
    createWildcard: function() {
      return this.wildcardExpression;
    },
    //@ Cache type definition under its normalized source.
    //@param definition {Std.Data.AbstractDefinition} type definiton to cache
    //@return {Std.Data.AbstractDefinition} cached definition
    cache: function(definition) {
      this.definitionCache.store(definition, definition.unparse());
      return definition;
    }
  });
})