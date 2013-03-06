TYSON = (function () {

    function handlePathFragment (pathFragment, composedResult) {
        /*
         * compose a result based on the pathFragment and the previous results
         * if there is no handler, return the path fragment
         */
        try {
            return TYSON.pathHandlers[pathFragment](composedResult);
        }
        catch (e) {
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
            basePathHandler: function (composedResult) {
                /*
                 * if no other path function retuned results,
                 * return the homepage
                 */
                if (Session.get('path').length === 1) {
                    /* if it is the root path basePathHandler is the only path
                     * element
                     */
		    try {
			return Template.homepage();
		    }
		    catch (e) {
			return Template.noHomepageFound();
		    }
                }
                else if ($(composedResult).length === 0) {
                    /* if conposedResult is not html */
                    try {
                        return Template.notFound404(composedResult);
                    }
                    catch (e) {
                        return Template.noNotFoundFound();
                    }
                }
                else {
                    /* composedResult is html */
                    return composedResult;
                }
            }
        }
    }
}());
