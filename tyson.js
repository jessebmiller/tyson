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

    var registerTyped = function (registryName, typedObj) {
        register(registryName, typedObj.type, typedObj);
    }.autoCurry();

    function getPathList () {
        var path = window.location.pathname;
        return _.filter(path.split('/'), function (elm) { return elm; });
    }

    var fmap = function (functor, obj) {
        /* apply the obj's type's functor to the obj */
        return registry.contentTypeDefs[obj.type][functor](obj);
    }.autoCurry();

    function unit (typeName) {
        return registry.contentTypeDefs[typeName].unit();
    }

    function cons (structural, obj) {
        /* add the obj to the structural using it's type's cons method */
        return Obj(registry.contentTypeDefs[structural.type])
            .cons(structural, obj);
    }

    function makeTrivialController(returnValue) {
        /* return a controller who's function returns the given returnValue
           and takes no arguements

           used as a default controller for path "arguements"
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
        console.log(controller, func, func());
        func.args = controller.args;
        return func;
    }

    function composeController (path) {
         /* curry functions that need arguements and compose the resulting
            functions
          */

        function curryPathFunc (head, tail) {
            /* curry into the head function enough of the tail to make it a 1
               arguement function (being sure to recursivly compose the tail)
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

        /* register and registry convienience functions */
        register: register,
        _getContentTypeDefs: getRegistry.partial("contentTypeDefs"),
        _getControllers: getRegistry.partial("controllers"),
        __clearContentTypeDefs__: setRegistry.partial("contentTypeDefs", {}),
        __clearControllers__: setRegistry.partial("controllers", {}),
        registerContentType: registerTyped("contentTypeDefs"),
        registerContentTypes: function (l) {
            _.each(l, Tyson.registerContentType);
        },
        registerController: function (type, func, args) {
            registerTyped("controllers", {
                type: type,
                func: func,
                args: args || func.length
            });
        },
        registerControllers: function (ts) {
            /* ts should be in the form [[String, Function, Opt Int]...]
               This represents the controllers, name, function, and expected
               number of args which is optional
             */
            _.each(ts, function (t) {
                // ensure args[2] is indexable
                t.push(undefined);
                console.log('registerControllers', t);
                Tyson.registerController(t[0], t[1], t[2]);
            });
        },
        registerHomeController: function (controller) {
            homeController = controller;
        },
        getHomeController: function () { return homeController; },

        /* fmap and functor aliases */
        fmap: fmap,
        view: function (obj) {
            return Tyson.fmap('view', obj);
        },

        /* model and functions */
        model: function (path, baseGridName) {
            var controller = composeController(path);
            var baseGrid, contentTree;
            if (typeof baseGridName === "string") {
                baseGridName = baseGridName;
            } else {
                baseGridName = "trivialGrid";
            }
            baseGrid = unit(baseGridName);
            contentTree = controller();
            return contentTree ? Tyson.cons(baseGrid, contentTree) : baseGrid;
        },
        cons: cons,
        unit: unit
    };
}());

Handlebars.registerHelper("thisView", function (baseGridName) {
    var path = functional.select(functional.I, Tyson.__getPath__().split('/'));
    var model;
    if (path.length == 0){
        path.push(Tyson.getHomeController());
    }
    model = Tyson.model(path, baseGridName);
    return Tyson.view(model);
});

Handlebars.registerHelper("viewContent", function (c) {
    return Tyson.view(c);
});

Tyson.registerContentType({
    type: "trivialGrid",
    unit: function () { return { type: "trivialGrid", children: [] }; },
    cons: function (grid, obj) {
        grid = Obj(grid);
        grid.children.splice(0, 0, obj);
        return grid;
    },

    view: function (obj) {
        return _.map(obj.children, Tyson.view).join('');
    }
});

