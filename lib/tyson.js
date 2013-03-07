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
            },
            page: function (composedResult) {
                /* must exist (for now) at the end of the path as follows
                 * .../path/typeName/pageNumber
                 */

                path = Session.get('path');
                documentLimit = 10;
                typeAndPage = _.last(path, 2);
                type = _.first(typeAndPage);
                page = parseInt(_.last(path), 10);
                maxPage = Math.ceil(
                    Content.find({'type': type}).count() / documentLimit) - 1;
                documentSkip = documentLimit * page;
                cursor = Content.find(
                    {'type': type},
                    {skip: documentSkip, limit: documentLimit});
                pathFragment = '/' + _.initial(_.rest(path)).join('/') + '/';
                first = (page <= 0) ? false : pathFragment + '0';
                last = (page >= maxPage) ? false : pathFragment + maxPage;
                next = (page >= maxPage) ? false : pathFragment + (page + 1);
                prev = (page <= 0) ? false : pathFragment + (page - 1);
                pageNavigation = {'type': 'pageNavigation',
                                  'first': first,
                                  'last': last,
                                  'previous': prev,
                                  'next': next
                                 };
                paginated = {'pageContents': {'contents': cursor },
                                 'pageNavigation': pageNavigation};
                return Template.tysonPaginated(paginated)
            }
        }
    }
}());
