/**
 * This is a rewrite and testing of main.js to have a better understanding of d3 cloud layout drawing
 * with reference of :
 * 1. http://bl.ocks.org/joews/9697914
 * 2. https://github.com/joews/d3-cloud
 * 
 * Reference on d3 library entering exiting:
 * 1. https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36
 * 2. https://www.d3indepth.com/enterexit/
 */

/**
 * Initialize Word Cloud App
 * @param {string} selector - html element id
 * 
 * Note: This is the recreation of Word Cloud App with enhanced break down and comments
 */
function WordCloudApp(selector) {
    // Set up properties
    this.name = "Word Cloud";
    this.version = "1.1.2"
    this.width = 600;
    this.height = 500;
    // fill is a color list
    this.fill = d3.scale.category20();
    // hard setting the lower and upper boundary of font size (update to dynamic in the future)
    this.scale = d3.scale.linear().range([20, 70]);


    //Construct the word cloud's SVG element
    this.svg = d3.select(selector).append("svg")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .append("g")
        // Put the word cloud in the center
        .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");


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
            .style('font-size', 1)
            .remove();
    }

    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {
        helpers: {
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
                // Update scale max and min with the latest words' weight
                scale.domain([
                    d3.min(words, (d) => d.weight),
                    d3.max(words, (d) => d.weight),
                ]);

                // Davies layout.cloud drawing starts here
                d3.layout.cloud().size([width, height])
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
        // update to an array in the future
        cloud: null,
    },
    /**
     * Reference for Vue's Hook Life Cycle
     * https://alligator.io/vuejs/component-lifecycle/
     */
    mounted() {
        this.cloud = WordCloudApp('#wordCloud');
        this.cloud.helpers.update(this.list);
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

            // Reference to use timeout in Vue:
            // https://stackoverflow.com/a/44845603/7939633
            setTimeout(() => { this.cloud.helpers.update(this.list) }, 800);
        },
        /**
         * Delete a word from Vue object List
         * @param {numeric} index index number of the word to be delete
         * Note: should be using special id to delete when multiple word cloud is added
         */
        deleteWord(index) {
            this.list.splice(index, 1);
            setTimeout(() => { this.cloud.helpers.update(this.list) }, 800);
        },
        /**
         * Update word cloud with new word in the list
         * Note: V-model establish two way binding, so this function is not require
         */
        updateWordCloud() { },
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
