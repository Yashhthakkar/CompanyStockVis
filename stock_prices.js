// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
var trellisWidth = svgWidth / 2 - padding.l - padding.r;
var trellisHeight = svgHeight / 2 - padding.t - padding.b;


// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') //Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

    var parseDate = d3.timeParse('%b %Y');
    // To speed things up, we have already computed the domains for your scales
    var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
    var priceDomain = [0, 223.02];

    // Scales
    var xScale = d3.scaleTime().domain(dateDomain).range([0, trellisWidth]);
    var yScale = d3.scaleLinear().domain(priceDomain).range([trellisHeight, 0]);

    // Generate Lines
    var line = d3.line().x(d => xScale(d.date)).y(d => yScale(d.price));

    // **** How to properly load data ****
    d3.csv('stock_prices.csv').then(function(dataset) {

    // **** Your JavaScript code goes here ****
        dataset.forEach(d => {
            d.date = parseDate(d.date);
            d.price = +d.price;
        });

    // Group by company    
    var nestedData = d3.group(dataset, d => d.company);

    // Log
    console.log(nestedData);

    // Group by company
    svg.selectAll('.trellis')
        .data(nestedData)
        .enter().append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r)
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });

    // Trellis chart for each company
    svg.selectAll('.company')
        .data(nestedData)
        .enter().append('g')
        .attr('class', 'company')
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        })
        .each(function(d) {
            var g = d3.select(this);

            // X and Y axis for each company's plot
            g.append('g')
                .attr('class', 'axis x-axis')
                .attr('transform', 'translate(0,' + trellisHeight + ')')
                .call(d3.axisBottom(xScale));
            g.append('g')
                .attr('class', 'axis y-axis')
                .call(d3.axisLeft(yScale));


            // Add grid lines
            var yGrid = d3.axisLeft(yScale)
                .tickSize(-trellisWidth, 0, 0)
                .tickFormat('');
            var xGrid = d3.axisTop(xScale)
                .tickSize(-trellisHeight, 0, 0)
                .tickFormat('');

            g.append('g')
                .attr('class', 'y-grid')
                .attr('transform', 'rotate(180,'+ trellisWidth/2 +','+ trellisHeight/2 +')')
                .call(yGrid)
                .selectAll('line')
                .style('stroke', 'white');

            g.append('g')
                .attr('class', 'x-grid')
                .attr('transform', 'rotate(180,'+ trellisWidth/2 +','+ trellisHeight/2 +')')
                .call(xGrid)
                .selectAll('line')
                .style('stroke', 'white');

             // Draw line chart for company
            g.append('path')
                .datum(d[1])
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', function() {
                    switch(d[0]) {
                        case 'MSFT': return 'blue';
                        case 'AMZN': return 'orange';
                        case 'IBM': return 'green';
                        case 'AAPL': return 'red';
                        default: return 'black';
                    }
                })
                .attr('stroke-width', 2);

            // Add company labels
            g.append('text')
                .attr('class', 'company-label')
                .attr('x', trellisWidth / 2)
                .attr('y', 110)
                .attr('text-anchor', 'middle')
                .attr('fill', function() {
                    switch(d[0]) {
                        case 'MSFT': return 'blue';
                        case 'AMZN': return 'orange';
                        case 'IBM': return 'green';
                        case 'AAPL': return 'red';
                        default: return 'black';
                    }
                })
                .text(d[0]);

            // Add axis labels
            g.append('text')
                .attr('class', 'x axis-label')
                .attr('x', trellisWidth / 2)
                .attr('y', trellisHeight + 34)
                .attr('text-anchor', 'middle')
                .text('Date (by Month)');
            g.append('text')
                .attr('class', 'y axis-label')
                .attr('x', -trellisHeight / 2)
                .attr('y', -40)
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .text('Stock Price (USD)');

        });
});
