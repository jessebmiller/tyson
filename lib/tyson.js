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
                return handlePathFragment(pathFragment,
                                          TYSON.composeFromPath(rest))
            }
        },

        pathHandlers: {
            tysonDefault: function (composedResult) {
                /*
                 * if no other path function retuned results,
                 * return the homepage
                 */
                if ($(composedResult).length === 0) {
		    try {
			return Template.homepage(composedResult);
		    }
		    catch (e) {
			return Template.noHomepageFound(composedResult);
		    }
                }
            }
        }
    }
}());
