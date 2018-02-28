d3.json("data/json/map.json", function (json) {

    var request = new XMLHttpRequest();
    request.open('GET', 'http://creti.fr/gbgh/endpoints/dynamicvelov.php?describe', false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      limitDates = JSON.parse(request.responseText);
    }

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
        // events = d3.select(null),
        duration = 750,
        velovDuration = 250,
        tooltipDuration = 250,
        stationRadius = 8,
        eventHeight = 30,
        eventWidth = 30,
        beginDate = limitDates['min'][0]['timestamp'],
        endDate = limitDates['max'][0]['timestamp'],
        eventfetchState = false,
        velovFetchState = false,
        initFetchState = false,
        timeSlider = d3.select('#time-slider'),
        sliderLoader = d3.select('#slider-loader'),
        transform = null,
        timestampStored = [],
        velovData = [],
        step = 120,
        currentTimestamp,
        fbPath = 'M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z';

    d3.select("#map").attr('height', height);

    timeSlider.attr('min', beginDate)
        .attr('max', endDate)
        .attr('value', beginDate)
        .attr('step', step)
        .on('input', function () {
            const date = new Date(+this.value * 1000);
            d3.select('#current-date').html(date.getDate() + '/'
                + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/'
                + date.getFullYear() + ' - '
                + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h'
                + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());
        })
        .on('change', function() {
            currentTimestamp = +this.value;
            fetchEvents(+this.value);
            fetchVelov(+this.value);
        });

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
        transform = d3.event.transform;
        svg.selectAll(".region").style("stroke-width", 1.5 / d3.event.transform.k + "px")
            .attr("transform", d3.event.transform);
        svg.selectAll('circle').attr('r', function (d) {
            return getRadius(d.available_bikes, d.available_bike_stands, d3.event.transform);
        })
            .attr('transform', d3.event.transform);
        svg.selectAll('image').attr('transform', d3.event.transform)
            .attr('height', function (d) {
                return getEventSize(d.startTime, d.endTime, currentTimestamp, transform)[0];
            })
            .attr('width', function (d) {
                return getEventSize(d.startTime, d.endTime, currentTimestamp, transform)[1];
            });
        svg.selectAll('.event').attr('transform', d3.event.transform)
    }

    function init() {

        const date = new Date(+beginDate * 1000);

        currentTimestamp = +beginDate;

        d3.select('#current-date').html(date.getDate() + '/'
            + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/'
            + date.getFullYear() + ' - '
            + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h'
            + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());


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
                    return 'station_' + d.idstation;
                })
                .attr('data-region', function (d) {
                    return d.code_insee;
                })
                .attr('name', function (d) {
                    return d.nom;
                })
                .attr('r', function () {
                    return getRadius(1, 0, transform);
                })
                .style('opacity', 0)
                .classed('hide', true)
                .on('click', reset)
                .on('mousemove', function (d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    tooltip.html(d3.select(this).attr('name') + '</br><span class="bike-info">Available bikes : </span>' + d.available_bikes
                    + '</br><span class="bike-info">Available stands : </span>' + d.available_bike_stands)
                        .classed('hide', false)
                        .attr('style', 'left:' + (mouse[0] + 45) + 'px; top:' + (mouse[1] - 55) + 'px');
                })
                .on('mouseleave', function () {
                    tooltip.classed('hide', true);
                });

            fetchEvents(beginDate);

            fetchVelov(beginDate);

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
                // return d.code_insee !== idRegion;
                return d3.select(this).attr('data-region') !== idRegion;
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

    function showEventInfo(e) {
        const startTime = new Date(e.startTime);
        const formatStart = startTime.getDate() + '/'
            + (startTime.getMonth() < 9 ? '0' : '') + (startTime.getMonth() + 1) + '/'
            + startTime.getFullYear() + ' - '
            + (startTime.getHours() < 10 ? '0' : '') + startTime.getHours() + 'h'
            + (startTime.getMinutes() < 10 ? '0' : '') + startTime.getMinutes();
        const endTime = new Date(e.endTime);
        const formatEnd = endTime.getDate() + '/'
            + (endTime.getMonth() < 9 ? '0' : '') + (endTime.getMonth() + 1) + '/'
            + endTime.getFullYear() + ' - '
            + (endTime.getHours() < 10 ? '0' : '') + endTime.getHours() + 'h'
            + (endTime.getMinutes() < 10 ? '0' : '') + endTime.getMinutes();
        d3.select('#eventName').html(e.name);
        d3.select('#eventPlace').html(e.place.name);
        d3.select('#eventStartTime').html(formatStart);
        d3.select('#eventEndTime').html(formatEnd);
    }

    function fetchEvents(timestamp) {
        timeSlider.attr('disabled', true);
        sliderLoader.classed('hide', false);
        eventfetchState = false;
        const url = "http://creti.fr/gbgh/endpoints/events.php?timestamp=" + timestamp + "&delta=120";
        d3.json(url, function (err, data) {
            var events = svg.selectAll('image')
                .data(data)
                .attr("xlink:href", function (d) {
                    return "data/fb-logo-" + getColor(d.startTime, d.endTime, currentTimestamp) + ".png"
                })
                .attr('x', function (e) {
                    return projection([e.place.location.longitude, e.place.location.latitude])[0];
                })
                .attr('y', function (e) {
                    return projection([e.place.location.longitude, e.place.location.latitude])[1];
                })
                .attr('transform', transform)
                .attr('height', function (d) {
                    // return transform ? eventHeight/transform.k : eventHeight
                    return getEventSize(d.startTime, d.endTime, timestamp, transform)[0];
                })
                .attr('width', function (d) {
                    // return transform ? eventWidth/transform.k : eventWidth
                    return getEventSize(d.startTime, d.endTime, timestamp, transform)[1];
                })
                // .style('fill', '#3b5998')
                .on('click', function (d) {
                    d3.select('#event-info').style('visibility', 'visible');
                    showEventInfo(d);
                });

            events.enter()
                .insert('svg:image','circle')
                .classed('event', true)
                .attr("xlink:href", function (d) {
                    return "data/fb-logo-" + getColor(d.startTime, d.endTime, currentTimestamp) + ".png"
                })
                .attr('x', function (e) {
                    return projection([e.place.location.longitude, e.place.location.latitude])[0];
                })
                .attr('y', function (e) {
                    return projection([e.place.location.longitude, e.place.location.latitude])[1];
                })
                .attr('transform', transform)
                .attr('height', function (d) {
                    // return transform ? eventHeight/transform.k : eventHeight
                    return getEventSize(d.startTime, d.endTime, timestamp, transform)[0];
                })
                .attr('width', function (d) {
                    // return transform ? eventWidth/transform.k : eventWidth
                    return getEventSize(d.startTime, d.endTime, timestamp, transform)[1];
                })
                // .style('fill', '#3b5998')
                .on('click', function (d) {
                    d3.select('#event-info').style('visibility', 'visible');
                    showEventInfo(d);
                });

                events.exit().remove();

            eventfetchState = true;
            checkFetchState();
        })
    }

    function fetchVelov(timestamp) {
        var timestampToDownload = [];
        for (var i = 0; i < 14; i++) {
            const index = findTimestamp(parseInt(timestamp) + parseInt(i*step));
            if (index === -1) {
                timestampToDownload.push(parseInt(timestamp) + parseInt(i*step));
            }
        }
        if (timestampToDownload.length > 0) {
            timeSlider.attr('disabled', true);
            sliderLoader.classed('hide', false);
            velovFetchState = false;

            const min = Math.min.apply(null, timestampToDownload) - 59,
                max = Math.max.apply(null, timestampToDownload) + 59;

            const url = "http://creti.fr/gbgh/endpoints/dynamicvelov.php?from=" + min + '&until=' + max;
            d3.json(url, function (err, data) {
                data.forEach(function (e) {
                    if (timestampStored.indexOf(e.timestamp) === -1) {
                        timestampStored.push(e.timestamp);
                        velovData.push(e);
                    }
                });

                updateVelov(timestamp);

                velovFetchState = true;
                checkFetchState();
            })
        } else {
            updateVelov(timestamp);
        }
    }

    function findTimestamp(timestamp) {
        for(var i = 0; i<timestampStored.length; i++) {
            if (timestamp > timestampStored[i] - 59 && timestamp < timestampStored[i] + 59) {
                return i;
            }
        }
        return -1;
    }

    function updateVelov(timestamp) {
        const index = findTimestamp(timestamp);
        const updatedData = getVelovData(index);

        var radialGradient = svg.append("defs")
          .append("radialGradient")
            .attr("id", "radial-gradient");

        radialGradient.append("stop")
            .attr("offset", "10%")
            .attr("stop-color", "orange");

        radialGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(255,255,255,0.2)");

        svg.selectAll('circle').data(updatedData.stations)
            .transition().duration(velovDuration)
            .style("fill", "url(#radial-gradient)")
            .attr('r', function (d) {
                return getRadius(d.available_bikes, d.available_bike_stands, transform);
            })
    }

    function getVelovData(index) {
        for(var i = 0; i<velovData.length; i++) {
            if (velovData[i].timestamp === timestampStored[index]) {
                return velovData[i];
            }
        }
    }

    function checkFetchState() {
        if (eventfetchState && velovFetchState) {
            timeSlider.attr('disabled', null);
            sliderLoader.classed('hide', true);
        }
    }

    function getRadius(available_bikes, available_bike_stands, transform) {
        if(available_bikes === 0 && available_bike_stands === 0) {
            return 0;
        } else {
            return parseInt((20*(1+available_bikes)/(available_bike_stands+available_bikes)/(transform ? transform.k : 1)).toString())
        }
    }

    function getEventSize(startDate, endDate, timestamp, transform) {
      var polynome = x => {return 3*(x*x - x) + 1}
        var factor = 1;
        const startTime = Math.floor(new Date(startDate).getTime()/1000);
        const endTime = Math.floor(new Date(endDate).getTime()/1000);
        if(timestamp <= startTime) {
            factor = 1.5*(timestamp-startTime+8200)/8200/(transform ? transform.k : 1);
        } else if(timestamp <= endTime) {
            factor = 1.5*(polynome((timestamp-startTime)/(endTime-startTime)))/(transform ? transform.k : 1);
        } else {
            factor = 1.5*(8200-timestamp+endTime)/8200/(transform ? transform.k : 1);
        }
        const height = Math.round(parseInt((eventHeight*factor).toString()));
        const width = Math.round(parseInt((eventWidth*factor).toString()));
        return [height, width];
    }

    function getColor(startDate, endDate, timestamp) {
        const startTime = Math.floor(new Date(startDate).getTime()/1000);
        const endTime = Math.floor(new Date(endDate).getTime()/1000);
        if(timestamp <= startTime) {
            return 'green';
        } else if(timestamp <= endTime) {
            return 'orange';
        } else {
            return 'red';
        }
    }

    function moveToBack(element) {
        if(d3.selectAll('circle')) {
            const firstChild = d3.selectAll('circle').nodes()[0];
            console.log(firstChild);
        }
    }
});
