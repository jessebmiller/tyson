/* fix an oversight in javascript */
function F() {}
Obj = function (proto) {
    F.prototype = proto;
    return new F();
};

Tyson = (function () {

    /*
     * content type definitions
     * central storage of content type classes.
     * each type class MUST implement the following
     *   view: a -> HTML (Viewable)
     *
     * structural types MUST implement the following
     *   cons: a -> [a] -> [a] - like haskell's cons (:)
     *   unit: a
     *
     * and MAY implement other custom functors like so
     *   summarise: a -> Viewable b
     */

    var homeController = function () {
        throw "please register a home controller";
    };

    var registry = {
        contentTypeDefs: {},
        controllers: {}
    };

    function getRegistry (name) { return registry[name]; }
    function setRegistry (name, state) { registry[name] = state; }

    var register = function (name, key, value) {
        registry[name][key] = value;
    }.autoCurry();

    function getPathList () {
        var path = window.location.pathname;
        return _.filter(path.split('/'), function (elm) { return elm; });
    }

    var Viewable = makeClass("TysonViewable", ['views']);
    var EJSONable = makeClass("TysonEJSONable",
                              ['clone', 'equals', 'typeName', 'toJSONValue']);

    var BaseGrid = Constructor(function (contentTree) {
        /* the base grid at the root of all content trees
         * implement views on this type to change the behavior of the
         * base grid
         */
        this.content = contentTree;
    });

    Viewable(BaseGrid, {
        views: function () {
            return {
                view: function (a) { return Tyson.view(a.content); }
            };
        }
    });

    function makeStore(collection) {
        return function (obj) {
            return collection.insert({
                __type: obj.typeName(),
                __value: obj.toJSONValue()
            });
        };
    }

    function makeTrivialController(returnValue) {
        /* return a controller who's function returns the given returnValue
         * and takes no arguements
         *
         * used as a default controller for path "arguements"
         */
        var trivialController = {
            func: function () { return returnValue; },
            args: 0
        };
        return trivialController;
    }

    function getFunc (controllerName) {
        /* return the function registered for this controller or the trivial
           function for this value
         */
        var controller = registry.controllers[controllerName]
                || makeTrivialController(controllerName);
        var func;
        func = (controller.args > 0)
            ? controller.func.autoCurry(controller.args)
            : controller.func.autoCurry();
        func.args = controller.args;
        return func;
    }

    function composeController (path) {
         /* curry functions that need arguements and compose the resulting
          * functions
          */

        function curryPathFunc (head, tail) {
            /* curry into the head function enough of the tail to make it a 1
             * arguement function (being sure to recursivly compose the tail)
             */
            var composedTail = composePathFuncs(_.head(tail), _.tail(tail));
            var curriedHead;
            if (composedTail[0].args === undefined) {
                curriedHead = head(_.head(composedTail));
            } else {
                curriedHead = head(_.head(composedTail)());
            }
            curriedHead.args = head.args - 1;
            composedTail = _.tail(composedTail);
            if (curriedHead.args > 1) {
                return curryPathFunc(curriedHead, composedTail);
            }
            return [curriedHead].concat(composedTail);
        }

        function composePathFuncs (head, tail) {
            if (head.args === undefined) {
                return [head].concat(tail);
            }
            if (head.args > 1) {
                var curried = curryPathFunc(head, tail);
                return composePathFuncs(_.head(curried), _.tail(curried));
            } else if (head.args === 1) {
                var composedTail;
                var composed;
                if (tail.length > 1) {
                    composedTail = composePathFuncs(_.head(tail),
                                                    _.tail(tail));
                    if (_.head(composedTail).args === 0) {
                        composed = head(_.head(composedTail)());
                    } else if (_.head(composedTail).args === undefined) {
                        composed = head(_.head(composedTail));
                    } else {
                        throw "tried to compose func with more than zero args";
                    }
                    return [composed].concat(_.tail(composedTail));
                } else {
                    if (tail[0].args === 0) {
                        composed = head(tail[0]());
                    } else if (tail[0].args === undefined) {
                        composed = head(tail[0]);
                    } else {
                        throw "Non argument fell through";
                    }
                    return [composed];
                }
            } else if (head.args === 0) {
                if(tail.length > 0) {
                    var argList = [head].concat(composePathFuncs(
                                         _.head(tail),
                                         _.tail(tail)));
                    return argList;
                } else {
                    return [head()];
                }
            } else {
                throw 'argument length not a Natural number';
            }
        }

        var headFunc = getFunc(_.head(path));
        var tailFuncs = functional.map(getFunc, _.tail(path));
        return function () {
            var structuredData = composePathFuncs(headFunc, tailFuncs)[0];
            return structuredData;
        };
    }

    return {
        /* testability functions */
        __getPath__: function () {
            return window.location.pathname;
        },

        register: register,
        _getControllers: getRegistry.partial("controllers"),
        __clearControllers__: setRegistry.partial("controllers", {}),
        registerController: function (name, func, numArgs) {
            var controller = {};
            controller.args = numArgs || func.length;
            controller.func = func;
            registry.controllers[name] = controller;
        },
        registerControllers: function (ts) {
            /* ts should be in the form [[String, Function, Opt Int]...]
               This represents the controllers, name, function, and expected
               number of args which is optional
             */
            _.each(ts, function (t) {
                // ensure args[2] is indexable
                t.push(undefined);
                Tyson.registerController(t[0], t[1], t[2]);
            });
        },
        registerHomeController: function (controller) {
            homeController = controller;
        },
        getHomeController: function () { return homeController; },

        Viewable: Viewable,
        view: function (obj) {
            var views = vtable("TysonViewable", obj).views();
            try { /* try the view named in the session first */
                return views[Session.get('view')](obj);
            } catch (e) { /* if that fails try the standard view */
                return views['view'](obj);
            }
        },

        model: function (path, baseGrid) {
            var controller = composeController(path);
            var contentTree = controller();
            baseGrid = baseGrid || [];
            return contentTree || baseGrid;
        },
        EJSONable: EJSONable,
        makeStore: makeStore
    };
}());

Tyson.Viewable(Array, {
    views: function () {
        return {
            view: function (as) {
                return functional.map(Tyson.view, as).join('');
            }
        };
    }
});

function reconstitute(doc) {
    /* Mongo Document -> Typed Content */
    if (doc.__type) {
        doc = EJSON.fromJSONValue({
            $type: doc.__type,
            $value: doc.__value
        });
    }
    return doc;
}

/* instance Viewable for LocalCollection.Cursor
 * if it's a custom type built by storeContent, return it to the custom type
 * before handing it to the view function, otherwise hand it to the view
 * function as is.
 */
Tyson.Viewable(Package.minimongo.LocalCollection.Cursor, {
    views: function () {
        return {
            view: function (cursor) {
                return Tyson.view(cursor.map(reconstitute));
            }
        };
    }
});
