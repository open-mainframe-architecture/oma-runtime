'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    enumeratedChoices_: null
  });
  I.know({
    build: function (typespace, expression, choices) {
      I.$super.build.call(this, typespace, expression);
      this.enumeratedChoices_ = I.createTable();
      for (var i = 0, n = choices.length; i < n; ++i) {
        this.enumeratedChoices_[choices[i]] = true;
      }
    },
    describesValue: function (value) {
      return typeof value === 'string' && !!this.enumeratedChoices_[value];
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: I.returnArgument
  });
  I.share({
    flatten: function (typespace, expression, enumerations) {
      if (enumerations.length === 1) {
        return enumerations[0];
      }
      var choices_ = I.createTable();
      for (var i = 0, n = enumerations.length; i < n; ++i) {
        Object.assign(choices_, enumerations[i].enumeratedChoices_);
      }
      return I.$.create(typespace, expression, Object.getOwnPropertyNames(choices_));
    }
  });
})