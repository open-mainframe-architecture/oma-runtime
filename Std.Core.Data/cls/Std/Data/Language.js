//@ A parser for the type definition language.
'Syntax'.subclass(function(I) {
  "use strict";
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
      this.definitionCache = I._.Dictionary.create();
      this.fieldCache = I._.Dictionary.create();
      this.noneExpression = this.cache(I._.Definition._.None.create('none'));
      this.booleanExpression = this.cache(I._.Definition._.Boolean.create('boolean'));
      this.integerExpression = this.cache(I._.Definition._.Integer.create('integer'));
      this.numberExpression = this.cache(I._.Definition._.Number.create('number'));
      this.stringExpression = this.cache(I._.Definition._.String.create('string'));
      this.wildcardExpression = this.cache(I._.Definition._.Wildcard.create('*'));
    },
    parse: function(source) {
      var cached = this.definitionCache.lookup(source);
      if (cached) {
        // no need to parse. use parsed definition from cache
        return cached;
      }
      var definition = I.$super.parse.call(this, source);
      if (definition.unparse() !== source) {
        // cache source if it differs from normalized source, which parser has already cached
        this.definitionCache.store(definition, source);
      }
      return definition;
    },
    createAddition: function(cascade) {
      var source = I.unparseAddition(cascade);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Addition.create(source, cascade));
    },
    createApplication: function(name, parameters) {
      var source = I.unparseApplication(name, parameters);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Application.create(source, name, parameters));
    },
    createBoolean: function() {
      return this.booleanExpression;
    },
    createDictionary: function(expression) {
      var source = I.unparseDictionary(expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Dictionary.create(source, expression));
    },
    createEnumeration: function(choices) {
      var source = I.unparseEnumeration(choices);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Enumeration.create(source, choices));
    },
    createField: function(expression, annotations_) {
      var fieldSource = expression.unparse() + I.unparseAnnotations(annotations_);
      var cached = this.fieldCache.lookup(fieldSource);
      if (cached) {
        return cached;
      }
      var field = I._.Definition._.Record._.Field.create(expression, annotations_);
      this.fieldCache.store(field, fieldSource);
      return field;
    },
    createInteger: function() {
      return this.integerExpression;
    },
    createList: function(expression) {
      var source = I.unparseList(expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.List.create(source, expression));
    },
    createMacro: function(formals, expression) {
      var source = I.unparseMacro(formals, expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Macro.create(source, formals, expression));
    },
    createNone: function() {
      return this.noneExpression;
    },
    createNumber: function() {
      return this.numberExpression;
    },
    createOptional: function(mandatory) {
      var source = I.unparseOptional(mandatory);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Optional.create(source, mandatory));
    },
    createRecord: function(fields_) {
      var source = I.unparseRecord(fields_);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Record.create(source, fields_));
    },
    createReference: function(name) {
      var cached = this.definitionCache.lookup(name);
      return cached || this.cache(I._.Definition._.Reference.create(name));
    },
    createString: function() {
      return this.stringExpression;
    },
    createUnion: function(alternatives) {
      var source = I.unparseUnion(alternatives);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Definition._.Union.create(source, alternatives));
    },
    createVariable: function(letter) {
      var cached = this.definitionCache.lookup(letter);
      return cached || this.cache(I._.Definition._.Variable.create(letter));
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