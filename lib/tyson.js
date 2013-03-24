/* Thans to John Resig for his blog post on currying. This would have been
   the bulk of the work of the currying initiative to figure out

   http://ejohn.org/blog/partial-functions-in-javascript/
*/
Function.prototype.curry = function() {
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    return function() {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
};

TYSON = (function () {

    /* functions to compose after curring is complete */
    var composeStack = [];

    function curryPath(path) {
        /* curry all functions in path and push the result to composeStack */
        if(path.length > 1) {
            fnName = path.shift();
            fn = TYSON.pathHandlers[fnName];
            numArgs = fn.length;
            argsToCurry = path.splice(0, numArgs - 1);
            curriedFn = fn.curry(argsToCurry);
            composeStack.push(curriedFn);
            curryPath(path);
        } else {
            composeStack.push(path[0]);
            return true;
        }
    }

    function compose(fns, arg) {
        /* recursively compose the compose stack
           the last arguement may be a string. if there are functions
           before compose it as the arguement to start the chain.
           if there are not functions befor it (length 1), pass that string
           to the default path handler
         */
        if (fns.length > 1) {
            /* more than one element, expect functions */
            fn = fns.pop();
            return compose(fns, fn(arg));
        } else if (typeof(fns[0]) === "function") {
            /* one fn and one arg left, call the fn with the arg 
               arg might be undefined.
             */
            return fns.pop()(arg);
        } else {
            /* one string in stack caldefaultPathHandler on it */
            return TYSON.defaultPathHandler(arg);
        }
    }

    return {

        getPathname: function () {
            return window.location.pathname;
        },

        composeFromPath: function (path) {
            /* Curry where possible then compose */

            /* clear the composeStack in case of previous errors */
            composeStack = [];

            /* check for the root path */
            if (path === "/") {
                return TYSON.defaultPathHandler();
            }

            /* split the path into the meaningful pieces
               splice(1) removes the empty string at the
               front of the list, remove an empty string
               at the end of the list if there is one.
            */
            path = path.split('/').splice(1);
            if (path[path.length - 1] === '') {
                poped = path.pop();
            }
            try {
                curryPath(path)
            }
            catch (e) {
                return TYSON.defaultPathHandler(undefined, e);
            }
            firstArg = composeStack.pop();
            if (typeof(firstArg) == "function") {
                firstArg = firstArg();
            }
            composedResult = compose(composeStack, firstArg);
            return composedResult;
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
                 * .../page/typeName/pageNumber
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
                pageNavigation = {'type': 'pNav',
                                  'first': first,
                                  'last': last,
                                  'previous': prev,
                                  'next': next
                                 };
                paginated = {'pageContents': {'contents': cursor },
                             'pNav': pageNavigation};
                return Template.tysonPaginated(paginated)
            }
        }
    }
}());
