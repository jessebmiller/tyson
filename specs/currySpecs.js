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
        add3 = add.curry(3);
        expect(add3(10)).toBe(13);
    });
});

describe("Curry/Composition Path Handling Strategy", function () {

    var pathA = '';
    var pathB = '';
    var pathC = '';
    var thatGetPathname = TYSON.getPathname

    beforeEach(function () {
        pathA = "/mult/5/add/1/1"; // 5 * (1 + 1) = 10
        pathB = "/add/5/mult/1/1"; // 5 + (1 * 1) = 6
        pathC = "/add/10/10/";     // 10 + 10 = 20
        pathD = "/add/a/10";       // error (stupid NaN)
        /* big TODO: change the behavior of pathD from returning NaN to a type
           error through type checking these functions and their arguements */

        TYSON.getPathname = function () { return pathA }

        TYSON.pathHandlers.mult = function (a, b) {
            return parseInt(a, 10) * parseInt(b, 10);
        }
        TYSON.pathHandlers.add  = function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        }

        TYSON.defaultPathHandler = function (arg, e) {
            if (e) {
                return "internal error";
            }
            if (arg) {
                return arg;
            } else {
                return "default path handler";
            }
        }
    });

    afterEach(function () {
        pathA = '';
        pathB = '';
        pathC = '';
        TYSON.pathHandlers.mult  = {};
        TYSON.pathHandlers.add   = {};
        TYSON.defaultPathHandler = {};
        TYSON.getPahtname        = thatGetPathname;
    });

    it("Currys Curryable functions then composes the results", function () {
        expect(TYSON.composeFromPath(pathA)).toBe(10);
        expect(TYSON.composeFromPath(pathB)).toBe(6);
        expect(TYSON.composeFromPath(pathC)).toBe(20);
    });

    it("Is triggered by {{{ renderThisPage }}}", function () {
        expect(Template.thisPage()).toBe('10');
    });

    it("runs TYSON.defaultPathHandler for the root path", function () {
        expect(TYSON.composeFromPath("/")).toBe("default path handler");
        expect(TYSON.composeFromPath("/123")).toBe("123");
        expect(TYSON.composeFromPath("/123/")).toBe("123");
    });

    it("survives errors in path handling and in function calls", function () {
        expect(TYSON.composeFromPath("///")).toBe("internal error");
        expect(TYSON.composeFromPath(pathA)).toBe(10);
        expect(TYSON.composeFromPath(pathB)).toBe(6);
        expect(TYSON.composeFromPath(pathC)).toBe(20);
    });

    it("expects path handlers to handle NaNs. FIX WITH TYPES!", function () {
        /* this expects NaN to flow through currently. If tyson ever gets type
           checking added this should not be an issue (Maybe anyone?) */
        expect(isNaN(TYSON.composeFromPath(pathD))).toBe(true);
        /* big TODO: change the behavior of pathD from returning NaN to a type
           error through type checking these functions and their arguements */
    });
});
