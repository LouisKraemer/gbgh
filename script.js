d3.json("data/json/map.json", function (json) {

    var svg = d3.select("#map-container")
        .append("svg")
        .attr('id', 'map')
        .attr('width', '100%'),
        initScale = 345000,
        center = d3.geoCentroid(json),
        width = parseInt(d3.select('#map').style('width')),
        projection = d3.geoConicConformal()
        //        .translate([width / 2, height / 2])
        .center(center)
        .scale(initScale),
        path = d3.geoPath()
        .projection(projection),
        bounds = path.bounds(json),
        ratio = (bounds[1][0] - bounds[0][0]) / (bounds[1][1] - bounds[0][1]),
        height = width / ratio,
        stations,
        duration = 750,
        stationRadius = 10;

    d3.select("#map").attr('height', height);

    projection.translate([width / 2, height / 2]);

    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .classed('region', true)
        .attr('id', function (d) {
            return d.properties.insee ? d.properties.insee : d.properties.inseecommune;
        });

    initVelov();

    resize();

    d3.select(window).on('resize', resize);

    function resize() {
        if (parseInt(d3.select('#map').style('width')) !== width) {
            width = parseInt(d3.select('#map').style('width'));
            height = width / ratio;
            d3.select("#map").attr('height', height);

            var scale = (width / (bounds[1][0] - bounds[0][0])) * initScale;

            projection
                .translate([width / 2, height / 2])
                .scale(scale);

            d3.selectAll("path").attr("d", path);

            stations.attr('cx', function (d) {
                return projection(d.geometry.coordinates)[0];
            })
                .attr('cy', function (d) {
                    return projection(d.geometry.coordinates)[1];
                })
                .attr('r', )

        }
    }

    // Fill zone
    d3.selectAll("path")
        .style("fill", "#ccc")
        .style("stroke", "#fff")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on('click', zoomOnClick);

    var active = d3.select(null);

    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);

    function zoomOnClick(d) {
        if (active.node() === this) {
            return reset();
        }

        active.classed("active", false);
        active = d3.select(this).classed("active", true);

        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        showStations(this, translate, scale);

        svg.transition()
            .duration(750)
            // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }

    function reset() {
        active.classed("active", false);
        active = d3.select(null);

        svg.transition()
            .duration(750)
            // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
            .call(zoom.transform, d3.zoomIdentity);
    }

    function zoomed() {
        svg.selectAll("path").style("stroke-width", 1.5 / d3.event.transform.k + "px");
        svg.selectAll("path").attr("transform", d3.event.transform);
        svg.selectAll('circle').attr('transform', d3.event.transform);
    }

    function initVelov() {
        d3.json("data/json/json_reduit.json", function (err, data) {
            stations = svg.selectAll("circle")
                .data(data.geoJson.features)
                .enter()
                .append("circle");

            stations.attr('cx', function (d) {
                return projection(d.geometry.coordinates)[0];
            })
                .attr('cy', function (d) {
                    return projection(d.geometry.coordinates)[1];
                })
                .attr('r', stationRadius)
                // .attr('class', function (d) {
                //     var result = 'no-location';
                //     json.features.forEach(function (commune) {
                //         if (d3.polygonContains(commune.geometry.coordinates[0], d.geometry.coordinates)) {
                //             // console.log(typeof (commune.properties.insee ? commune.properties.insee : commune.properties.inseecommune))
                //             result = 'loc-' + (commune.properties.insee ? commune.properties.insee : commune.properties.inseecommune);
                //         }
                //     });
                //     return result;
                // })
                .classed('hide', true);
        });
    }


    function showStations(region, translate, scale) {
        stations.classed('hide', true)
            // .attr('r', scale*stationRadius)
            // .attr('cx', function (d) {
            //     console.log(projection(d.geometry.coordinates)[0], translate[0])
            //     return projection(d.geometry.coordinates)[0]
            // })

        const idRegion = d3.select(region).attr('id');
        stations.classed('hide', function (d) {
            return d.properties.code_insee !== idRegion;
        })
        // d3.selectAll('.loc-' + idRegion).classed('hide', false).translate(translate[0], translate[1]).scale(scale)
        // stations.classed('hide', function (d) {
        //     const point = d.geometry.coordinates;
        //     // console.log(d3.geoContains(region, d.geometry.coordinates))
        //     // console.log(d3.polygonContains(test, point))
        // })
    }

    // Slider config


    //        width = parseInt(d3.select('#map').style('width')),
    //        width = width - margin.left - margin.right,
    //        mapRatio = .5,
    //        height = width * mapRatio;

    //    var height = 0,
    //        width = 0,
    //        center = d3.geoCentroid(json),
    //        margin = {
    //            top: '20px',
    //            bottom: '20px',
    //            left: '20px',
    //            right: '20px'
    //        },
    //        svg = d3.select("body")
    //        .append("svg")
    //        .attr('id', 'map-container'),
    //        projection = d3.geoConicConformal()
    //        .translate([width / 2, height / 2])
    //        .center(center)
    //        .scale(200000),
    //        path = d3.geoPath()
    //        .projection(projection),
    //        bounds = path.bounds(json);

    //    const resize = function () {
    //        console.log('resizing')
    //        var scale = 100;
    //        var height = body.clientHeight;
    //        var width = body.clientWidth;
    //        //        const hscale = scale * width / (bounds[1][0] - bounds[0][0]);
    //        //        const vscale = scale * height / (bounds[1][1] - bounds[0][1]);
    //        //        scale = (hscale < vscale) ? hscale : vscale;
    //        //        const offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
    //        //                                height - (bounds[0][1] + bounds[1][1]) / 2];
    //
    //        var bounds = path.bounds(json);
    //        var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
    //        var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
    //        var scale = (hscale < vscale) ? hscale : vscale;
    //        var offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
    //                        height - (bounds[0][1] + bounds[1][1]) / 2];
    //
    //        console.log(scale)
    //
    //        projection = d3.geoConicConformal().center(center)
    //            .scale(scale)
    //        //            .translate(offset);
    //        path = d3.geoPath()
    //            .projection(projection)
    //        //        projection.scale(scale).translate(offset)
    //    }

    //    resize();
    //
    //    window.onresize = resize;



    //
    //    projection.scale(scale).translate(offset);

    //    

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
