//@ An union type describes values of alternative types.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.Type.Object]} alternative types of this union
    alternativeTypes: null,
    //@{[Std.Data.Type.Dictionary?]} only dictionary alternative or nothing
    dictionaryAlternative: null,
    //@{[Std.Data.Type.List?]} only list alternative or nothing
    listAlternative: null,
    //@{[Std.Data.Type.Record?]} only record alternative or nothing
    recordAlternative: null
  });
  I.know({
    //@param typespace {Std.Data.Typespace} typespace of this union type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param alternatives {[Std.Data.Type.Object]} alternative types of this union type
    build: function(typespace, expression, alternatives) {
      I.$super.build.call(this, typespace, expression);
      this.alternativeTypes = alternatives;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      const alternatives = this.alternativeTypes, n = alternatives.length;
      let dictionary = true, list = true, record = true;
      for (let i = 0; i < n && (dictionary || list || record); ++i) {
        const alternative = alternatives[i];
        if (dictionary && alternative.isDictionary()) {
          dictionary = dictionary === true ? alternative : false;
        } else if (list && alternative.isList()) {
          list = list === true ? alternative : false;
        } else if (record && alternative.isRecord()) {
          record = record === true ? alternative : false;
        }
      }
      this.dictionaryAlternative = typeof dictionary === 'boolean' ? null : dictionary;
      this.listAlternative = typeof list === 'boolean' ? null : list;
      this.recordAlternative = typeof record === 'boolean' ? null : record;
    },
    isUnion: I.returnTrue,
    marshalValue: I.shouldNotOccur,
    testMembership: function(value) {
      return this.alternativeTypes.some(alternative => alternative.testMembership(value));
    },
    unmarshalJSON: function(json, expression) {
      if (I.Data.isBasic(json)) {
        return json;
      } else {
        const alternative = Array.isArray(json._ || json) ? this.listAlternative :
          json._ ? this.dictionaryAlternative :
            this.recordAlternative;
        return alternative.unmarshalJSON(json, expression);
      }
    }
  });
  const Enumeration = I._.Enumeration, Optional = I._.Optional;
  I.share({
    //@ Normalize type alternatives.
    //@param typespace {Std.Data.Typespace} typespace of new type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param alternatives {[Std.Data.Type.Object]} alternatives of type to normalize
    //@return {Std.Data.Type.Object} normalized type, probably a union
    normalize: (typespace, expression, alternatives) => {
      // flatten union alternatives
      const flat = [];
      for (let alternative of alternatives) {
        if (alternative.isUnion()) {
          flat.push(...alternative.alternativeTypes);
        } else {
          flat.push(alternative);
        }
      }
      let i, j, n;
      // ensure mandatory alternatives
      let optional = false;
      for (i = 0, j = 0, n = flat.length; i < n; ++i) {
        if (flat[i].isNone()) {
          optional = true;
          continue;
        }
        else {
          optional = optional || flat[i].isOptional();
          flat[j++] = flat[i].asMandatory();
        }
      }
      // search for wildcard amongst mandatory alternatives
      let wildcard = false;
      for (i = 0; i < j; ++i) {
        if (flat[i].isWildcard()) {
          wildcard = flat[i];
          break;
        }
      }
      if (!wildcard) {
        // search for boolean, number, integer and string alternatives
        let boolean = false, number = false, integer = false, string = false;
        for (n = j, i = 0, j = 0; i < n; ++i) {
          if (flat[i].isBoolean()) {
            boolean = flat[i];
            continue;
          } else if (flat[i].isNumber()) {
            number = flat[i];
            continue;
          } else if (flat[i].isInteger()) {
            integer = flat[i];
            continue;
          } else if (flat[i].isString()) {
            string = flat[i];
            continue;
          } else {
            flat[j++] = flat[i];
          }
        }
        // search for enumeration alternatives
        let enumerations = [];
        for (n = j, i = 0, j = 0; i < n; ++i) {
          if (flat[i].isEnumeration()) {
            if (!string) {
              enumerations.push(flat[i]);
            }
            continue;
          } else {
            flat[j++] = flat[i];
          }
        }
        // remove duplicates
        for (n = flat.length = j, i = 0, j = 0; i < n; ++i) {
          if (flat.indexOf(flat[i], i + 1) > 0) {
            continue;
          }
          else {
            flat[j++] = flat[i];
          }
        }
        flat.length = j;
        // add string or enumeration alternative
        if (string) {
          flat.unshift(string);
        } else if (enumerations.length) {
          flat.unshift(Enumeration._.merge(typespace, expression, enumerations));
        }
        // add number or integer alternative
        if (number) {
          flat.unshift(number);
        } else if (integer) {
          flat.unshift(integer);
        }
        if (boolean) {
          flat.unshift(boolean);
        }
      }
      const union = wildcard ? wildcard :
        !flat.length ? typespace.noneType :
          flat.length === 1 ? flat[0] :
            I.$.create(typespace, expression, flat);
      return optional ? Optional._.normalize(typespace, expression, union) : union;
    }
  });
})