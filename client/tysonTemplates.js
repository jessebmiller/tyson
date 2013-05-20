Handlebars.registerHelper('renderThisPage', function () {
    return TYSON.composeFromPath(TYSON.getPathname());
});

Handlebars.registerHelper('renderThisContent', function () {
	console.log(this);
    return Template[this.type](this);
});

Template.article.markdown = function () {
    converter = new Showdown.converter();
    console.log(this);
    return converter.makeHtml(this.markdown);
};
