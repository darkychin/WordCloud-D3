/**
 * Word Cloud App
 * 
 * Basic Reference:
 * 1. https://www.youtube.com/watch?v=1KEiTIu0k44
 * 
 * D3 and layout.cloud drawing breakdown and structure reference:
 * 1. http://bl.ocks.org/joews/9697914
 * 2. https://github.com/joews/d3-cloud
 * 
 * Reference of D3 library entering exiting:
 * 1. https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36
 * 2. https://www.d3indepth.com/enterexit/
 */

/**
 * Initialize Word Cloud App
 * @param {string} selector - html element id
 */
function WordCloudApp(selector) {
    // please update everything here into let 11/08/2020 Darky
    let wordLimit = 15;
    // Set up properties
    this.name = "Word Cloud";
    this.version = "0.1"
    this.width = 600;
    this.height = 500;
    // fill is a color list
    this.fill = d3.scale.category20();
    // hard setting the lower and upper boundary of font size (update to dynamic in the future)
    this.scale = d3.scale.linear().range([20, 70]);
    this.rotateDegree = 0;


    //Construct the word cloud's SVG element

    // update note: this.svg will only contain <g> because that is the latest appended element, 
    // and d3 will return it after appending, so please change it into new name.
    // other than than, the multi wordcloud issue might also arise when using d3 to select the correct svg, unless using unique ID.
    this.svg = d3.select(selector).append("svg")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .append("g")
        // Put the word cloud in the center
        .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");

    this.realSVG = d3.select(selector + " svg");

    /**
     * Restyle the SVG with width and height of WordCloudApp
     *  STOPS here boi 14/06/2020 Darky
     */
    function styleSVG() {
        // console.log(svg);
        // console.log(d3.select("#wordCloud svg"));
        // svg.style("width", width + "px")
        //     .style("height", height + "px")
        //     .append("g")
        //     .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
        realSVG.style("width", width + "px")
            .style("height", height + "px")
            .select("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
    }
    /**
     * Draw word cloud with D3 while inherit settings from layout.cloud
     * @param {string[]} words - an array of new words to draw
     * @param {string} words[].text - word
     * @param {numeric} words[].weight - word's weight
     */
    function draw(words) {
        // Select the svg's child element g and its child text
        let cloud = svg.selectAll("g text")
            .data(words, function (d) { return d.text; });

        // Entering words (when new word is added)
        cloud.enter()
            .append("text")
            // use style() you know, to style the word cloud...
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            // this is the initial font size when a word is entered
            .style('font-size', 1)
            .text(function (d) { return d.text; });

        // Entering new words and modify existing words with animations(transition)
        cloud.transition()
            .duration(600)
            // grow font size following the scale
            .style("font-size", function (d) { return d.size + "px"; })
            // move word into new position
            .attr("transform", function (d) {
                // uncommented rotate -17/08/2020
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                // commented rotate -17/08/2020
                // return "translate(" + [d.x, d.y] + ")";
            })
            // restyle the color of the words
            .style("fill", function (d, i) { return fill(i); })
            .style("fill-opacity", 1);

        // Exiting words
        cloud.exit()
            .transition()
            .duration(200)
            // fade exit words
            .style('fill-opacity', 1e-6)
            // shrink exit words
            .style('font-size', 1)
            .remove();
    }

    // Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {
        helpers: {
            setup: function (settings) {

                function getRotateDegree(settings) {

                    let rotateDegree = 0;

                    if (settings.rotate === 2) {
                        rotateDegree = settings.rotateDegree;
                    }

                    return rotateDegree;
                }

                width = settings.width || 600;
                height = settings.height || 500;
                wordLimit = settings.wordLimit;
                scale = d3.scale.linear().range([settings.minFontSize, settings.maxFontSize]);
                rotateDegree = getRotateDegree(settings);
                styleSVG();
            },
            /**
             * Public function to call to update the word cloud with new words or weight
             * @param {string[]} words - an array of new words to draw
             * @param {string} words[].text - word
             * @param {numeric} words[].weight - word's weight
             * 
             * Note from Joews:
             * Recompute the word cloud for a new set of words. This method will
             * asycnhronously call draw when the layout has been computed.
             */
            update: function (words) {

                let updateWords = words.slice(0, wordLimit);

                // Update scale max and min with the latest words' weight
                scale.domain([
                    d3.min(updateWords, (d) => d.weight),
                    d3.max(updateWords, (d) => d.weight),
                ]);

                // Davies layout.cloud drawing starts here
                d3.layout.cloud().size([width, height])
                    .words(updateWords.map(function (d) { return { text: d.text, size: d.weight }; }))
                    .padding(5)
                    /** 
                    * Double tilde explained: 
                    * https://stackoverflow.com/questions/4055633/what-does-double-tilde-do-in-javascript 
                    */
                    // .rotate(function () { return ~~(Math.random() * 2) * 90; })
                    // 0 means horizontal
                    // .rotate(function () { return 0; })
                    .rotate(function () { return rotateDegree; })
                    .font("Impact")
                    // layout.cloud does not have ".style" function
                    .fontSize(function (d) { return scale(d.size); })
                    // .style("font-size", function (d) { return scale(d.size) + "px"; })
                    .on("end", draw)
                    .start();
            }
        }

    }
}

/**
* Main Vue App
*/
const app = new Vue({
    el: '#app',
    data: {
        title: 'CRUD-Word Cloud',
        list: [
            { text: 'This', weight: 50 },
            { text: 'is', weight: 45 },
            { text: 'my', weight: 40 },
            { text: 'first', weight: 35 },
            { text: 'Vue.js', weight: 30 },
            { text: 'app', weight: 30 },
            { text: 'Thank', weight: 25 },
            { text: 'You', weight: 20 },
        ],
        /** Reference for this design on word
        * https://stackoverflow.com/questions/52235847/how-do-i-push-items-into-an-array-in-the-data-object-in-vuejs-vue-seems-not-to/52239532
        */
        word: {
            text: null,
            weight: null,
        },
        // settings holder obj
        settings: {
            width: null,
            height: null,
            wordLimit: 15,
            minFontSize: 20, 
            maxFontSize: 70,

            /** 
             * @type {number} rotate mode: 0 - default, 1 - random, 2 - with degree 
             */
            rotate: 0, 
            rotateDegree: 0,
        },
        // update to an array in the future in parent component
        cloud: null,
    },
    /**
     * Reference for Vue's Hook Life Cycle
     * https://alligator.io/vuejs/component-lifecycle/
     */
    mounted() {
        this.cloud = WordCloudApp('#wordCloud');
        this.cloud.helpers.update(this.list);
        // stop here : 11/07/2020 
        // panzoom(document.getElementById("wordCloud").querySelector("g"));
    },
    methods: {
        /**
         * Arrow function => is not working in this context due to 'this'
         * binding to the window rather than to our Vue object.
         * Reference: https://gist.github.com/JacobBennett/7b32b4914311c0ac0f28a1fdc411b9a7
         *
         * Hence we will be changing the method pattern from :
         *  newMethod: () => {..}
         *
         * To :
         *  newMethod() {...}
         */

        setSettings() {
            this.cloud.helpers.setup(this.settings);
            this.updateWordCloud();
        },
        /**
         * Add new word into Vue object list
         */
        addNewWord() {
            function resetWordInputBox() {
                return {
                    text: null,
                    weight: null,
                };
            }

            this.list.push({
                text: this.word.text,
                weight: this.word.weight,
            });
            this.word = resetWordInputBox();
            this.updateWordCloud();
        },
        /**
         * Delete a word from Vue object List
         * @param {numeric} index index number of the word to be delete
         * Note: should be using special id to delete when multiple word cloud is added
         */
        deleteWord(index) {
            this.list.splice(index, 1);
            this.updateWordCloud();
        },
        /**
         * Update word cloud with word in the list
         */
        updateWordCloud() {
            // Reference to use timeout in Vue:
            // https://stackoverflow.com/a/44845603/7939633
            setTimeout(() => { this.cloud.helpers.update(this.list) }, 800);
        },
    },
    dragWord() {

    },
    dropWord(event) {
        console.log(event.target.parentNode);
    },
    moveWord(index, newIndex) {
        const temp = this.list.splice(index, 1)[0];
        this.list.splice(newIndex, 0, temp);
    },
    loadWord() {

    },
});
