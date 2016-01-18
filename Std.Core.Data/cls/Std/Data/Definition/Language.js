'Syntax'.subclass(function (I) {
  "use strict";
  // I describe a parser for the type definition language.
  I.am({
    Abstract: false
  });
  I.have({
    // cache parsed type definitions
    definitionCache: null,
    // cache parsed field definitions
    fieldCache: null,
    // AST for none type
    noneExpression: null,
    // AST for boolean type
    booleanExpression: null,
    // AST for integer type
    integerExpression: null,
    // AST for number type
    numberExpression: null,
    // AST for string type
    stringExpression: null,
    // AST for wildcard type
    wildcardExpression: null
  });
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      this.definitionCache = I._.Std._.Dictionary.create();
      this.fieldCache = I._.Std._.Dictionary.create();
      this.noneExpression = this.cache(I._.None.create('none'));
      this.booleanExpression = this.cache(I._.Boolean.create('boolean'));
      this.integerExpression = this.cache(I._.Integer.create('integer'));
      this.numberExpression = this.cache(I._.Number.create('number'));
      this.stringExpression = this.cache(I._.String.create('string'));
      this.wildcardExpression = this.cache(I._.Wildcard.create('*'));
    },
    parse: function (source) {
      var cached = this.definitionCache.lookup(source);
      if (cached) {
        return cached;
      }
      var definition = I.$super.parse.call(this, source);
      if (definition.unparse() !== source) {
        this.definitionCache.store(definition, source);
      }
      return definition;
    },
    createAddition: function (cascade) {
      var source = I.unparseAddition(cascade);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Addition.create(source, cascade));
    },
    createApplication: function (name, parameters) {
      var source = I.unparseApplication(name, parameters);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Application.create(source, name, parameters));
    },
    createBoolean: function () {
      return this.booleanExpression;
    },
    createDictionary: function (expression) {
      var source = I.unparseDictionary(expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Dictionary.create(source, expression));
    },
    createEnumeration: function (choices) {
      var source = I.unparseEnumeration(choices);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Enumeration.create(source, choices));
    },
    createField: function (expression, annotations_) {
      var fieldSource = expression.unparse() + I.unparseAnnotations(annotations_);
      var cached = this.fieldCache.lookup(fieldSource);
      if (cached) {
        return cached;
      }
      var field = I._.Record._.Field.create(expression, annotations_);
      this.fieldCache.store(field, fieldSource);
      return field;
    },
    createInteger: function () {
      return this.integerExpression;
    },
    createList: function (expression) {
      var source = I.unparseList(expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.List.create(source, expression));
    },
    createMacro: function (formals, expression) {
      var source = I.unparseMacro(formals, expression);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Macro.create(source, formals, expression));
    },
    createNone: function () {
      return this.noneExpression;
    },
    createNumber: function () {
      return this.numberExpression;
    },
    createOptional: function (mandatory) {
      var source = I.unparseOptional(mandatory);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Optional.create(source, mandatory));
    },
    createRecord: function (fields_) {
      var source = I.unparseRecord(fields_);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Record.create(source, fields_));
    },
    createReference: function (name) {
      var cached = this.definitionCache.lookup(name);
      return cached || this.cache(I._.Reference.create(name));
    },
    createString: function () {
      return this.stringExpression;
    },
    createUnion: function (alternatives) {
      var source = I.unparseUnion(alternatives);
      var cached = this.definitionCache.lookup(source);
      return cached || this.cache(I._.Union.create(source, alternatives));
    },
    createVariable: function (letter) {
      var cached = this.definitionCache.lookup(letter);
      return cached || this.cache(I._.Variable.create(letter));
    },
    createWildcard: function () {
      return this.wildcardExpression;
    },
    // cache normalized definition
    cache: function (definition) {
      this.definitionCache.store(definition, definition.unparse());
      return definition;
    }
  });
})