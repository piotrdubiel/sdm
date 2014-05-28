var width = 1024,
    height = 700;

var input_count = 25;
var layers = 2;

function find_name(nodes, name) {
    for (var n in nodes) {
        if (nodes[n].name == name) {
            return nodes[n];
        }
    }
}

var svg = d3.select("svg.convolutional-network")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(150,0)");

var input_scale = d3.scale.linear()
    .domain([0, 5])
    .range([0,  height - 200]);

var output_scale = d3.scale.linear()
    .domain([0, 3])
    .range([0,  height - 400]);


var input_square = svg.selectAll("rect.input")
    .data(d3.range(25))
    .enter().append("rect")
    .attr("class", "input hidden")
    .attr("x", function(d) { return input_scale(Math.floor(d / 5)); })
    .attr("y", function(d) { return input_scale(d % 5) + 100; })
    .attr("width",  function(d) { return input_scale(d % 5 + 1) - input_scale(d % 5); })
    .attr("height", function(d) { return input_scale(d % 5 + 1) - input_scale(d % 5); });

var output_square = svg.selectAll("rect.output")
    .data(d3.range(9))
    .enter().append("rect")
    .attr("class", "input hidden")
    .attr("x", function(d) { return output_scale(Math.floor(d / 3)) + height / 2 + 200; })
    .attr("y", function(d) { return output_scale(d % 3) + 120; })
    .attr("width",  function(d) { return output_scale(d % 3 + 1) - output_scale(d % 3); })
    .attr("height", function(d) { return output_scale(d % 3 + 1)- output_scale(d % 3); });


function drawConvolution() {
    var inputs = d3.scale.ordinal()
        .domain(d3.range(input_count))
        .rangeRoundBands([10, height - 20], 0, 0);

    var depth = d3.scale.ordinal()
        .domain([0, layers - 1])
        .range([0, height]);

    svg.selectAll("rect.input")
        .attr("class", "input hidden");

    svg.selectAll("rect.output")
        .attr("class", "output hidden");

    svg.selectAll("rect.window")
        .attr("class", "window hidden");

    d3.json("/data/convolution.json", function(error, root) {
        var nodes = root.nodes;
        var links = [];
        var links_square = [];

        for (var i = 0, l = nodes.length; i < l; i ++) {
            if (nodes[i].parent) {
                for (var j = 0; j < nodes[i].parent.length; j++) {
                    links_square.push({
                        id: nodes[i].id+"x"+find_name(nodes, nodes[i].parent[j]).id,
                        source: {
                            "x": input_scale(Math.floor(nodes[i].id / 5)) + (input_scale(nodes[i].id % 5 + 1) - input_scale(nodes[i].id % 5)) / 2,
                            "y": input_scale(nodes[i].id % 5) + 100 + (input_scale(nodes[i].id % 5 + 1) - input_scale(nodes[i].id % 5)) / 2,
                            "id": nodes[i].id
                        },
                        target: {
                            "x": output_scale(Math.floor(find_name(nodes, nodes[i].parent[j]).id / 3)) + height / 2 + 200 + (output_scale(find_name(nodes, nodes[i].parent[j]).id % 3 + 1) - output_scale(find_name(nodes, nodes[i].parent[j]).id % 3)) / 2,
                            "y": output_scale(find_name(nodes, nodes[i].parent[j]).id % 3) + 120 + (output_scale(find_name(nodes, nodes[i].parent[j]).id % 3 + 1) - output_scale(find_name(nodes, nodes[i].parent[j]).id % 3)) / 2
                        },
                        "class": "target-" + find_name(nodes, nodes[i].parent[j]).name
                    });
                }
            }
        }


        for (var i = 0, l = nodes.length; i < l; i ++) {
            if (nodes[i].parent) {
                for (var j = 0; j < nodes[i].parent.length; j++) {
                    links.push({
                        id: nodes[i].id+"x"+find_name(nodes, nodes[i].parent[j]).id,
                        source: {
                            "x": depth(nodes[i].layer),
                            "y": inputs(nodes[i].id)
                        },
                        target: {
                            "x": depth(find_name(nodes, nodes[i].parent[j]).layer),
                            "y": inputs(find_name(nodes, nodes[i].parent[j]).id) + depth(find_name(nodes, nodes[i].parent[j]).layer) / 3.5
                        },
                        "class": "target-" + find_name(nodes, nodes[i].parent[j]).name
                    });
                }
            }
        }
        
        var windows = svg.selectAll(".window")
            .data(links_square)
            .enter().append("rect")
            .attr("x", function(d) { return input_scale(Math.floor(d.source.id / 5)); })
            .attr("y", function(d) { return input_scale(d.source.id % 5) + 100; })
            .attr("width",  function(d) { return input_scale(d.source.id % 5 + 1) - input_scale(d.source.id % 5); })
            .attr("height", function(d) { return input_scale(d.source.id % 5 + 1)- input_scale(d.source.id % 5); })
            .attr("class", function(d) { return "window hidden " + d["class"];});


        var diagonal = d3.svg.diagonal()
            .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })            
            .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
            .projection(function(d) { return [d.y, d.x]; });

        var link = svg.selectAll(".link")
            .data(links, function(d) { return d.id;})
            .attr("class", function(d) { return "link " + d["class"]; })
            .attr("d", diagonal);

        link.enter().append("path")
            .attr("class", function(d) { return "link " + d["class"]; })
            .attr("d", function(d) { return diagonal({"source": d.source, "target": d.source});});

        link.transition()
            .duration(3000)
            .attr("d", diagonal);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", function(d) { return "node " + (d.layer == 0 ? "input" : "output");})
            .attr("transform", function(d) { return "translate(" + depth(d.layer) + "," + (inputs(d.id) + depth(d.layer) / 3.5) + ")"; })

        node.append("circle")
            .attr("r", 8);

        node.append("text")
            .attr("dx", function(d) { return d.layer != 0 ? 20 : -20; })
            .attr("dy", 8)
            .style("text-anchor", function(d) { return d.layer == 0 ? "end" : "start"; })
            .text(function(d) { return d.name; });
    });
}

function transitionConvolution() {
    svg.selectAll("rect.input")
        .attr("class", "input");

    svg.selectAll("rect.output")
        .attr("class", "output");
    
    d3.json("/data/convolution.json", function(error, root) {
        var nodes = root.nodes;
        var links = [];
    
        svg.selectAll(".node.input")
            .data(nodes)
            .classed("hidden", function(d) { return !d["parent"]; })
            .transition()
            .duration(3000)
            .attr("transform", function(d) { return "translate(" + (input_scale(d.id % 5) + (input_scale(d.id % 5 + 1) - input_scale(d.id % 5)) / 2) + "," + (input_scale(Math.floor(d.id / 5)) + (input_scale(d.id % 5 + 1) - input_scale(d.id % 5)) * 1.5) + ")"; })

        svg.selectAll(".node.output")
            .data(nodes)
            .classed("hidden", function(d) { return d.id != 0 && d.id != 4;})
            .transition()
            .duration(3000)
            .attr("transform", function(d) { return "translate(" + (output_scale(Math.floor(d.id / 3))  + height / 2 + 200 + (output_scale(d.id % 3 + 1) - output_scale(d.id % 3)) / 2) + "," + (output_scale(d.id % 3) + 120 + (output_scale(d.id % 3 + 1) - output_scale(d.id % 3)) / 2) + ")"; });

        for (var i = 0, l = nodes.length; i < l; i ++) {
            if (nodes[i].parent) {
                for (var j = 0; j < nodes[i].parent.length; j++) {
                    links.push({
                        id: nodes[i].id+"x"+find_name(nodes, nodes[i].parent[j]).id,
                        source: {
                            "x": input_scale(Math.floor(nodes[i].id / 5)) + (input_scale(nodes[i].id % 5 + 1) - input_scale(nodes[i].id % 5)) / 2,
                            "y": input_scale(nodes[i].id % 5) + 100 + (input_scale(nodes[i].id % 5 + 1) - input_scale(nodes[i].id % 5)) / 2,
                            "id": nodes[i].id
                        },
                        target: {
                            "x": output_scale(Math.floor(find_name(nodes, nodes[i].parent[j]).id / 3)) + height / 2 + 200 + (output_scale(find_name(nodes, nodes[i].parent[j]).id % 3 + 1) - output_scale(find_name(nodes, nodes[i].parent[j]).id % 3)) / 2,
                            "y": output_scale(find_name(nodes, nodes[i].parent[j]).id % 3) + 120 + (output_scale(find_name(nodes, nodes[i].parent[j]).id % 3 + 1) - output_scale(find_name(nodes, nodes[i].parent[j]).id % 3)) / 2
                        },
                        "class": "target-" + find_name(nodes, nodes[i].parent[j]).name
                    });
                }
            }
        }


        var diagonal = d3.svg.diagonal()
            .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })            
            .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
            .projection(function(d) { return [d.y, d.x]; });


        var link = svg.selectAll(".link")
            .data(links, function(d) { return d.id;})
            .transition()
            .duration(3000)
            .attr("class", function(d) { return "link " + d["class"]; })
            .attr("d", diagonal);    
    });
}

function showWindows() {
    svg.selectAll(".window")
        .classed("hidden",false);


    svg.selectAll(".node")
        .remove();
}
