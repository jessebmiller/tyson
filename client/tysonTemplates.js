Handlebars.registerHelper('renderThisPage', function () {
    return TYSON.composeFromPath(Session.get('path'));
});

Handlebars.registerHelper('renderThisContent', function () {
    return Template[this.type](this);
});

