Handlebars.registerHelper("thisView", function () {
    var path = functional.select(functional.I, Tyson.__getPath__().split('/'));
    var model;
    if (path.length == 0){
        path.push(Tyson.getHomeController());
    }
    model = Tyson.model(path);
    return Tyson.view(model);
});

Handlebars.registerHelper("viewContent", function (c) {
    return Tyson.view(c);
});

