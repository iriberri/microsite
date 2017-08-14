new Vue({

    el: '#searchTerms',

    data: {
        background_image: '',
        search_placeholder: '',

        // functional variables - do not change
        hideResults: 'True',
        items: '',
        resultsJson: [],
        NTLJson: [],

        // data set topics and search domain
        // modify these values to your preference
        url: 'https://api.us.socrata.com/api/catalog/v1?q=',
        domain: '',
        query: '',

        // Lists for dynamic data
        buttonlabels: [],
        buttonTags: [],
        altTextButtonIcons: [],
        imgIcons: [],
        datasets: [],
        urls: [],
        images: [],
        srcs: [],
        altTextFDS: [],
        datasetNames: [],
        datasetDesc: []
    },

    // Function runs on page load
    created: function () {
        // Loads the initial static file of NTL Data
        this.addNTL();

        // Loads the template data
        this.load_json();

        this.create_buttons();
        this.loadFeaturedDatasets();
    },

    methods: {
        // Method used for sorting json data when DTG and NTL are combined
        compare: function (a, b) {
            var self = this;
            const titleA = a.name.toUpperCase();
            const titleB = b.name.toUpperCase();

            let comparison = 0;
            if (titleA > titleB) {
                comparison = 1;
            } else if (titleA < titleB) {
                comparison = -1;
            }
            return comparison;
        },

        // function loads data.json and stores all values locally, function operates sync on load to prevent timing issue
        load_json: function () {
            var self = this;
            $.ajaxSetup({
                async: false
            });
            // Extracts all information out of data.json
            $.getJSON("template_categories.json", function (json) {
                var i;
                self.domain = json.domain;
                self.background_image = json.background_image;
                self.search_placeholder = json.search_text;

                for (i = 0; i < Math.min(json.maxButtonCount, json.buttons.length) ; i++) {
                    self.buttonlabels[i] = json.buttons[i].CategoryName;
                    self.imgIcons[i] = json.buttons[i].imgIcons;
                    var tagList = [];
                    if (json.buttons[i].tags.length !== undefined) {
                        for (tagIdx = 0; tagIdx < json.buttons[i].tags.length; tagIdx++) {
                            tagList[tagIdx] = json.buttons[i].tags[tagIdx];
                        }
                    }
                    self.buttonTags[i] = tagList;
                    self.altTextButtonIcons[i] = json.buttons[i].altText;
                }
            });
            // Extracts all information from datasets.json
            $.getJSON("template_datasets.json", function (json) {
                var i;
                for (i = 0; i < Math.min(json.maxDatasetCount, json.datasets.length) ; i++) {
                    self.urls[i] = json.datasets[i].url;
                    self.images[i] = json.datasets[i].image;
                    self.altTextFDS[i] = json.datasets[i].altText;
                    self.datasetNames[i] = json.datasets[i].name;
                    self.datasetDesc[i] = json.datasets[i].description;
                }
            });
            $.ajaxSetup({
                async: true
            });
        },
        // Function for loading the js file instead of json for running without server
        load_data: function () {
            var self = this;

            self.domain = ws_data.domain;
            self.background_image = ws_data.background_image;
            self.search_placeholder = ws_data.search_text;

            for (i = 0; i < Math.min(ws_data.maxButtonCount, ws_data.buttons.length) ; i++) {
                this.buttonlabels[i] = ws_data.buttons[i].CategoryName;
                this.imgIcons[i] = ws_data.buttons[i].imgIcons;
                this.altTextButtonIcons[i] = ws_data.buttons[i].altText;
            }

            for (i = 0; i < Math.min(ws_data.maxDatasetCount, ws_data.datasets.length) ; i++) {
                this.urls[i] = ws_data.datasets[i].url;
                this.images[i] = ws_data.datasets[i].image;
                this.altTextFDS[i] = ws_data.datasets[i].altText;
            }
        },

        // gets the JSON data for a search term and sets it to the "items" variable
        search: function (search_query) {
            var self = this;
            var buttonIdx;
            var newQ = search_query;
            for (buttonIdx = 0; buttonIdx < self.buttonlabels.length; buttonIdx++) {
                if (search_query === self.buttonlabels[buttonIdx]) {
                    var tagIdx;
                    if (self.buttonTags[buttonIdx] !== undefined) {
                        for (tagIdx = 0; tagIdx < self.buttonTags[buttonIdx].length; tagIdx++) {
                            newQ = newQ + "+" + self.buttonTags[buttonIdx][tagIdx];
                        }
                    }
                }
            }
            $.get(self.url + newQ + '&search_context=' + self.domain, function (data) {
                self.resultsJson = [];
                self.items = data;
                self.addSocratatoJson();
                self.addNTLtoJson(search_query);
                self.resultsJson.sort(self.compare);
            });
            this.query = search_query;
            this.hideResults = "False";
        },

        // Loads json file for NTL data, called on webpage load (will be used until NTL becomes api called)
        addNTL: function () {
            var itemCountNTL;
            var self = this;

            $.getJSON("json/NTL.json", function (json) {
                for (itemCountNTL = 0; itemCountNTL < json.datasets.length; itemCountNTL++) {
                    var tempJson = {};
                    tempJson["name"] = json.datasets[itemCountNTL].title;
                    tempJson["description"] = json.datasets[itemCountNTL].Abstract;

                    var tagCount;
                    var allTags = [];
                    var RESEARCHRESULTS = "Research Results";
                    
                    allTags[0] = RESEARCHRESULTS;
                    for (tagCount = 0; tagCount < json.datasets[itemCountNTL].tags.length; tagCount++) {
                        allTags[tagCount+1] = json.datasets[itemCountNTL].tags[tagCount];
                    }
                    tempJson["tags"] = allTags;
                    tempJson["tags"].sort();
                    tempJson["link"] = json.datasets[itemCountNTL].URL;
                    self.NTLJson.push(tempJson);
                }
            });
        },

        // searches ntl files for match based on tag (will be used until NTL becomes API called)
        addNTLtoJson: function(search_query) {
            var itemCountNTL;
            var self = this;
            var buttonIdx;
            var tempCount;
            // match query to button
            for (tempCount = 0; tempCount < self.buttonlabels.length; tempCount++) {
                if (search_query === self.buttonlabels[tempCount]) {
                    buttonIdx = tempCount;
                }
            }
            for (itemCountNTL = 0; itemCountNTL < self.NTLJson.length; itemCountNTL++) {
                for (tagCount = 0; tagCount < self.NTLJson[itemCountNTL].tags.length; tagCount++) {
                    // Checks if tag matches query
                    if (self.NTLJson[itemCountNTL].tags[tagCount].toLowerCase().search(search_query.toLowerCase()) > -1) {
                        self.resultsJson.push(self.NTLJson[itemCountNTL]);
                    }
                    else {
                        var buttonCount;
                        if (self.buttonTags[buttonIdx] !== undefined) {
                            for (buttonCount = 0; buttonCount < self.buttonTags[buttonIdx].length; buttonCount++) {
                                if (self.NTLJson[itemCountNTL].tags[tagCount].toLowerCase().search(self.buttonTags[buttonIdx][buttonCount].toLowerCase()) > -1) {
                                    self.resultsJson.push(self.NTLJson[itemCountNTL]);
                                    buttonCount = self.buttonTags[buttonIdx].length;
                                }
                            }
                        }
                    }
                }
            }
        },

        // adds socrata data together with NTL for one query display
        addSocratatoJson: function() {
            var itemCount;
            var self = this;

            for (itemCount = 0; itemCount < self.items.results.length; itemCount++) {
                var tempJson = {};
                tempJson["name"] = self.items.results[itemCount].resource.name;
                tempJson["description"] = self.items.results[itemCount].resource.description;
                var tagCount;
                var allTags = []
                for (tagCount = 0; tagCount < self.items.results[itemCount].classification.domain_tags.length; tagCount++) {
                    allTags[tagCount] = self.items.results[itemCount].classification.domain_tags[tagCount];
                }
                tempJson["tags"] = allTags;
                tempJson["tags"].sort();
                tempJson["link"] = self.items.results[itemCount].link;
                self.resultsJson.push(tempJson);
            }
        },

        // Function generates html for buttons and all attributes attached to it
        create_buttons: function () {
            var buttonCount = 0;
            var self = this;
            ////////////////
            // Bulma wrapper section
            var bulmaWrapper = document.createElement("div");
            bulmaWrapper.setAttribute("class", "columns is-multiline");
            bulmaWrapper.setAttribute("id", "bulmaDataset");

            var datasetArea = document.getElementById("categoryArea");
            datasetArea.appendChild(bulmaWrapper);

            // Loops through each term/category for buttons in the provided template
            for (i = 0; i < Math.min(10, self.buttonlabels.length) ; i++) {
                var myBreak = document.createElement("br");
                var myBreak2 = document.createElement("br");
                // bulma columns
                var bulmaCol = document.createElement("div");
                bulmaCol.setAttribute("id", "bulmaCategories");
                bulmaCol.setAttribute("class", "column is-one-quarter");
                bulmaCol.setAttribute("style", "margin: 0px");

                var imageHTML = document.createElement("IMG");
                imageHTML.setAttribute("src", self.imgIcons[i]);
                imageHTML.setAttribute("alt", self.altTextButtonIcons[i]);
                imageHTML.setAttribute("style", "width: 50px; height: 50px");
                imageHTML.setAttribute("align", "left");

                var btn = document.createElement("button");
                btn.setAttribute("class", "topic");
                btn.setAttribute("id", "bterm" + i);
                btn.setAttribute("v-on:click", "search(" + "buttonlabels[" + i + "])");
                btn.style.verticalAlign = "middle";
                btn.appendChild(imageHTML);

                var paragraphStyle = document.createElement("p");
                paragraphStyle.innerHTML = self.buttonlabels[i];
                btn.appendChild(paragraphStyle);

                var myArea = document.getElementsByClassName("contentArea");
                bulmaCol.appendChild(btn);
                bulmaWrapper.appendChild(bulmaCol);

                if (self.buttonlabels[i] == "") {
                    document.getElementById("bterm" + i).parentElement.removeChild(document.getElementById("bterm" + i));
                } else {
                    buttonCount++;
                    if (buttonCount % 4 == 0 && buttonCount != self.buttonlabels.length) {
                        myArea[0].appendChild(myBreak);
                        myArea[0].appendChild(myBreak2);
                    }
                }
            }
        },

        // auto-hides the search results section if True
        // auto-hides the topic buttons and featured data sets if False
        showFeatured: function () {
            this.query = '';
            this.hideResults = "True";
        },

        // This function loads all featured data sets as html with all attributes
        loadFeaturedDatasets: function () {
            var self = this;
            // bulma column list wrapper
            var bulmaWrapper = document.createElement("div");
            bulmaWrapper.setAttribute("class", "columns is-multiline");
            bulmaWrapper.setAttribute("id", "bulmaDataset");

            var datasetArea = document.getElementById("datasetArea");
            datasetArea.appendChild(bulmaWrapper);
            for (i = 0; i < this.urls.length; i++) {
                var dataDiv = document.createElement("div");
                dataDiv.setAttribute("id", "fds" + i);
                bulmaWrapper.appendChild(dataDiv);
            }
            for (i = 0; i < this.urls.length; i++) {
                var dataId = self.urls[i].substring(self.urls[i].length - 9, self.urls[i].length);
                this.srcs[i] = "https://data.transportation.gov/w/" + dataId + "/m7rw-edbr?cur=u0WX7_BAfhk&from=root"
                var jsonurl = "https://" + this.domain + "/views/" + dataId + ".json";
                $.get(jsonurl, function (data) {
                    var datasetArea = document.getElementById("bulmaDataset");
                    var aRefLink = document.createElement("a");
                    var datasetName = document.createElement("p");
                    var imgtoBind = document.createElement("IMG");
                    var datasetDesc = document.createElement("p");
                    var myBreak = document.createElement("br");

                    // Allows for each source to be matched by index due to async timing causing mismatch
                    var indexofSource = 0;
                    for (j = 0; j < self.urls.length; j++) {
                        var currentSrc = self.urls[j].substring(self.urls[j].length - 9, self.urls[j].length);
                        if (currentSrc == data.id) {
                            indexofSource = j;
                        }
                    }

                    // bulma columns
                    var bulmaCol = document.getElementById("fds" + indexofSource);
                    bulmaCol.setAttribute("class", "column is-one-third");
                    bulmaCol.setAttribute("style", "border-style:ridge; margin: 0px");

                    aRefLink.setAttribute("href", self.urls[indexofSource]);
                    // DataSets name is set and stored
                    datasetName.setAttribute("class", "featuredHeading");
                    datasetName.innerHTML = (self.datasetNames[indexofSource] !== "") ? self.datasetNames[indexofSource] : data.name;
                    aRefLink.appendChild(datasetName);
                    // Sets all attributes of the image
                    imgtoBind.setAttribute("src", self.images[indexofSource]);
                    imgtoBind.setAttribute("alt", self.altTextFDS[indexofSource]);
                    imgtoBind.setAttribute("class", "featuredDataThumbnail");
                    // DataSets description is set and stored
                    datasetDesc.setAttribute("style", "color: black;");
                    datasetDesc.innerHTML = (self.datasetDesc[indexofSource] !== "") ? self.datasetDesc[indexofSource] :
                                            data.description == undefined ? "No Description Available" :
                                            data.description.length > 150 ? data.description.substring(0, 150) + "..." :
                                            data.description;
                    // Html is appended and pieced together
                    aRefLink.appendChild(imgtoBind);
                    aRefLink.appendChild(datasetDesc);
                    aRefLink.appendChild(myBreak);
                    bulmaCol.appendChild(aRefLink);
                    self.datasets[indexofSource] = data;
                });
            }
        }
    }
});
