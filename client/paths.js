Handlebars.registerHelper('renderThisPage', function () {
    return TYSON.composeFromPath(Session.get('path'));
});

Handlebars.registerHelper('renderThisContent', function () {
    return Template[this.type](this);
});

TYSON.pathHandlers = (function () {

    return {
        type: function (composedResult) {
            /*
             * TypeName a -> Cursor [a]
             * Takes a type name (Srting) and returns a cursor of type a
             */

            console.log(composedResult);
            return Content.find({'type': composedResult});
        },

        showContent: function (composedResult) {
            /*
             * Renderable Cursor [a] -> Html
             */

            console.log(composedResult);
            return Template.contentList({contents: composedResult});
        }
    }
}());
