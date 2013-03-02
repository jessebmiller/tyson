Handlebars.registerHelper('renderThisPage', function () {
    return TYSON.composeFromPath(Session.get('path'));
});

Handlebars.registerHelper('renderThisContent', function () {
    return Template[this.type](this);
});

TYSON = (function () {

    function handlePathFragment (pathFragment, composedResult) {
        /*
         * compose a result based on the pathFragment and the previous results
         * if there is no handler, return the path fragment
         */
        try {
            return TYSON.pathHandlers[pathFragment](composedResult);
        }
        catch (error) {
            console.log(error);
            return pathFragment;
        }
    }

    return {
        composeFromPath: function (path) {
            pathFragment = _.first(path);
            if (!pathFragment) {
                return false;
            }
            else {
                rest = _.rest(path);
                return handlePathFragment(pathFragment, composeFromPath(rest))
            }
        }
    }
}());

