"use strict";

/*
This script converts CCDA data in JSON format (originally generated from a Continuity of Care Document (CCD) in
standard XML/CCDA format) back to XML/CCDA format.
*/

var _ = require('lodash');
var bbu = require("@amida-tech/blue-button-util");

var engine = require('./lib/engine');
var documentLevel = require('./lib/documentLevel');

var bbuo = bbu.object;

var html_renderer = require('./lib/htmlHeaders');

var createContext = (function () {
  var base = {
    nextReference: function (referenceKey) {
      var index = this.references[referenceKey] || 0;
      ++index;
      this.references[referenceKey] = index;
      return "#" + referenceKey + index;
    },
    sameReference: function (referenceKey) {
      var index = this.references[referenceKey] || 0;
      return "#" + referenceKey + index;
    }
  };

  return function (options) {
    var result = Object.create(base);
    result.references = {};
    if (options.meta && options.addUniqueIds) {
      result.rootId = _.get(options.meta, 'identifiers.0.identifier');
    } else {
      result.rootId = null;
    }
    result.preventNullFlavor = options.preventNullFlavor;

    return result;
  };
})();

var generate = exports.generate = function (template, input, options) {
  var context = createContext(options);
  return engine.create(template, input, context);
};

exports.generateCCD = function (input, options) {
  options = options || {};
  options.meta = input.meta;
  if (!options.html_renderer) {
    options.html_renderer = html_renderer;
  }
  const template = documentLevel.ccd2(options.html_renderer) || documentLevel.ccd;
  return generate(template, input, options);
};

exports.fieldLevel = require("./lib/fieldLevel");
exports.entryLevel = require("./lib/entryLevel");
exports.leafLevel = require('./lib/leafLevel');
exports.contentModifier = require("./lib/contentModifier");
exports.condition = require('./lib/condition');
