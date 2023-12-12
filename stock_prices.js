var svg = d3.select('svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');


var padding = {t: 20, r: 20, b: 60, l: 60};

var trellisWidth = svgWidth / 2 - padding.l - padding.r;
var trellisHeight = svgHeight / 2 - padding.t - padding.b;


svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C'])
    .enter()
    .append('rect') 
    .attr('class', 'background')
    .attr('width', trellisWidth) 
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

    var parseDate = d3.timeParse('%b %Y');
    var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
    var priceDomain = [0, 223.02];

    var xScale = d3.scaleTime().domain(dateDomain).range([0, trellisWidth]);
    var yScale = d3.scaleLinear().domain(priceDomain).range([trellisHeight, 0]);

    var line = d3.line().x(d => xScale(d.date)).y(d => yScale(d.price));

    d3.csv('stock_prices.csv').then(function(dataset) {

        dataset.forEach(d => {
            d.date = parseDate(d.date);
            d.price = +d.price;
        });

    var nestedData = d3.group(dataset, d => d.company);

    console.log(nestedData);

    svg.selectAll('.trellis')
        .data(nestedData)
        .enter().append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r)
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });

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

            g.append('g')
                .attr('class', 'axis x-axis')
                .attr('transform', 'translate(0,' + trellisHeight + ')')
                .call(d3.axisBottom(xScale));
            g.append('g')
                .attr('class', 'axis y-axis')
                .call(d3.axisLeft(yScale));


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
