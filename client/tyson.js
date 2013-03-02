Handlebars.registerHelper('renderThisPage', function() {
  return TYSON.templateForThisPath(Session.get('path'));
});

TYSON = (function () {
  return {
    templateForThisPath: function (path) {
      return Template[_.first(path)]();
    }
    
  }
}());
