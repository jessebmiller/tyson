Package.describe({
    summary: "CMS for content creators"
});

Package.on_use(function (api) {
    api.use(["functionalMeteor", "handlebars"]);
    api.add_files("tyson.js", "client");
    api.export('Tyson', 'client');
});

Package.on_test(function (api) {
    api.use(["tyson", "functionalMeteor", "tinytest", "test-helpers",
             "templating", "jquery", "autopublish", "insecure"]);
    api.add_files("tests.js", ["client", "server"]);
    api.add_files(["test.html"], "client");
});
