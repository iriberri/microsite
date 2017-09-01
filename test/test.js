console.log(myVue);
QUnit.test("JSON Validity Test Suite", function (assert) {
    // Json file validity tests
    $.ajaxSetup({
        async: false
    });
    var jsonpass = false;
    $.getJSON("/microsite/template_categories.json", function (json) {
        jsonpass = true;
    });
    assert.ok(jsonpass, "JSON Validity for: \'/microsite/template_categories.json is a valid JSON\'");

    jsonpass = false;
    $.getJSON("/microsite/template_datasets.json", function (json) {
        jsonpass = true;
    });
    assert.ok(jsonpass, "JSON Validity for: \'/microsite/template_datasets.json\'");
    ///////
    jsonpass = false;
    $.getJSON("/microsite/json/NTL.json", function (json) {
        jsonpass = true;
    });
    assert.ok(jsonpass, "JSON Validity for: \'/microsite/json/NTL.json JSON validity\'");

    $.ajaxSetup({
        async: true
    });
});
QUnit.test("Socrata Call Test", function (assert) {
    $.ajaxSetup({
        async: false
    });
    // search term test
    var searchTerm = "field test";
    var responseCode;
    console.log(myVue.url + searchTerm + '&search_context=' + myVue.domain);
    $.get(myVue.url + searchTerm + '&search_context=' + myVue.domain, function (data, xhr) {
        responseCode = xhr;
    });
    assert.equal(responseCode, "success", "Socrata API Call returns success");

    $.ajaxSetup({
        async: true
    });
});