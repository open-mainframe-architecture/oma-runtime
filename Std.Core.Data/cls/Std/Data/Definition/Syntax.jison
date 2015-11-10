%{
I.know({
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
  createWildcard: I.burdenSubclass
});
%}
%lex
CHOICE         "\""[0-9A-Za-z\.\-+_$]+"\""
FIELD          [a-z][0-9A-Za-z]*
NAME           [A-Z][0-9A-Za-z]+("."[A-Z][0-9A-Za-z]+)*
VARIABLE       [A-Z]
%s FIELD
%%
\s+            /* ignore */
"("            return '(';
")"            return ')';
"="            return '=';
","            return ',';
"?"            return '?';
"|"            return '|';
"+"            return '+';
"*"            return '*';
"_"            return '_';
"["            return '[';
"]"            return ']';
"<"            return '<';
">"            return '>';
"{"            { this.begin('FIELD'); return '{'; }
"}"            { return '}'; }
":"            return ':';
"@"            return '@';
{CHOICE}       return 'CHOICE';
<FIELD>{FIELD} return 'FIELD';
{NAME}         return 'NAME';
{VARIABLE}     return 'VARIABLE';
"none"         return 'none';
"boolean"      return 'boolean';
"integer"      return 'integer';
"number"       return 'number';
"string"       return 'string';
<<EOF>>        return 'EOF';
.              return 'INVALID';
/lex
%start Start
%%
Start
  : TypeDef EOF { return $1; }
  ;
TypeDef
  : '(' Arguments ')' TypeExpr { $$ = yy.self.createMacro($2, $4); }
  | TypeExpr { $$ = $1; }
  ;
Arguments
  : VARIABLE '=' TypeExpr { $$ = [$1, $3]; }
  | Arguments ',' VARIABLE '=' TypeExpr {
    if ($1.indexOf($3) % 2 === 0) {
      yy.self.bad('duplicate', $3);
    }
    $1.push($3, $5);
    $$ = $1;
  }
  ;
TypeExpr
  : TypeExpr1 '?' { $$ = yy.self.createOptional($1); }
  | TypeExpr1 { $$ = $1; }
  ;
TypeExpr1
  : Alternatives { $$ = $1.length === 1 ? $1[0] : yy.self.createUnion($1); }
  ;
Alternatives
  : Alternatives '|' TypeExpr2 { $1.push($3); $$ = $1; }
  | TypeExpr2 { $$ = [$1]; }
  ;
TypeExpr2
  : Additions { $$ = $1.length === 1 ? $1[0] : yy.self.createAddition($1); }
  ;
Additions
  : Additions '+' TypeExpr3 { $1.push($3); $$ = $1; }
  | TypeExpr3 { $$ = [$1]; }
  ;
TypeExpr3
  : NAME { $$ = yy.self.createName($1); }
  | NAME '(' Parameters ')' { $$ = yy.self.createApplication($1, $3); }
  | VARIABLE { $$ = yy.self.createVariable($1); }
  | '*' { $$ = yy.self.createWildcard(); }
  | 'none' { $$ = yy.self.createNone(); }
  | 'boolean' { $$ = yy.self.createBoolean(); }
  | 'integer' { $$ = yy.self.createInteger(); }
  | 'number' { $$ = yy.self.createNumber(); }
  | 'string' { $$ = yy.self.createString(); }
  | Choices { $$ = yy.self.createEnumeration($1); }
  | '[' TypeExpr ']' { $$ = yy.self.createList($2); }
  | '<' TypeExpr '>' { $$ = yy.self.createDictionary($2); }
  | '{' Fields '}' { yy.lexer.popState(); $$ = yy.self.createRecord($2); }
  ;
Parameters
  : Parameters ',' TypeExpr { $1.push($3); $$ = $1; }
  | TypeExpr { $$ = [$1]; }
  ;
Choices
  : Choices '_' CHOICE { $1.push($3.substr(1, $3.length - 2)); $$ = $1; }
  | CHOICE { $$ = [$1.substr(1, $1.length - 2)]; }
  ;
Fields
  : OneOrMoreFields { $$ = $1; }
  | { $$ = I.createTable(); }
  ;
OneOrMoreFields
  : FieldName FieldDescriptor {
    var fields_ = I.createTable();
    fields_[$1] = $2;
    $$ = fields_
  }
  | OneOrMoreFields ',' FieldName FieldDescriptor {
    if ($1[$3]) {
      yy.self.bad('duplicate', $3);
    }
    $1[$3] = $4;
    $$ = $1;
  }
  ;
FieldDescriptor
  : ':' TypeExpr MetaField { $$ = yy.self.createField($2, $3); }
  ;
FieldName
  : FIELD { yy.lexer.popState(); $$ = $1; }
  ;
MetaField
  : MetaField '@' FIELD '=' Annotation {
    if ($1[$3]) {
      yy.self.bad('duplicate', $3);
    }
    $1[$3] = $5;
    $$ = $1;
  }
  | { yy.lexer.begin('FIELD'); $$ = I.createTable(); }
  ;
Annotation
  : CHOICE
  | FIELD
  ;