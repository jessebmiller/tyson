/* Thans to John Resig for his blog post on currying. This would have been
   the bulk of the work of the currying initiative to figure out

   http://ejohn.org/blog/partial-functions-in-javascript/
*/
var TYSON = {};

Function.prototype.curry = function() {
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    return function() {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
};

TYSON = (function () {

    function annotate (maybeFn) {
        /* return the number of args or false of not a function */
        var len = (typeof(maybeFn) === "function") ? maybeFn.length : false;
        return {mf: maybeFn, len: len};
    }

    function curryReduceA(maybeFnA, args) {
        /* Curry an annotated function by consuming as many args as it requires
           then return the result of calling the resulting zero arg function

           :: Maybe FnA  -> [Maybe FnA] -> [Maybe Function]
              where Maybe FnA = Annotated Maybe Function
         */

        var curriedFn = {};
        var curriedFnA = {};
        if (maybeFnA.len > 0) {
            /* function with more than zero arguements */
            curriedFn = maybeFnA.mf.curry(_.head(args));
            curriedFnA.mf = curriedFn;
            curriedFnA.len = maybeFnA.len - 1;
            return curryReduceA(curriedFnA, _.tail(args));
        } else if (maybeFnA.len === 0) {
            /* function with zero arguements */
            return [maybeFnA.mf()].concat(args) ;
        } else {
            /* is not a function */
            return [maybeFnA.mf].concat(args);
        }
    }

    function reduce(maybeFn, args) {
        /* Recursively curryReduceA or concat functions and args */
        var maybeFnA = annotate(maybeFn);
        if (args.length === 0) {
            return curryReduceA(maybeFnA, []);
        }
        if (args.length > 0) {
            return curryReduceA(maybeFnA, reduce(_.head(args), _.tail(args)));
        } else {
            throw 'argument length of non natural number';
        }
    }

    return {

        getPathname: function () {
            /* test doubablable version of window.location.pathname */
            return window.location.pathname;
        },

        composeFromPath: function (path) {
            /* Curry where possible then compose */

            function maybePathHandler(pathElem) {
                /* if there is a path handler replace the elem with it */
                var maybeHandler = TYSON.pathHandlers[pathElem];
                return (maybeHandler) ? maybeHandler : pathElem;
            }

            /* check for the root path */
            if (path === "/") {
                return TYSON.defaultPathHandler();
            }

            /* split the path into the meaningful pieces. splice(1) removes the
               empty string at the front of the list. Remove an empty string at
               the end of the list if there is one. */
            path = path.split('/').splice(1);
            if (path[path.length - 1] === '') {
                path.pop();
            }

            /* insert all path handlers into the path array */
            path = _.map(path, maybePathHandler);

            /* try currying the path, pass any errors to defaultPathHandler */
            try {
                return reduce(_.head(path), _.tail(path))[0];
            }
            catch (e) {
                return TYSON.defaultPathHandler(undefined, e);
            }
        },

        pathHandlers: {
            /* path handlers will be passed strings pulled from the URL.
               each handler will be curried with as many arguments in line on
               the path as will make them functions that take one arguement.

               for example the path handlers 'add' and 'mult' below will be
               curried with the next arguement and then the resulting function
               will be composed with the result of the rest of the path.

               add: function (a, b) {
                   return parseInt(a, 10) + parseInt(b, 10);
               },
               mult: function (a, b) {
                   return parseInt(a, 10) + parseInt(b, 10);
               }

               the path /add/1/mult/2/2 will result in '5'
               the path /mult/1/add/2/2 will result in '4'
            */
        }
    };
}());
