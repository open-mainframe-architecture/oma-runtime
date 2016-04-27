//@ An abstract parser for the type definition language.
'BaseObject+Parsable'.subclass(I => {
  "use strict";
  // nonzero token types
  const CHOICE = 1, FIELD = 2, NAME = 3, VARIABLE = 4;
  // whitespace characters
  const WHITESPACES = I.charset(' \n\r\t');
  // one-character tokens
  const SYMBOLIC = I.charset('*?|_+{:@=}<>[](,)');
  // lower- and uppercase letters
  const LOWER = I.charset('abcdefghijklmnopqrstuvwxyz');
  const UPPER = I.charset('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // digits and letters
  const ALPHANUM = I.charset('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // quoted characters in enumerated choices
  const QUOTED = I.charset('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-+_$!');
  I.know({
    parse: function(source) {
      const scanner = I.Scanner.create(source), ast = this.parseTypeDef(scanner);
      // expect empty token on end of input
      this.assert(!scanner.token);
      return ast;
    },
    //@ Create expression for addition of record types.
    //@param cascade {[Std.Data.Definition.Expression]} subexpressions of record types to add
    //@return {Std.Data.Definition.Addition} AST for addition
    createAddition: I.burdenSubclass,
    //@ Create expression for macro application.
    //@param name {string} macro name
    //@param parameters {[Std.Data.Definition.Expression]} macro parameters
    //@return {Std.Data.Definition.Application} AST for macro application
    createApplication: I.burdenSubclass,
    //@ Create expression for boolean type.
    //@return {Std.Data.Definition.Boolean} AST for boolean type
    createBoolean: I.burdenSubclass,
    //@ Create expression for dictionary type.
    //@param expression {Std.Data.Definition.Expression} expression for element type
    //@return {Std.Data.Definition.Dictionary} AST for dictionary type
    createDictionary: I.burdenSubclass,
    //@ Create expression for enumeration type.
    //@param choices {[string]} enumerated choices
    //@return {Std.Data.Definition.Enumeration} AST for enumeration type
    createEnumeration: I.burdenSubclass,
    //@ Create expression for record field.
    //@param expression {Std.Data.Definition.Expression} expression for field type
    //@param annotations_ {Std.Table} mapping from annotation name to values
    //@return {Std.Data.Definition.Record._.Field} AST for record field
    createField: I.burdenSubclass,
    //@ Create expression for integer type.
    //@return {Std.Data.Definition.Integer} AST for integer type
    createInteger: I.burdenSubclass,
    //@ Create expression for list type.
    //@param expression {Std.Data.Definition.Expression} expression for element type
    //@return {Std.Data.Definition.List} AST for list type
    createList: I.burdenSubclass,
    //@ Create macro definition.
    //@param formals {[string|Std.Data.Definition.Expression]} formal parameters and defaults
    //@param expression {Std.Data.Definition.Expression} expression for macro body
    //@return {Std.Data.Definition.Macro} AST for type macro
    createMacro: I.burdenSubclass,
    //@ Create expression for none type.
    //@return {Std.Data.Definition.None} AST for none type
    createNone: I.burdenSubclass,
    //@ Create expression for number type.
    //@return {Std.Data.Definition.Number} AST for number type
    createNumber: I.burdenSubclass,
    //@ Create expression for optional type.
    //@param mandatory {Std.Data.Definition.Expression} expression for mandatory type
    //@return {Std.Data.Definition.Optional} AST for optional type
    createOptional: I.burdenSubclass,
    //@ Create expression for record type.
    //@param fields_ {Std.Table} mapping from field name to expression
    //@return {Std.Data.Definition.Record} AST for record type
    createRecord: I.burdenSubclass,
    //@ Create expression for type reference.
    //@param name {string} type name
    //@return {Std.Data.Definition.Reference} AST for named type
    createReference: I.burdenSubclass,
    //@ Create expression for string type.
    //@return {Std.Data.Definition.String} AST for string type
    createString: I.burdenSubclass,
    //@ Create expression for union of types.
    //@param alternatives {[Std.Data.Definition.Expression]} subexpressions for type alternatives
    //@return {Std.Data.Definition.Union} AST for type union
    createUnion: I.burdenSubclass,
    //@ Create expression for type variable.
    //@param letter {string} variable name
    //@return {Std.Data.Definition.Reference} AST for type variable
    createVariable: I.burdenSubclass,
    //@ Create expression for wildcard type.
    //@return {Std.Data.Definition.Wildcard} AST for wildcard type
    createWildcard: I.burdenSubclass,
    //@ Parse rule: TypeExpr3 = NAME "(" TypeExpr {"," TypeExpr} ")"
    //@param name {string} consumed type name before left parenthesis
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Application} application AST
    parseApplication: function(name, scanner) {
      scanner.consume('(');
      const exprs = [this.parseTypeExpr(scanner)];
      while (scanner.consumed(',')) {
        exprs.push(this.parseTypeExpr(scanner));
      }
      scanner.consume(')');
      return this.createApplication(name, exprs);
    },
    //@ Parse rule: TypeExpr3 = "<" TypeExpr ">"
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Dictionary} dictionary AST
    parseDictionary: function(scanner) {
      scanner.consume('<');
      const expr = this.parseTypeExpr(scanner);
      scanner.consume('>');
      return this.createDictionary(expr);
    },
    //@ Parse rule: TypeExpr3 = CHOICE {"_" CHOICE}
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Enumeration} enumeration AST
    parseEnumeration: function(scanner) {
      const choices = [];
      do {
        const choice = scanner.text(CHOICE);
        choices.push(choice.substr(1, choice.length - 2));
      } while (scanner.consumed('_'));
      return this.createEnumeration(choices);
    },
    //@ Parse rule: FieldDescriptor = ":" TypeExpr MetaField
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Record._.Field} record field AST
    parseField: function(scanner) {
      scanner.consume(':');
      const expr = this.parseTypeExpr(scanner);
      // MetaField = {"@" FIELD "=" Annotation}
      const annotations_ = I.createTable();
      while (scanner.consumed('@')) {
        const annotationName = scanner.text(FIELD);
        this.assert(!annotations_[annotationName]);
        scanner.consume('=');
        // Annotation = CHOICE | FIELD
        this.assert(scanner.token === CHOICE || scanner.token === FIELD);
        annotations_[annotationName] = scanner.text();
      }
      return this.createField(expr, annotations_);
    },
    //@ Parse rule: TypeExpr3 = "none" | "boolean" | "integer" | "number" | "string"
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Expression} type expression
    parseKeyword: function(keyword) {
      switch (keyword) {
        case 'none': return this.createNone();
        case 'boolean': return this.createBoolean();
        case 'integer': return this.createInteger();
        case 'number': return this.createNumber();
        case 'string': return this.createString();
        default: this.assert(false);
      }
    },
    //@ Parse rule: TypeExpr3 = "[" TypeExpr "]"
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.List} list AST
    parseList: function(scanner) {
      scanner.consume('[');
      const expr = this.parseTypeExpr(scanner);
      scanner.consume(']');
      return this.createList(expr);
    },
    //@ Parse rule: TypeExpr3 = "{" [FIELD FieldDescriptor {"," FIELD FieldDescriptor}] "}"
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Record} record AST
    parseRecord: function(scanner) {
      scanner.consume('{');
      const fields_ = I.createTable();
      if (scanner.token === FIELD) {
        do {
          const name = scanner.text(FIELD);
          this.assert(!fields_[name]);
          fields_[name] = this.parseField(scanner);
        } while (scanner.consumed(','));
      }
      scanner.consume('}');
      return this.createRecord(fields_);
    },
    //@ Parse rule: TypeDef = TypeMacro | TypeExpr
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.AbstractDefinition} macro or expression AST
    parseTypeDef: function(scanner) {
      return scanner.token === '(' ? this.parseTypeMacro(scanner) : this.parseTypeExpr(scanner);
    },
    //@ Parse rule: TypeExpr = TypeExpr1 ["?"]
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Optional|Std.Data.Definition.Expression} expression AST
    parseTypeExpr: function(scanner) {
      const expr1 = this.parseTypeExpr1(scanner);
      return scanner.consumed('?') ? this.createOptional(expr1) : expr1;
    },
    //@ Parse rule: TypeExpr1 = TypeExpr2 {"|" TypeExpr2}
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Union|Std.Data.Definition.Expression} expression AST
    parseTypeExpr1: function(scanner) {
      const expr2s = [];
      do {
        expr2s.push(this.parseTypeExpr2(scanner));
      } while (scanner.consumed('|'));
      return expr2s.length === 1 ? expr2s[0] : this.createUnion(expr2s);
    },
    //@ Parse rule: TypeExpr2 = TypeExpr3 {"+" TypeExpr3}
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Addition|Std.Data.Definition.Expression} expression AST
    parseTypeExpr2: function(scanner) {
      const expr3s = [];
      do {
        expr3s.push(this.parseTypeExpr3(scanner));
      } while (scanner.consumed('+'));
      return expr3s.length === 1 ? expr3s[0] : this.createAddition(expr3s);
    },
    //@ Parse rule: TypeExpr3 = '*' | VARIABLE | NAME
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Expression} expression AST
    parseTypeExpr3: function(scanner) {
      switch (scanner.token) {
        case FIELD: return this.parseKeyword(scanner.text());
        case '{': return this.parseRecord(scanner);
        case '[': return this.parseList(scanner);
        case '<': return this.parseDictionary(scanner);
        case CHOICE: return this.parseEnumeration(scanner);
        case VARIABLE: return this.createVariable(scanner.text());
        case NAME:
          const name = scanner.text(), leftParens = scanner.token === '(';
          return leftParens ? this.parseApplication(name, scanner) : this.createReference(name);
        case '*':
          scanner.consume();
          return this.createWildcard();
        default: this.assert(false);
      }
    },
    //@ Parse rule: TypeMacro = "(" TypeArg {"," TypeArg} ")" TypeExpr
    //@param scanner {Std.Data.Definition.Syntax._.Scanner} token scanner
    //@return {Std.Data.Definition.Macro} macro AST
    parseTypeMacro: function(scanner) {
      scanner.consume('(');
      const typeArgs = [], letters = {};
      do {
        // TypeArg = VARIABLE "=" TypeExpr
        const letter = scanner.text(VARIABLE);
        this.assert(!letters[letter]);
        scanner.consume('=');
        typeArgs.push(letter, this.parseTypeExpr(scanner));
        letters[letter] = true;
      } while (scanner.consumed(','));
      scanner.consume(')');
      return this.createMacro(typeArgs, this.parseTypeExpr(scanner));
    }
  });
  I.share({
    //@ Unparse addition of record types.
    //@param cascade {[Std.Data.Definition.Expression]} record expressions
    //@return {string} normalized source of addition
    unparseAddition: function(cascade) {
      return cascade.map(expr => expr.unparse()).join('+');
    },
    //@ Unparse annotations of record field.
    //@param annotations_ {Std.Table} mapping from annotation name to value
    //@return {string} normalized source of field annotations
    unparseAnnotations: function(annotations_) {
      if (!I.hasEnumerables(annotations_)) {
        return '';
      }
      const accu = [];
      for (let name of Object.getOwnPropertyNames(annotations_).sort()) {
        accu.push(' @', name, '=', annotations_[name]);
      }
      return accu.join('');
    },
    //@ Unparse macro application.
    //@param name {string} macro name
    //@param parameters {[Std.Data.Definition.Expression]} macro parameters
    //@return {string} normalized source of macro application
    unparseApplication: function(name, parameters) {
      const accu = [name, '('];
      parameters.forEach((expr, i) => { accu.push(i ? ',' : '', expr.unparse()); });
      accu.push(')');
      return accu.join('');
    },
    //@ Unparse dictionary type.
    //@param expr {Std.Data.Definition.Expression} element type expression
    //@return {string} normalized source of dictionary type
    unparseDictionary: function(expr) {
      return `<${expr.unparse()}>`;
    },
    //@ Unparse enumeration type.
    //@param choices {[string]} enumerated choices
    //@return {string} normalized source of enumeration type
    unparseEnumeration: function(choices) {
      const distinct_ = {};
      for (let choice of choices) {
        distinct_[choice] = true;
      }
      const accu = [];
      Object.getOwnPropertyNames(distinct_).sort().forEach((choice, i) => {
        accu.push(i ? '_"' : '"', choice, '"');
      });
      return accu.join('');
    },
    //@ Unparse list type.
    //@param expr {Std.Data.Definition.Expression} element type expression
    //@return {string} normalized source of list type
    unparseList: function(expr) {
      return `[${expr.unparse()}]`;
    },
    //@ Unparse type macro.
    //@param formals {[string|Std.Data.Definition.Expression]} formal macro arguments
    //@param expr {Std.Data.Definition.Expression} macro body expression
    //@return {string} normalized source of type macro
    unparseMacro: function(formals, expr) {
      const accu = ['('], n = formals.length;
      for (let i = 0; i < n; i += 2) {
        accu.push(i ? ',' : '', formals[i], '=', formals[i + 1].unparse());
      }
      accu.push(')', expr.unparse());
      return accu.join('');
    },
    //@ Unparse optional type.
    //@param mandatory {Std.Data.Definition.Expression} mandatory type expression
    //@return {string} normalized source of optional type
    unparseOptional: function(mandatory) {
      return `${mandatory.unparse()}?`;
    },
    //@ Unparse record type.
    //@param fields_ {Std.Table} mapping from field name to definition
    //@return {string} normalized source of record type
    unparseRecord: function(fields_) {
      const accu = ['{'];
      Object.getOwnPropertyNames(fields_).sort().forEach((name, i) => {
        const field = fields_[name], typeSource = field.expression.unparse();
        const annotationsSource = I.unparseAnnotations(field.annotations_);
        accu.push(i ? ',' : '', name, ':', typeSource, annotationsSource);
      });
      accu.push('}');
      return accu.join('');
    },
    //@ Unparse union type.
    //@param alternatives {[Std.Data.Definition.Expression]} alternative expressions
    //@return {string} normalized source of union type
    unparseUnion: function(alternatives) {
      const distinct_ = {};
      for (let expr of alternatives) {
        distinct_[expr.unparse()] = true;
      }
      return Object.getOwnPropertyNames(distinct_).sort().join('|');
    }
  });
  I.nest({
    //@ A scanner for the tokens of the type definition language.
    Scanner: 'BaseObject'.subclass(I => {
      I.have({
        //@{string} source to scan
        source: null,
        //@{integer|string} nonzero number (token type) or one-character string
        token: null,
        //@{integer} first position of token in source
        start: null,
        //@{integer} first position past token in source
        stop: 0
      });
      I.know({
        //@param source {string} source text to scan for tokens
        build: function(source) {
          I.$super.build.call(this);
          this.source = source;
        },
        unveil: function() {
          I.$super.unveil.call(this);
          // consume first token
          this.consume();
        },
        //@ Consume token, unconditionally if token is undefined, and scan for next token.
        //@param token {integer|string?} if defined, either token type or one-character token
        //@return nothing
        consume: function(token) {
          // if supplied, expect token at given position
          this.assert(!token || this.token === token);
          const source = this.source, n = source.length;
          let i = this.stop, ch;
          // skip whitespaces
          for (; i < n && WHITESPACES[ch = source.charAt(i)]; ++i) { }
          // found first position of token
          this.start = i;
          if (i === n) {
            // empty token signals end of source input
            this.stop = i;
            this.token = '';
          } else if (ch === '"') {
            // quoted choice token
            for (++i; i < n && QUOTED[ch = source.charAt(i)]; ++i) { }
            this.assert(i < n, i !== this.start + 1, ch === '"');
            this.stop = i + 1;
            this.token = CHOICE;
          } else if (SYMBOLIC[ch]) {
            // one-character token
            this.stop = i + 1;
            this.token = ch;
          } else if (LOWER[ch]) {
            // field name (also matches type keywords)
            for (++i; i < n && ALPHANUM[source.charAt(i)];) { ++i; }
            this.stop = i;
            this.token = FIELD;
          } else if (UPPER[ch]) {
            if (i + 1 < n && ALPHANUM[source.charAt(i + 1)]) {
              // type name
              for (; ;) {
                for (i += 2; i < n && ALPHANUM[ch = source.charAt(i)];) { ++i; }
                if (i === n || ch !== '.') {
                  break;
                }
                ++i;
                this.assert(i + 1 < n, UPPER[source.charAt(i)], ALPHANUM[source.charAt(i + 1)]);
              }
              this.stop = i;
              this.token = NAME;
            } else {
              // type variable
              this.stop = i + 1;
              this.token = VARIABLE;
            }
          } else {
            // unmatched character in source input
            this.assert(false);
          }
        },
        //@ Test whether token is consumed by scanner.
        //@param token {integer|string} token type or one-character token
        //@return {boolean} true if token was consumed, otherwise false
        consumed: function(token) {
          if (this.token === token) {
            this.consume();
            return true;
          }
          return false;
        },
        //@ Consume token and returns its textual content.
        //@param token {integer|string} token type or one-character token
        //@return {string} textual content of consumed token
        text: function(token) {
          const textContent = this.source.substring(this.start, this.stop);
          this.consume(token);
          return textContent;
        }
      });
    })
  });
})