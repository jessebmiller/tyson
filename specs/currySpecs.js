/* to run these specs with space-daisy, create an html file with this in it.

   <head>
     <title>Tyson Spec Runner</title>
   </head>
   <body>
     {{> specRunner }}
   </body>

*/

describe("Curried function application", function () {

    function add(a, b) { return a + b }

    it("returns a function with the first argument filled in", function () {
        var add3 = add.curry(3);
        expect(add3(10)).toBe(13);
    });
});

describe("Curry/Composition Path Handling Strategy", function () {

    var pathA = '';
    var pathB = '';
    var pathC = '';
    var pathD = '';
    var pathE = '';
    var pathF = '';
    var pathG = '';
    var pathH = '';
    var thatGetPathname = TYSON.getPathname;

    beforeEach(function () {
        pathA = "/mult/5/add/1/1"; // 5 * (1 + 1) = 10
        pathB = "/add/5/mult/1/1"; // 5 + (1 * 1) = 6
        pathC = "/add/10/10/";     // 10 + 10 = 20
        pathD = "/add/a/10";       // error (stupid NaN)
        pathE = "/dubl/add/3/1";   // 2(3 + 1) = 8
        pathF = "/func";           // returns 'func'
        pathG = "/add/1/concat/1/2/3"; // 1 + 123 = 124
        pathH = '/concat/yes-/we-/can'; // yes-we-can
        /* big TODO: change the behavior of pathD from returning NaN to a type
           error through type checking these functions and their arguements */

        TYSON.getPathname = function () { return pathA };

        TYSON.pathHandlers.mult = function (a, b) {
            return parseInt(a, 10) * parseInt(b, 10);
        };

        TYSON.pathHandlers.add  = function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        };

        TYSON.pathHandlers.dubl = function (a) {
            return parseInt(a, 10) * 2;
        };

        TYSON.pathHandlers.func = function () {
            return 'func called';
        };

        TYSON.pathHandlers.concat = function (a, b, c) {
            return a+b+c;
        };

        TYSON.defaultPathHandler = function (arg, e) {
            if (e) {
                return "internal error";
            }
            if (arg) {
                return 'got arguement: ' + arg;
            } else {
                return "default path handler";
            }
        };
    });

    afterEach(function () {
        TYSON.pathHandlers.mult  = {};
        TYSON.pathHandlers.add   = {};
        TYSON.defaultPathHandler = {};
        TYSON.getPahtname        = thatGetPathname;
    });

    it("Currys Curryable functions then composes the results", function () {
        expect(TYSON.composeFromPath(pathA)).toBe(10);
        expect(TYSON.composeFromPath(pathB)).toBe(6);
        expect(TYSON.composeFromPath(pathC)).toBe(20);
        expect(TYSON.composeFromPath(pathG)).toBe(124);
        expect(TYSON.composeFromPath(pathH)).toBe("yes-we-can");
    });

    it("can handle mixes of functions and args", function () {
        var path = "/add/mult/2/2/add/mult/1/1/2"; // (2*2) + ((1*1) + 2) = 7
        expect(TYSON.composeFromPath(path)).toBe(7);
    });

    it("Is triggered by {{{ renderThisPage }}}", function () {
        expect(Template.thisPage()).toBe('10');
    });

    it("runs TYSON.defaultPathHandler for the root path", function () {
        expect(TYSON.composeFromPath("/")).toBe("default path handler");
        expect(TYSON.composeFromPath("/123")).toBe("got arguement: 123");
        expect(TYSON.composeFromPath("/123/")).toBe("got arguement: 123");
    });

    it("survives errors in path handling and in function calls", function () {
        expect(TYSON.composeFromPath("///")).toBe("internal error");
        expect(TYSON.composeFromPath(pathA)).toBe(10);
        expect(TYSON.composeFromPath(pathB)).toBe(6);
        expect(TYSON.composeFromPath(pathC)).toBe(20);
    });

    it("Does not curry functions that take one arguement", function () {
        expect(TYSON.composeFromPath(pathE)).toBe(8);
    });

    it("calls the function if the path is just a function", function () {
        expect(TYSON.composeFromPath(pathF)).toBe('func called');
    });

    it("expects path handlers to handle NaNs. FIX WITH TYPES!", function () {
        /* this expects NaN to flow through currently. If tyson ever gets type
           checking added this should not be an issue (Maybe anyone?) */
        expect(isNaN(TYSON.composeFromPath(pathD))).toBe(true);
        /* big TODO: change the behavior of pathD from returning NaN to a type
           error through type checking these functions and their arguements */
    });
});
