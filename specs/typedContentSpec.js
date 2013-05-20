/*
 to run all specs with space-daisy, create an html file with this in it.

 <head>
   <title>Tyson Spec Runner</title>
 </head>
 <body>
   {{> specRunner }}
 </body>

 <template name="testContentType">
   <p class="testContentType">{{ text }}</p>
 </template>
*/

describe ("Typed Content", function () {

    var testContent = {};
    var testArticle = {}

    beforeEach(function () {
	testContent = {
            type: "testContentType",
            text: "test content type text"
        };
	testArticle = {
	    type: 'article',
	    markdown: '# heading',
	    slug: 'test-article'
	};
    });

    afterEach(function () {
        testContent = {};
	testArticle = {};
    });

    it("{{{ renderThisContent }}} matches template type to name", function () {
        /* {{> tysonDetail }} calls {{{ renderThisContent }}} */
        rendered = $(Template.tysonDetail(testContent));
        expect(rendered[0].tagName).toBe('P');
        expect(rendered[0].className).toBe('testContentType');
        expect(rendered.text()).toBe('test content type text');
    });

    it("handles markdown as with the article content type", function () {
	rendered = Template.tysonDetail(testArticle);
	expect(rendered).toBe('<h1>heading</h1>');
    });
    
});
