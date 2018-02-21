d3.json("data/json/map.json", function (json) {

    var svg = d3.select("#map-container")
        .append("svg")
        .attr('id', 'map')
        .attr('width', '100%'),
        initScale = 345000,
        center = d3.geoCentroid(json),
        width = parseInt(d3.select('#map').style('width')),
        projection = d3.geoConicConformal()
        .center(center)
        .scale(initScale),
        path = d3.geoPath()
        .projection(projection),
        bounds = path.bounds(json),
        ratio = (bounds[1][0] - bounds[0][0]) / (bounds[1][1] - bounds[0][1]),
        height = width / ratio,
        stations,
        duration = 750,
        velovDuration = 250,
        tooltipDuration = 250,
        stationRadius = 8;

    d3.select("#map").attr('height', height);

    var tooltip = d3.select('body').append('div').classed('hide', true).classed('station-tooltip', true);

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

    init();

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

        showStations(this);

        svg.transition()
            .duration(duration)
            // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }

    function reset() {
        stations.classed('hide', true);
        tooltip.classed('hide', true);
        active.classed("active", false);
        active = d3.select(null);

        svg.transition()
            .duration(duration)
            // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
            .call(zoom.transform, d3.zoomIdentity);
    }

    function zoomed() {
        svg.selectAll("path").style("stroke-width", 1.5 / d3.event.transform.k + "px");
        svg.selectAll("path").attr("transform", d3.event.transform);
        svg.selectAll('circle').attr('r', stationRadius/d3.event.transform.k);
        svg.selectAll('circle').attr('transform', d3.event.transform);
    }

    function init() {
        

        d3.json("http://creti.fr/gbgh/endpoints/staticvelov.php", function (err, data) {
            stations = svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle");

            stations.attr('cx', function (d) {
                return projection(d.geometry.coordinates)[0];
            })
                .attr('cy', function (d) {
                    return projection(d.geometry.coordinates)[1];
                })
                .attr('id', function (d) {
                    return d.idStation;
                })
                .attr('r', stationRadius)
                .style('opacity', 0)
                .classed('hide', true)
                .on('click', reset)
                .on('mousemove', function (d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    tooltip.html(d.nom)
                        .classed('hide', false)
                        .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 25) + 'px');
                })
                .on('mouseleave', function () {
                    tooltip.classed('hide', true);
                });

            resize();

            d3.select('#loader-container')
                .transition()
                .duration(250)
                .style('opacity', 0);

            setTimeout(function () {
                d3.select('#loader-container').classed('hide', true);
            }, 250);
        });
    }


    function showStations(region) {
        hideStation();

        const idRegion = d3.select(region).attr('id');
        setTimeout(function () {
            stations.classed('hide', function (d) {
                return d.code_insee !== idRegion;
            })
                .transition().duration(velovDuration).style('opacity', 1);
        }, duration)
    }

    function hideStation() {
        stations.transition().duration(velovDuration).style('opacity', 0);
        setTimeout(function () {
            stations.classed('hide', true);
        }, velovDuration);
    }
    
    function fetchEvents(date) {
        const timestamp = date.getTime();
        const url = "http://creti.fr/gbgh/endpoints/events.php?timestamp=" + timestamp;
        console.log(url)
        d3.json(url, function (err, data) {
            console.log(err)
            console.log(data)
        });
    }

    fetchEvents(new Date())

    // Slider config
});
