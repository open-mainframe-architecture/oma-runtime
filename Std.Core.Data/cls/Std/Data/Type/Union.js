//@ An union type describes values of alternative types.
'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.AbstractType]} alternative types of this union
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
    //@param alternatives {[Std.Data.AbstractType]} alternative types of this union type
    build: function (typespace, expression, alternatives) {
      I.$super.build.call(this, typespace, expression);
      this.alternativeTypes = alternatives;
      var dictionary = true, list = true, record = true;
      for (var i = 0, n = alternatives.length; i < n && (dictionary || list || record); ++i) {
        var alternative = alternatives[i];
        if (dictionary && I._.Dictionary.describes(alternative)) {
          dictionary = dictionary === true ? alternative : false;
        } else if (list && I._.List.describes(alternative)) {
          list = list === true ? alternative : false;
        } else if (record && I._.Record.describes(alternative)) {
          record = record === true ? alternative : false;
        }
      }
      this.dictionaryAlternative = typeof dictionary === 'boolean' ? null : dictionary;
      this.listAlternative = typeof list === 'boolean' ? null : list;
      this.recordAlternative = typeof record === 'boolean' ? null : record;
    },
    describesValue: function (value) {
      return this.alternativeTypes.some(function (alternative) {
        return alternative.describesValue(value);
      });
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: function (json, expression) {
      if (I.Data.isBasicValue(json)) {
        return json;
      } else {
        var alternative = json && (
          Array.isArray(json._ || json) ? this.listAlternative :
            json._ ? this.dictionaryAlternative :
              this.recordAlternative
          );
        return alternative ? alternative.unmarshalJSON(json, expression) : this.bad(json);
      }
    }
  });
  I.share({
    //@ Normalize alternative types.
    //@param typespace {Std.Data.Typespace} typespace of new type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param alternatives {[Std.Data.AbstractType]} alternatives of type to normalize
    //@return {Std.Data.AbstractType} normalized type, probably a union
    normalize: function (typespace, expression, alternatives) {
      var flat = [];
      alternatives.forEach(function(alternative) {
        if (I.$.describes(alternative)) {
          flat.push.apply(flat, alternative.alternativeTypes);
        } else {
          flat.push(alternative);
        }
      });
      var i, j, n, optional, wildcard, boolean, number, integer, string, enumerations;
      for (optional = false, i = 0, j = 0, n = flat.length; i < n; ++i) {
        if (I._.None.describes(flat[i])) {
          optional = true;
          continue;
        }
        else {
          optional = optional || I._.Optional.describes(flat[i]);
          flat[j++] = flat[i].asMandatory();
        }
      }
      for (wildcard = false, i = 0; i < j; ++i) {
        if (I._.Wildcard.describes(flat[i])) {
          wildcard = flat[i];
          break;
        }
      }
      if (!wildcard) {
        boolean = number = integer = string = false;
        for (n = j, i = 0, j = 0; i < n; ++i) {
          if (I._.Boolean.describes(flat[i])) {
            boolean = flat[i];
            continue;
          } else if (I._.Number.describes(flat[i])) {
            number = flat[i];
            continue;
          } else if (I._.Integer.describes(flat[i])) {
            integer = flat[i];
            continue;
          } else if (I._.String.describes(flat[i])) {
            string = flat[i];
            continue;
          } else {
            flat[j++] = flat[i];
          }
        }
        for (enumerations = [], n = j, i = 0, j = 0; i < n; ++i) {
          if (I._.Enumeration.describes(flat[i])) {
            if (!string) {
              enumerations.push(flat[i]);
            }
            continue;
          } else {
            flat[j++] = flat[i];
          }
        }
        for (n = flat.length = j, i = 0, j = 0; i < n; ++i) {
          if (flat.indexOf(flat[i], i + 1) > 0) {
            continue;
          }
          else {
            flat[j++] = flat[i];
          }
        }
        flat.length = j;
        if (string) {
          flat.unshift(string);
        } else if (enumerations.length) {
          flat.unshift(I._.Enumeration._.merge(typespace, expression, enumerations));
        }
        if (number) {
          flat.unshift(number);
        } else if (integer) {
          flat.unshift(integer);
        }
        if (boolean) {
          flat.unshift(boolean);
        }
      }
      var union = wildcard ? wildcard :
        !flat.length ? typespace.noneType :
          flat.length === 1 ? flat[0] :
            I.$.create(typespace, expression, flat);
      return optional ? I._.Optional._.normalize(typespace, expression, union) : union;
    }
  });
})