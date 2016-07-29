'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Table} cache parsed type definitions
    definitionCache: null,
    //@{Std.Table} cache parsed field definitions
    fieldCache: null,
    //@{Std.Data.Definition.None} none type expression
    noneExpression: null,
    //@{Std.Data.Definition.Boolean} boolean type expression
    booleanExpression: null,
    //@{Std.Data.Definition.Integer} integer type expression
    integerExpression: null,
    //@{Std.Data.Definition.Number} number type expression
    numberExpression: null,
    //@{Std.Data.Definition.String} string type expression
    stringExpression: null,
    //@{Std.Data.Definition.Wildcard} wildcard type expression
    wildcardExpression: null
  });
  const Definition = I._.Definition;
  // unique symbols for token types
  const Token = {
    Choice: Symbol('choice'),
    Name: Symbol('name'),
    Selector: Symbol('selector'),
    Symbol: Symbol('symbol'),
    Variable: Symbol('variable')
  };
  // lexical analysis chops source string into tokens
  const LexicalAnalysis = I._.Tokenizer.create({
    '[,=?|+*_:@()[\\]<>{\\}]': createTokenFactory(Token.Symbol),
    '[A-Z][0-9A-Za-z]+(?:\\.[A-Z][0-9A-Za-z]+)*': createTokenFactory(Token.Name),
    '[a-z][0-9A-Za-z]*': createTokenFactory(Token.Selector),
    '"[0-9A-Za-z.\\-+_$!]+"': createTokenFactory(Token.Choice),
    '[A-Z]': createTokenFactory(Token.Variable)
  });
  I.know({
    unveil: function() {
      I.$super.unveil.call(this);
      this.definitionCache = I.createTable();
      this.fieldCache = I.createTable();
      this.noneExpression = this.cache(Definition._.None.create('none'));
      this.booleanExpression = this.cache(Definition._.Boolean.create('boolean'));
      this.integerExpression = this.cache(Definition._.Integer.create('integer'));
      this.numberExpression = this.cache(Definition._.Number.create('number'));
      this.stringExpression = this.cache(Definition._.String.create('string'));
      this.wildcardExpression = this.cache(Definition._.Wildcard.create('*'));
    },
    //@ Cache type definition under its unparsed source.
    //@param definition {Std.Data.Definition.Object} type definiton to cache
    //@return {Std.Data.Definition.Object} cached definition
    cache: function(definition) {
      this.definitionCache[definition.unparse()] = definition;
      return definition;
    },
    //@ Create expression for addition of record types.
    //@param cascade {[Std.Data.Definition.Expression]} subexpressions of record types to add
    //@return {Std.Data.Definition.Addition} expression for type addition
    createAddition: function(cascade) {
      const source = I.unparseAddition(cascade);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Addition.create(source, cascade));
    },
    //@ Create expression for macro application.
    //@param name {string} macro name
    //@param parameters {[Std.Data.Definition.Expression]} macro parameters
    //@return {Std.Data.Definition.Application} expression for macro application
    createApplication: function(name, parameters) {
      const source = I.unparseApplication(name, parameters);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Application.create(source, name, parameters));
    },
    //@ Create expression for boolean type.
    //@return {Std.Data.Definition.Boolean} expression for boolean type
    createBoolean: function() {
      return this.booleanExpression;
    },
    //@ Create expression for dictionary type.
    //@param expression {Std.Data.Definition.Expression} expression for element type
    //@return {Std.Data.Definition.Dictionary} expression for dictionary type
    createDictionary: function(expression) {
      const source = I.unparseDictionary(expression);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Dictionary.create(source, expression));
    },
    //@ Create expression for enumeration type.
    //@param choices {Set[string]} enumerated choices
    //@return {Std.Data.Definition.Enumeration} expression for enumeration type
    createEnumeration: function(choices) {
      const source = I.unparseEnumeration(choices);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Enumeration.create(source, choices));
    },
    //@ Create expression for record field.
    //@param expression {Std.Data.Definition.Expression} expression for field type
    //@param annotations {Std.Table} mapping from annotation name to values
    //@return {Std.Data.Definition.Record.$._.Field} expression for annotated record field
    createField: function(expression, annotations) {
      const fieldSource = expression.unparse() + I.unparseAnnotations(annotations);
      const cached = this.fieldCache[fieldSource];
      if (cached) {
        return cached;
      }
      const field = Definition._.Record._.Field.create(expression, annotations);
      this.fieldCache[fieldSource] = field;
      return field;
    },
    //@ Create expression for integer type.
    //@return {Std.Data.Definition.Integer} expression for integer type
    createInteger: function() {
      return this.integerExpression;
    },
    //@ Create expression for list type.
    //@param expression {Std.Data.Definition.Expression} expression for element type
    //@return {Std.Data.Definition.List} expression for list type
    createList: function(expression) {
      const source = I.unparseList(expression);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.List.create(source, expression));
    },
    //@ Create macro definition.
    //@param formals {[string|Std.Data.Definition.Expression]} formal parameters and defaults
    //@param expression {Std.Data.Definition.Expression} expression for macro body
    //@return {Std.Data.Definition.Macro} definition of type macro
    createMacro: function(formals, expression) {
      const source = I.unparseMacro(formals, expression);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Macro.create(source, formals, expression));
    },
    //@ Create expression for none type.
    //@return {Std.Data.Definition.None} expression for none type
    createNone: function() {
      return this.noneExpression;
    },
    //@ Create expression for number type.
    //@return {Std.Data.Definition.Number} expression for number type
    createNumber: function() {
      return this.numberExpression;
    },
    //@ Create expression for optional type.
    //@param mandatory {Std.Data.Definition.Expression} expression for mandatory type
    //@return {Std.Data.Definition.Optional} expression for optional type
    createOptional: function(mandatory) {
      const source = I.unparseOptional(mandatory);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Optional.create(source, mandatory));
    },
    //@ Create expression for record type.
    //@param fields {Std.Table} mapping from field name to expression
    //@return {Std.Data.Definition.Record} expression for record type
    createRecord: function(fields) {
      const source = I.unparseRecord(fields);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Record.create(source, fields));
    },
    //@ Create expression for type reference.
    //@param name {string} type name
    //@return {Std.Data.Definition.Reference} expression for named type
    createReference: function(name) {
      const cached = this.definitionCache[name];
      return cached || this.cache(Definition._.Reference.create(name));
    },
    //@ Create expression for string type.
    //@return {Std.Data.Definition.String} expression for string type
    createString: function() {
      return this.stringExpression;
    },
    //@ Create expression for union of types.
    //@param alternatives {[Std.Data.Definition.Expression]} subexpressions for type alternatives
    //@return {Std.Data.Definition.Union} expression for type union
    createUnion: function(alternatives) {
      const source = I.unparseUnion(alternatives);
      const cached = this.definitionCache[source];
      return cached || this.cache(Definition._.Union.create(source, alternatives));
    },
    //@ Create expression for type variable.
    //@param letter {string} variable name
    //@return {Std.Data.Definition.Reference} expression for type variable
    createVariable: function(letter) {
      const cached = this.definitionCache[letter];
      return cached || this.cache(Definition._.Variable.create(letter));
    },
    //@ Create expression for wildcard type.
    //@return {Std.Data.Definition.Wildcard} expression for wildcard type
    createWildcard: function() {
      return this.wildcardExpression;
    },
    //@ Parse source of a type definition.
    //@param source {string} source text
    //@return {Std.Definition.Object} type definition
    //@except when there are parse errors
    parse: function(source) {
      const cached = this.definitionCache[source];
      if (cached) {
        // use parsed definition from cache
        return cached;
      }
      const definition = this.parseTypeDef(I.Scanner.create(source));
      if (definition.unparse() !== source) {
        // cache source if it differs from unparsed source, which is already cached
        this.definitionCache[source] = definition;
      }
      return definition;
    },
    //@ Parse rule: TypeExpr3 = NAME "(" TypeExpr {"," TypeExpr} ")"
    //@param name {string} consumed type name before left parenthesis
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Application} application expression
    parseApplication: function(name, scanner) {
      scanner.consume('(');
      const expressions = [this.parseTypeExpr(scanner)];
      while (scanner.consumed(',')) {
        expressions.push(this.parseTypeExpr(scanner));
      }
      scanner.consume(')');
      return this.createApplication(name, expressions);
    },
    //@ Parse rule: TypeExpr3 = "<" TypeExpr ">"
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Dictionary} dictionary expression
    parseDictionary: function(scanner) {
      scanner.consume('<');
      const expression = this.parseTypeExpr(scanner);
      scanner.consume('>');
      return this.createDictionary(expression);
    },
    //@ Parse rule: TypeExpr3 = CHOICE {"_" CHOICE}
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Enumeration} enumeration expression
    parseEnumeration: function(scanner) {
      const choices = new Set();
      do {
        const choice = scanner.text(Token.Choice);
        choices.add(choice.substr(1, choice.length - 2));
      } while (scanner.consumed('_'));
      return this.createEnumeration(choices);
    },
    //@ Parse rule: FieldDescriptor = ":" TypeExpr MetaField
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Record.$._.Field} record field expression
    parseField: function(scanner) {
      scanner.consume(':');
      const expr = this.parseTypeExpr(scanner);
      // MetaField = {"@" SELECTOR "=" Annotation}
      const annotations = I.createTable();
      while (scanner.consumed('@')) {
        const annotationName = scanner.text(Token.Selector);
        if (annotations[annotationName]) {
          scanner.error(`duplicate annotation ${annotationName}`);
        }
        scanner.consume('=');
        // Annotation = CHOICE | SELECTOR
        if (!scanner.peek(Token.Choice) && !scanner.peek(Token.Selector)) {
          scanner.error('expected choice or selector');
        }
        annotations[annotationName] = scanner.text();
      }
      return this.createField(expr, annotations);
    },
    //@ Parse rule: TypeExpr3 = "none" | "boolean" | "integer" | "number" | "string"
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@param keyword {string} keyword text
    //@return {Std.Data.Definition.Expression} type expression
    parseKeyword: function(scanner) {
      const keyword = scanner.text();
      switch (keyword) {
        case 'none': return this.createNone();
        case 'boolean': return this.createBoolean();
        case 'integer': return this.createInteger();
        case 'number': return this.createNumber();
        case 'string': return this.createString();
        default: scanner.error(`bad keyword ${keyword}`);
      }
    },
    //@ Parse rule: TypeExpr3 = "[" TypeExpr "]"
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.List} list expression
    parseList: function(scanner) {
      scanner.consume('[');
      const expression = this.parseTypeExpr(scanner);
      scanner.consume(']');
      return this.createList(expression);
    },
    //@ Parse rule: TypeExpr3 = "{" [SELECTOR FieldDescriptor {"," SELECTOR FieldDescriptor}] "}"
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Record} record expression
    parseRecord: function(scanner) {
      scanner.consume('{');
      const fields = I.createTable();
      if (scanner.peek(Token.Selector)) {
        do {
          const name = scanner.text(Token.Selector);
          if (fields[name]) {
            scanner.error(`duplicate field ${name}`);
          }
          fields[name] = this.parseField(scanner);
        } while (scanner.consumed(','));
      }
      scanner.consume('}');
      return this.createRecord(fields);
    },
    //@ Parse rule: TypeDef = TypeMacro | TypeExpr
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Object} type macro or expression
    parseTypeDef: function(scanner) {
      return scanner.peek('(') ? this.parseTypeMacro(scanner) : this.parseTypeExpr(scanner);
    },
    //@ Parse rule: TypeExpr = TypeExpr1 ["?"]
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Optional|Std.Data.Definition.Expression} type expression
    parseTypeExpr: function(scanner) {
      const expression1 = this.parseTypeExpr1(scanner);
      return scanner.consumed('?') ? this.createOptional(expression1) : expression1;
    },
    //@ Parse rule: TypeExpr1 = TypeExpr2 {"|" TypeExpr2}
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Union|Std.Data.Definition.Expression} type expression
    parseTypeExpr1: function(scanner) {
      const expressions2 = [];
      do {
        expressions2.push(this.parseTypeExpr2(scanner));
      } while (scanner.consumed('|'));
      return expressions2.length === 1 ? expressions2[0] : this.createUnion(expressions2);
    },
    //@ Parse rule: TypeExpr2 = TypeExpr3 {"+" TypeExpr3}
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Addition|Std.Data.Definition.Expression} type expression
    parseTypeExpr2: function(scanner) {
      const expressions3 = [];
      do {
        expressions3.push(this.parseTypeExpr3(scanner));
      } while (scanner.consumed('+'));
      return expressions3.length === 1 ? expressions3[0] : this.createAddition(expressions3);
    },
    //@ Parse rule: TypeExpr3 = '*' | VARIABLE | NAME
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Expression} type expression
    parseTypeExpr3: function(scanner) {
      if (scanner.peek(Token.Selector)) {
        return this.parseKeyword(scanner);
      } else if (scanner.peek(Token.Name)) {
        const name = scanner.text(), leftParens = scanner.peek('(');
        return leftParens ? this.parseApplication(name, scanner) : this.createReference(name);
      } else if (scanner.peek('[')) {
        return this.parseList(scanner);
      } else if (scanner.peek('{')) {
        return this.parseRecord(scanner);
      } else if (scanner.peek('<')) {
        return this.parseDictionary(scanner);
      } else if (scanner.peek(Token.Choice)) {
        return this.parseEnumeration(scanner);
      } else if (scanner.peek(Token.Variable)) {
        return this.createVariable(scanner.text());
      } else if (scanner.consumed('*')) {
        return this.createWildcard();
      } else {
        scanner.error('invalid expression');
      }
    },
    //@ Parse rule: TypeMacro = "(" TypeArg {"," TypeArg} ")" TypeExpr
    //@param scanner {Std.Data.Language.$._.Scanner} token scanner
    //@return {Std.Data.Definition.Macro} type macro
    parseTypeMacro: function(scanner) {
      scanner.consume('(');
      const typeArgs = [], letters = new Set();
      do {
        // TypeArg = VARIABLE "=" TypeExpr
        const letter = scanner.text(Token.Variable);
        if (letters.has(letter)) {
          scanner.error(`duplicate variable ${letter}`);
        }
        letters.add(letter);
        scanner.consume('=');
        typeArgs.push(letter, this.parseTypeExpr(scanner));
      } while (scanner.consumed(','));
      scanner.consume(')');
      return this.createMacro(typeArgs, this.parseTypeExpr(scanner));
    }
  });
  I.share({
    //@ Unparse addition of record types.
    //@param cascade {[Std.Data.Definition.Expression]} record expressions
    //@return {string} normalized source of addition
    unparseAddition: cascade => cascade.map(expression => expression.unparse()).join('+'),
    //@ Unparse annotations of record field.
    //@param annotations {Std.Table} mapping from annotation name to value
    //@return {string} normalized source of field annotations
    unparseAnnotations: annotations => {
      const accu = [];
      Object.keys(annotations).sort().forEach(name => {
        accu.push(' @', name, '=', annotations[name]);
      });
      return accu.join('');
    },
    //@ Unparse macro application.
    //@param name {string} macro name
    //@param parameters {[Std.Data.Definition.Expression]} macro parameters
    //@return {string} normalized source of macro application
    unparseApplication: (name, parameters) => {
      const accu = [name, '('];
      parameters.forEach((expr, i) => { accu.push(i ? ',' : '', expr.unparse()); });
      accu.push(')');
      return accu.join('');
    },
    //@ Unparse dictionary type.
    //@param expression {Std.Data.Definition.Expression} element type expression
    //@return {string} normalized source of dictionary type
    unparseDictionary: expression => `<${expression.unparse()}>`,
    //@ Unparse enumeration type.
    //@param choices {Set[string]} enumerated choices
    //@return {string} normalized source of enumeration type
    unparseEnumeration: choices => {
      const accu = [];
      [...choices].sort().forEach((choice, i) => {
        accu.push(i ? '_"' : '"', choice, '"');
      });
      return accu.join('');
    },
    //@ Unparse list type.
    //@param expression {Std.Data.Definition.Expression} element type expression
    //@return {string} normalized source of list type
    unparseList: expression => `[${expression.unparse()}]`,
    //@ Unparse type macro.
    //@param formals {[string|Std.Data.Definition.Expression]} formal macro arguments
    //@param expression {Std.Data.Definition.Expression} macro body expression
    //@return {string} normalized source of type macro
    unparseMacro: (formals, expression) => {
      const accu = ['('], n = formals.length;
      for (let i = 0; i < n; i += 2) {
        accu.push(i ? ',' : '', formals[i], '=', formals[i + 1].unparse());
      }
      accu.push(')', expression.unparse());
      return accu.join('');
    },
    //@ Unparse optional type.
    //@param mandatory {Std.Data.Definition.Expression} mandatory type expression
    //@return {string} normalized source of optional type
    unparseOptional: mandatory => `${mandatory.unparse()}?`,
    //@ Unparse record type.
    //@param fields {Std.Table} mapping from field name to definition
    //@return {string} normalized source of record type
    unparseRecord: fields => {
      const accu = ['{'];
      Object.keys(fields).sort().forEach((name, i) => {
        const field = fields[name], typeSource = field.expression.unparse();
        const annotationsSource = I.unparseAnnotations(field.annotations);
        accu.push(i ? ',' : '', name, ':', typeSource, annotationsSource);
      });
      accu.push('}');
      return accu.join('');
    },
    //@ Unparse union type.
    //@param alternatives {[Std.Data.Definition.Expression]} alternative expressions
    //@return {string} normalized source of union type
    unparseUnion: alternatives =>
      [...new Set(alternatives.map(expression => expression.unparse()))].sort().join('|')
  });
  I.nest({
    //@ A scanner for tokens of the type definition language.
    Scanner: 'Object'.subclass(I => {
      I.have({
        //@{string} source text
        source: null,
        //@{iterator} token iterator
        tokens: null,
        //@{object} current token with type, start, stop and text property
        token: null
      });
      I.know({
        //@param s {string} source string to scan
        build: function(s) {
          I.$super.build.call(this);
          this.source = s;
          this.tokens = LexicalAnalysis.iterate(s);
        },
        unveil: function() {
          I.$super.unveil.call(this);
          // consume first token
          this.consume();
        },
        //@ Consume token, unconditionally if nothing is expected, and scan for next token.
        //@param expected {symbol|string?} if defined, either token type or token text
        //@return nothing
        consume: function(expected) {
          if (expected && !this.peek(expected)) {
            this.error(`expected ${expected}`);
          }
          const iteration = this.tokens.next();
          this.token = iteration.done ? null : iteration.value;
        },
        //@ Test whether token is consumed by scanner.
        //@param expected {symbol|string} token type or token text
        //@return {boolean} true if token was consumed, otherwise false
        consumed: function(expected) {
          if (this.peek(expected)) {
            this.consume();
            return true;
          }
          return false;
        },
        //@ Report error message at current scanner position.
        //@param message {string} error message
        //@return never
        error: function(message) {
          const token = this.token;
          I.fail(`${message} ${token ? `at offset ${token.start} ` : ''} in "${this.source}"`);
        },
        //@ Test whether token matches expected pattern.
        //@param expected {symbol|string} token type or token text
        //@return {boolean} true if token was consumed, otherwise false
        peek: function(expected) {
          const token = this.token;
          return !!token && (token.type === expected || token.text === expected);
        },
        //@ Consume token and returns its text.
        //@param expected {symbol|string?} if defined, either token type or token text
        //@return {string} text of consumed token
        text: function(expected) {
          const s = this.token.text;
          this.consume(expected);
          return s;
        }
      });
    })
  });
  // create factory for simple token objects
  function createTokenFactory(type) {
    return (s, start, stop) => ({
      type: type, start: start, stop: stop, text: s.substring(start, stop)
    });
  }
})