/**
 * This is a rewrite and testing of main.js to have a better understanding of d3 cloud layout drawing
 * with reference of :
 * 1. http://bl.ocks.org/joews/9697914
 * 2. https://github.com/joews/d3-cloud
 * 
 * Reference on d3 library entering exiting:
 * 1. https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36
 * 
 * Reference on d3 update pattern:
 * https://www.d3indepth.com/enterexit/
 */
const WordCloudApp = ({
    name: 'Word Cloud',
    version: '1.1.2',
    width: 600,
    height: 500,
    scale: d3.scale.linear().range([20, 70]),
    fill: null,
    layout: null,
    /**
     * Initialize with word list provided by Vue
     * @param {<Array> Object} list array of words from Vue App
     */
    init(list) {
        const data = list;

        this.fill = d3.scale.category20();

        this.scale.domain([
            d3.min(data, (d) => d.weight),
            d3.max(data, (d) => d.weight),
        ]);

        const wordScale = this.scale;

        this.layout = d3.layout.cloud()
            .size([this.width, this.height])
            /*
            .words([
              "Hello", "world", "normally", "you", "want", "more", "words",
              "than", "this"].map(function(d) {
              return {text: d, size: 10 + Math.random() * 90, test: "haha"};
            }))
            */
            /**
            * Modified words source - 20/04/2020 Darky
            */
            .words(
                data.map(function (d) {
                    return { text: d.text, size: d.weight };
                }))
            .padding(0)
            .rotate(function () {
                /** 
                 * Double tilde explained: 
                 * https://stackoverflow.com/questions/4055633/what-does-double-tilde-do-in-javascript 
                 */
                //return ~~(Math.random() * 2) * 90;
                /**
                 * Updated to draw word horizontal (0 degree) - 20/04/2020 Darky
                 */
                return 0;
            })
            .font('Impact')
            .fontSize(function (d) { return wordScale(d.size); })
            // Modified 'draw' to 'this.helpes.draw' - 20/04/2020 Darky
            .on("end", this.helpers.drawCloud);

        this.layout.start();
    },
    helpers: {
        /**
         * Draw Word Cloud with provided words
         * @param {<Array>String} words an array of word to draw
         *
         * Note:
         * 05/06/2020 - try using this to avoid reinitializing layout because redundancy
         */
        drawCloud(words) {
            const layout = WordCloudApp.layout;
            const fill = WordCloudApp.fill;

            /** 
             * Construct word cloud SVG element
             * Comment Reference: http://bl.ocks.org/joews/9697914
             * 
             * let svg = 
              */
            d3.select("#wordCloud").append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function (d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        },
        /**
         * Draw updated word cloud
         * @param {<Array>String} words updated array of words
         */
        drawUpdate(list) {
            document.getElementById('wordCloud').innerHTML = '';
            WordCloudApp.init(list);
            return;

            /**
             * drawUpdate() draft
             * Unreachable code explained:
             *  Code below do update on the same wordCloud<div> element,
             *  but adding new word will overlap with other present word in the cloud.
             *  Hence the current workaround will be redrawing the whole word cloud.
             *  And I think that is the proper way too, since the d.max and d.min will probably
             *  change and just doing update will not able to rescale all of them.
             */
            const words = list.map((d) => ({ text: d.text, size: d.weight }));
            const width = WordCloudApp.width;
            const height = WordCloudApp.height;
            let wordScale = WordCloudApp.scale;
            let layout = WordCloudApp.layout;
            let fill = WordCloudApp.fill;

            wordScale.domain([
                d3.min(words, (d) => d.size),
                d3.max(words, (d) => d.size),
            ]);

            layout = d3.layout.cloud()
                .size([width, height])
                .words(words)
                .padding(0)
                .rotate(function () { return 0; })
                .text(function (d) { return d.text; })
                .font("Impact")
                .fontSize(function (d) { return wordScale(d.size); })
                .start();

            d3.select("svg")
                .selectAll("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function (d, i) { return fill(i); })
                .attr("transform", function (d) {
                    console.log(d);
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        },
    },
});

/**
 * The recreation of WordCloud App with better break down
 * @param {html element id} selector 
 */
function WordCloudApp2(selector) {
    // Set up properties
    this.name = "Word Cloud";
    this.version = "1.1.2"
    this.width = 600;
    this.height = 500;
    // fill is a color list
    this.fill = d3.scale.category20();
    // hard setting the lower and upper boundary of font size
    this.scale = d3.scale.linear().range([20, 70]);


    //Construct the word cloud's SVG element
    this.svg = d3.select(selector).append("svg")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .append("g")
        .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");


    // Draw the word cloud
    function draw(words) {
        // Select the svg's child element g and its child text
        let cloud = svg.selectAll("g text")
            .data(words, function (d) { return d.text; });

        // Entering words (when new word is added)
        cloud.enter()
            .append("text")
            // use style() you know to style the word cloud...
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
                // commented rotate
                // return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                return "translate(" + [d.x, d.y] + ")";
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
            .attr('font-size', 1)
            .remove();
    }

    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {

        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function (words) {
            // Reupdate scale max and min with the latest words
            scale.domain([
                d3.min(words, (d) => d.weight),
                d3.max(words, (d) => d.weight),
            ]);
            
            // Davies layout.cloud drawing starts here
            d3.layout.cloud().size([500, 500])
                .words(words.map(function (d) { return { text: d.text, size: d.weight }; }))
                .padding(5)
                // .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .rotate(function () { return 0; })
                .font("Impact")
                // layout.cloud does not have ".style" function
                .fontSize(function (d) { return scale(d.size); })
                // .style("font-size", function (d) { return scale(d.size) + "px"; })
                .on("end", draw)
                .start();
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
        /** Reference for this design
        * https://stackoverflow.com/questions/52235847/how-do-i-push-items-into-an-array-in-the-data-object-in-vuejs-vue-seems-not-to/52239532
        */
        word: {
            text: null,
            weight: null,
        },
        cloud: null,
    },
    /**
     * Reference for Hook Life Cycle in Vue
     * https://alligator.io/vuejs/component-lifecycle/
     */
    mounted() {
        // WordCloudApp.init(this.list);
        this.cloud = WordCloudApp2('#wordCloud');
        this.cloud.update(this.list);
    },
    methods: {
        /**
         * Arrow function => is not working in this context due to 'this'
         * binding to the window rather than to our Vue object.
         * Check link: https://gist.github.com/JacobBennett/7b32b4914311c0ac0f28a1fdc411b9a7
         *
         * Hence we will be changing the method pattern from :
         *  newMethod: () => {..}
         *
         * To :
         *  newMethod() {...}
         */

        /**
         * Add new word into Vue object List
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
            // WordCloudApp.helpers.drawUpdate(this.list);
            // Reference for this:
            // https://stackoverflow.com/a/44845603/7939633
            setTimeout(() => { this.cloud.update(this.list) }, 800);
        },
        /**
         * Delete a word from Vue object List
         * @param {number} index index number of the word to be delete
         */
        deleteWord(index) {
            this.list.splice(index, 1);
            setTimeout(() => { this.cloud.update(this.list) }, 800);
        },
        /**
         * Update word cloud with new word in the list
         */
        updateWordCloud() {
            /**
             * After done with v-model two way binding update
             */
            // WordCloudApp.helpers.drawUpdate(this.list);
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
    },
});
