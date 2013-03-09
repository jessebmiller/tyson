Handlebars.registerHelper('renderThisPage', function () {
    return TYSON.composeFromPath(Session.get('path'));
});

Handlebars.registerHelper('renderThisContent', function () {
    return Template[this.type](this);
});

Template.article.markdown = function () {
    converter = new Showdown.converter();
    console.log(this);
    return converter.makeHtml(this.markdown);
};
