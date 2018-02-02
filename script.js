d3.json("data/json/map.json", function (json) {
    console.log(json)

    //    var margin = {
    //            top: '20px',
    //            bottom: '20px',
    //            left: '20px',
    //            right: '20px'
    //        },
    //        width = windows,
    //        height = 580,
    //        scale = (width - 1) / Math.PI;
    //
    var svg = d3.select("body")
        .append("svg")
        .attr('class', 'map-container');
    //            .attr("width", width)
    //            .attr("height", height);
    //
    //    var tooltip = d3.select('body').append('div')
    //        .attr('class', 'hidden tooltip');
    //
    var center = d3.geoCentroid(json);
    
    console.log((center))
    //
    var projection = d3.geoConicConformal()
        //        .translate([width / 2, height / 2])
        .center(center)
        .scale(2000);

    var path = d3.geoPath()
        .projection(projection);

    //    var bounds = path.bounds(json);
    //    var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
    //    var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
    //    var scale = (hscale < vscale) ? hscale : vscale;
    //    var offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
    //                            height - (bounds[0][1] + bounds[1][1]) / 2];
    //
    //    projection.scale(scale).translate(offset);

    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path);

    //    d3.csv("grippe.csv", function (data) {
    //        d3.json("map.json", function (json) {
    //            //On fusionne les donnees avec le GeoJSON des regions
    //            var max = 0;
    //            var values = []
    //            for (var i = 0; i < data.length; i++) {
    //                if (Number(data[i].somme2014) > max) {
    //                    max = Number(data[i].somme2014);
    //                }
    //                values.push({
    //                    nom: data[i].region,
    //                    value: data[i].somme2014
    //                })
    //            }
    //
    //            var color = d3.scaleLinear().domain([1, 1000])
    //                .interpolate(d3.interpolateHcl)
    //                .range([d3.rgb("#FBE9E7"), d3.rgb('#BF360C')]);
    //
    //            svg.selectAll("path")
    //                .style("fill", function (d) {
    //                    for (var e of values) {
    //                        if (e.nom === d.properties.nom) {
    //                            return color(Math.floor(1000 * e.value / max))
    //                        }
    //                    }
    //                })
    //                .attr("grippe", function (f) {
    //                    for (var e of values) {
    //                        if (e.nom === f.properties.nom) {
    //                            return e.value
    //                        }
    //                    }
    //                })
    //                .on('mousemove', function (e) {
    //                    var mouse = d3.mouse(svg.node()).map(function (d) {
    //                        return parseInt(d);
    //                    });
    //                    tooltip.classed('hidden', false)
    //                        .attr('style', 'left:' + (mouse[0] + 15) +
    //                            'px; top:' + (mouse[1] - 35) + 'px')
    //                        .html(e.properties.nom);
    //                })
    //                .on('mouseout', function () {
    //                    tooltip.classed('hidden', true);
    //                })
    //                .on('mouseleave', function (e) {
    //                    d3.select(this).transition().style("stroke", "none")
    //                })
    //                .on('mouseenter', function (e) {
    //                    d3.select(this).transition().style("stroke", "black")
    //                })
    //        });
    //    });


});
