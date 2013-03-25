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

    /* functions to compose after curring is complete */
    var composeStack = [];

    function curryPath(path) {
        /* curry all functions in path and push the result to composeStack */
        var fn = {};
        var argsToCurry = [];
        var numArgs = 0;
        var fnName = '';
        var composeWith = {};

        if(path.length > 1) {
            fnName = path.shift();
            fn = TYSON.pathHandlers[fnName];
            numArgs = fn.length;
            if (numArgs > 1) {
                argsToCurry = path.splice(0, numArgs - 1);
                _.each(argsToCurry, function (arg) {
                    fn = fn.curry(arg);
                });
            }
            composeStack.push(fn);
            curryPath(path);
        } else {
            fn = TYSON.pathHandlers[path[0]];
            composeWith = (fn) ? fn : path[0];
            composeStack.push(composeWith);
            return true;
        }
    }

    function compose(fns, arg) {
        /* recursively compose the compose stack
           the last arguement may be a string. if there are functions
           before compose it as the arguement to start the chain.
           if there are not functions befor it (length 1), pass that string
           to the default path handler */

        var fn = {};

        if (fns.length > 1) {
            /* more than one element, expect functions */
            fn = fns.pop();
            return compose(fns, fn(arg));
        } else if (typeof(fns[0]) === "function") {
            /* one fn and one arg left, call the fn with the arg */
            return fns.pop()(arg);
        } else if (typeof(arg) === 'function') {
            /* the single path element was a function */
            return arg();
        } else {
            /* no functions in this path. defer to default path handler */
            return TYSON.defaultPathHandler(arg);
        }
    }

    return {

        getPathname: function () {
            /* test doubablable version of window.location.pathname */
            return window.location.pathname;
        },

        composeFromPath: function (path) {
            /* Curry where possible then compose */
            var firstArg = "";
            var composedResult = {};

            /* clear the composeStack in case of previous errors */
            composeStack = [];

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

            /* try currying the path, pass any errors to defaultPathHandler */
            try {
                /* curryPath currys down all functions in the path then pushes
                   the result to composeStack to be poped off byt the recursive
                   compose function */
                curryPath(path);
            }
            catch (e) {
                return TYSON.defaultPathHandler(undefined, e);
            }

            /* pull off the first arguement from the composePath to start the
               recursion. if it's a function, pass the result of calling it as
               the first arguement for composition */
            firstArg = composeStack.pop();
            composedResult = compose(composeStack, firstArg);
            return composedResult;
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
    }
}());
