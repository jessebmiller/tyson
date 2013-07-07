Package.describe({
    summary: "CMS for content creators"
});

Package.on_use(function (api) {
    api.use("wu-xain");
    api.add_files("tyson.js", "client");
});

Package.on_test(function (api) {
    api.use(["tyson", "tinytest", "test-helpers", "templating", "jquery",
             "autopublish", "insecure"]);
    api.add_files("tests.js", ["client", "server"]);
    api.add_files(["test.html", "testTypes.js"], "client");
});
