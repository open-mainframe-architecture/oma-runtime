'BaseObject+Parsable'.subclass(function (I) {
  "use strict";
  // I describe an abstract parser for the type definition language.
  I.know({
    parse: function (source) {
      var scanner = I.Scanner.create(source);
      var ast = this.parseTypeDef(scanner);
      if (scanner.token) {
        this.bad('syntax');
      }
      return ast;
    },
    // parse syntax, but leave ast creation to concrete subclass
    createAddition: I.burdenSubclass,
    createApplication: I.burdenSubclass,
    createBoolean: I.burdenSubclass,
    createDictionary: I.burdenSubclass,
    createEnumeration: I.burdenSubclass,
    createField: I.burdenSubclass,
    createInteger: I.burdenSubclass,
    createList: I.burdenSubclass,
    createMacro: I.burdenSubclass,
    createName: I.burdenSubclass,
    createNone: I.burdenSubclass,
    createNumber: I.burdenSubclass,
    createOptional: I.burdenSubclass,
    createRecord: I.burdenSubclass,
    createString: I.burdenSubclass,
    createUnion: I.burdenSubclass,
    createVariable: I.burdenSubclass,
    createWildcard: I.burdenSubclass,
    // TypeExpr3 = NAME "(" TypeExpr {"," TypeExpr} ")"
    parseApplication: function (name, scanner) {
      scanner.eat('(');
      var exprs = [this.parseTypeExpr(scanner)];
      while (scanner.eaten(',')) {
        exprs.push(this.parseTypeExpr(scanner));
      }
      scanner.eat(')');
      return this.createApplication(name, exprs);
    },
    // TypeExpr3 = "<" TypeExpr ">"
    parseDictionary: function (scanner) {
      scanner.eat('<');
      var expr = this.parseTypeExpr(scanner);
      scanner.eat('>');
      return this.createDictionary(expr);
    },
    // TypeExpr3 = CHOICE {"_" CHOICE}
    parseEnumeration: function (scanner) {
      var quotedChoices = [scanner.text(CHOICE)];
      while (scanner.eaten('_')) {
        quotedChoices.push(scanner.text(CHOICE));
      }
      var choices = quotedChoices.map(function (quoted) {
        return quoted.substr(1, quoted.length - 2);
      });
      return this.createEnumeration(choices);
    },
    // FieldDescriptor = ":" TypeExpr MetaField
    parseField: function (scanner) {
      scanner.eat(':');
      var expr = this.parseTypeExpr(scanner);
      // MetaField = {"@" FIELD "=" Annotation}
      var annotations_ = I.createTable();
      while (scanner.eaten('@')) {
        var annotationName = scanner.text(FIELD);
        if (annotationName in annotations_) {
          this.bad('annotation', annotationName);
        }
        scanner.eat('=');
        // Annotation = CHOICE | FIELD
        if (scanner.token !== CHOICE && scanner.token !== FIELD) {
          this.bad('annotation value', scanner.text());
        }
        annotations_[annotationName] = scanner.text();
      }
      return this.createField(expr, annotations_);
    },
    // TypeExpr3 = "none" | "boolean" | "integer" | "number" | "string"
    parseKeyword: function (keyword) {
      switch (keyword) {
        case 'none':
          return this.createNone();
        case 'boolean':
          return this.createBoolean();
        case 'integer':
          return this.createInteger();
        case 'number':
          return this.createNumber();
        case 'string':
          return this.createString();
        default:
          this.bad('type', keyword);
      }
    },
    // TypeExpr3 = "[" TypeExpr "]"
    parseList: function (scanner) {
      scanner.eat('[');
      var expr = this.parseTypeExpr(scanner);
      scanner.eat(']');
      return this.createList(expr);
    },
    // TypeExpr3 = "{" [FIELD FieldDescriptor {"," FIELD FieldDescriptor}] "}"
    parseRecord: function (scanner) {
      scanner.eat('{');
      var fields_ = I.createTable();
      if (scanner.token === FIELD) {
        do {
          var name = scanner.text(FIELD);
          if (name in fields_) {
            this.bad('field', name);
          }
          fields_[name] = this.parseField(scanner);
        } while (scanner.eaten(','));
      }
      scanner.eat('}');
      return this.createRecord(fields_);
    },
    // TypeDef = TypeMacro | TypeExpr
    parseTypeDef: function (scanner) {
      return scanner.token === '(' ? this.parseTypeMacro(scanner) : this.parseTypeExpr(scanner);
    },
    // TypeExpr = TypeExpr1 ["?"]
    parseTypeExpr: function (scanner) {
      var expr1 = this.parseTypeExpr1(scanner);
      return scanner.eaten('?') ? this.createOptional(expr1) : expr1;
    },
    // TypeExpr1 = TypeExpr2 {"|" TypeExpr2}
    parseTypeExpr1: function (scanner) {
      var expr2s = [this.parseTypeExpr2(scanner)];
      while (scanner.eaten('|')) {
        expr2s.push(this.parseTypeExpr2(scanner));
      }
      return expr2s.length === 1 ? expr2s[0] : this.createUnion(expr2s);
    },
    // TypeExpr2 = TypeExpr3 {"+" TypeExpr3}
    parseTypeExpr2: function (scanner) {
      var expr3s = [this.parseTypeExpr3(scanner)];
      while (scanner.eaten('+')) {
        expr3s.push(this.parseTypeExpr3(scanner));
      }
      return expr3s.length === 1 ? expr3s[0] : this.createAddition(expr3s);
    },
    // TypeExpr3 = '*' | VARIABLE | NAME
    parseTypeExpr3: function (scanner) {
      switch (scanner.token) {
        case '*':
          scanner.eat();
          return this.createWildcard();
        case '<':
          return this.parseDictionary(scanner);
        case '[':
          return this.parseList(scanner);
        case '{':
          return this.parseRecord(scanner);
        case CHOICE:
          return this.parseEnumeration(scanner);
        case FIELD:
          return this.parseKeyword(scanner.text());
        case NAME:
          var name = scanner.text(), leftParens = scanner.token === '(';
          return leftParens ? this.parseApplication(name, scanner) : this.createReference(name);
        case VARIABLE:
          return this.createVariable(scanner.text());
        default:
          this.bad('syntax', scanner.token);
      }
    },
    // TypeMacro = "(" TypeArg {"," TypeArg} ")" TypeExpr
    parseTypeMacro: function (scanner) {
      scanner.eat('(');
      var typeArgs = [], letters = {};
      do {
        // TypeArg = VARIABLE "=" TypeExpr
        var letter = scanner.text(VARIABLE);
        if (letters[letter]) {
          this.bad('macro argument', letter);
        }
        letters[letter] = true;
        typeArgs.push(letter);
        scanner.eat('=');
        typeArgs.push(this.parseTypeExpr(scanner));
      } while (scanner.eaten(','));
      scanner.eat(')');
      return this.createMacro(typeArgs, this.parseTypeExpr(scanner));
    }
  });
  // subroutines to normalize source code
  I.share({
    unparseAddition: function (cascade) {
      return cascade.map(function (expr) { return expr.unparse(); }).join('+');
    },
    unparseAnnotations: function (annotations_) {
      if (!I.hasEnumerables(annotations_)) {
        return '';
      }
      var accu = [];
      Object.getOwnPropertyNames(annotations_).sort().forEach(function (name) {
        accu.push(' @', name, '=', annotations_[name]);
      });
      return accu.join('');
    },
    unparseApplication: function (name, parameters) {
      var accu = [name, '('];
      parameters.forEach(function (expr, i) { accu.push(i ? ',' : '', expr.unparse()); });
      accu.push(')');
      return accu.join('');
    },
    unparseDictionary: function (expr) {
      return '<' + expr.unparse() + '>';
    },
    unparseEnumeration: function (choices) {
      var distinct_ = {};
      choices.forEach(function (choice) { distinct_[choice] = true; });
      var accu = [];
      Object.getOwnPropertyNames(distinct_).sort().forEach(function (choice, i) {
        accu.push(i ? '_"' : '"', choice, '"');
      });
      return accu.join('');
    },
    unparseList: function (expr) {
      return '[' + expr.unparse() + ']';
    },
    unparseMacro: function (formals, expr) {
      var accu = ['('];
      for (var i = 0, n = formals.length; i < n; i += 2) {
        accu.push(i ? ',' : '', formals[i], '=', formals[i + 1].unparse());
      }
      accu.push(')', expr.unparse());
      return accu.join('');
    },
    unparseOptional: function (mandatory) {
      return mandatory.unparse() + '?';
    },
    unparseRecord: function (fields_) {
      var accu = ['{'];
      Object.getOwnPropertyNames(fields_).sort().forEach(function (name, i) {
        var field = fields_[name];
        var typeSource = field.expression.unparse();
        var annotationsSource = I.unparseAnnotations(field.annotations_);
        accu.push(i ? ',' : '', name, ':', typeSource, annotationsSource);
      });
      accu.push('}');
      return accu.join('');
    },
    unparseUnion: function (alternatives) {
      var distinct_ = {};
      alternatives.forEach(function (expr) { distinct_[expr.unparse()] = true; });
      return Object.getOwnPropertyNames(distinct_).sort().join('|');
    }
  });
  I.nest({
    Scanner: 'BaseObject'.subclass(function (I) {
      // I describe a scanner for the tokens of the type definition language.
      I.have({
        // source to scan
        source: null,
        // matched token is either nonzero number (token type) or one-character string
        token: null,
        // first position of token in source
        start: null,
        // first position past token in source
        stop: null
      });
      I.know({
        build: function (source) {
          I.$super.build.call(this);
          this.source = source;
          this.stop = 0;
          this.eat();
        },
        // eat token (unconditionally if token is undefined) and scan for next
        eat: function (token) {
          if (token && this.token !== token) {
            // expected some other token at given position
            this.bad('token', this.start, this.token, token);
          }
          var source = this.source, n = source.length, i = this.stop, ch;
          // skip whitespaces
          for (; i < n && Whitespaces[ch = source.charAt(i)];) { ++i; }
          // found first position of token
          this.start = i;
          if (i === n) {
            // empty token signals end of source input
            this.stop = i;
            this.token = '';
          } else if (ch === '"') {
            // quoted choice token
            for (++i; i < n && Quoted[ch = source.charAt(i)];) { ++i; }
            if (i === n || i === this.start + 1 || ch !== '"') {
              this.bad('choice');
            }
            this.stop = i + 1;
            this.token = CHOICE;
          } else if (Symbolic[ch]) {
            // one-character token
            this.stop = i + 1;
            this.token = ch;
          } else if (Lower[ch]) {
            // field name (also matches type keywords)
            for (++i; i < n && Alphanum[source.charAt(i)];) { ++i; }
            this.stop = i;
            this.token = FIELD;
          } else if (Upper[ch]) {
            if (i + 1 < n && Alphanum[source.charAt(i + 1)]) {
              // type name
              for (; ;) {
                for (i += 2; i < n && Alphanum[ch = source.charAt(i)];) { ++i; }
                if (i === n || ch !== '.') {
                  break;
                }
                if (++i + 1 >= n || !Upper[source.charAt(i)] || !Alphanum[source.charAt(i + 1)]) {
                  this.bad('name');
                }
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
            this.bad('source', ch);
          }
        },
        // test whether token was eaten by scanner
        eaten: function (token) {
          if (this.token === token) {
            this.eat();
            return true;
          }
          return false;
        },
        // eat token and returns its textual content
        text: function (token) {
          var textContent = this.source.substring(this.start, this.stop);
          this.eat(token);
          return textContent;
        }
      });
    })
  });
  // nonzero token types
  var CHOICE = 1, FIELD = 2, NAME = 3, VARIABLE = 4;
  // whitespace characters
  var Whitespaces = I.charset(' \n\r\t');
  // one-character tokens
  var Symbolic = I.charset('*?|_+{:@=}<>[](,)');
  // lower- and uppercase letters
  var Lower = I.charset('abcdefghijklmnopqrstuvwxyz');
  var Upper = I.charset('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // digits and letters
  var Alphanum = I.charset('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // quoted characters in enumerated choices
  var Quoted = I.charset('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-+_$!');
})