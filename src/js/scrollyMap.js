import * as d3 from 'd3v4'
const statesData= require('./gz_2010_us_040_00_20m.json')

const scrollyMap = () => {
    console.log('set the map');
    let map;
    let screenWidth= window.innerWidth;

    var option = {
        useEasing: true,
        useGrouping: true,
    };
    const tileStyle={
        weight: 0.5,
        opacity: 1,
        color: '#a4a4a4',
        dashArray: '2',
        fillOpacity: 0
    }
    // let shootingA = new CountUp('shootingCount', 0, 94, 0, 2, option);
    // let shootingB = new CountUp('killCount', 0, 790, 0, 4, option);
    // let shootingC = new CountUp('injureCount', 0, 1983, 0, 6, option);
    // shootingA.start();
    // shootingB.start();
    // shootingC.start();




    let controller = new ScrollMagic.Controller();



    // graphic code
    map = L.map("map",{minZoom: 3, maxZoom: 10, zoomControl: false, dragging: false, scrollWheelZoom:false, doubleClickZoom:false, attributionControl: false, zoomSnap: 0.5});
    const lightBackground = "https://api.mapbox.com/styles/v1/gabriel-florit/cj8nbv8ow7m9g2rntzv29ckj5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA";
    const blackBackground = "https://api.mapbox.com/styles/v1/gabriel-florit/cj8vp0rr7fe232rk5mg0vdwf5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA";
    const satellite = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ";
    //map layer
    const streetMap = L.tileLayer(lightBackground, {
        id: 'mapbox.street',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    streetMap.addTo(map);

    map.setView([40.104, -97.485], 4);
    if(screenWidth<=720){
        map.setView([40.104, -97.485], 4);
    }
    var geoStates = L.geoJson(statesData, {
        style: tileStyle,
        onEachFeature: onEachFeature
    }).addTo(map);
    var circleGroup = L.layerGroup().addTo(map);
    d3.csv('./assets/usMassShootingfromMotherJones2017_revised.csv', function (data) {
        //console.log(data);



        var nestedData = d3.nest().key(function (d) {
            return d['Year'];
        }).sortKeys(d3.ascending).entries(data);

        //console.log(nestedData);
        //var gunshot = document.getElementById('gunshot');



        var info = L.control({position: 'topleft'});
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

// method that we will use to update the control based on feature properties passed
        info.update = function (s) {

            this._div.innerHTML =
                (s ? '<h4>'+ s['Case'] +'</h4>' +
                    '<p><span>Date: </span>'+dateFormat(s['Date'])+'<br/>'+
                    '<span>Fatalities: </span> '+s['Fatalities']+'<br/>'+
                    '<span>Details: </span> '+s['Summary']+'<br/>'+
                    ((s['Weapons obtained legally']=='No')? '<span>Weapons:</span> Illegal <br/>':'')+
                    ((s['Prior signs of mental health issues']=='Yes')? '<span>Shooter:</span> Had shown signs of mental health issues. </p>':'</p>')
                    //'<b>' + h.name + '</b><br />' +
                    : 'Hover over a circle');

        };
        info.addTo(map);

        animationCircles();
        // document.getElementById("playagain").addEventListener("click", animationCircles);
        var circlesByYear;
        function animationCircles() {
            console.log('circles');
            var counter =0;

            circleGroup.clearLayers();
            clearInterval(circlesByYear);

            circlesByYear = setInterval(function () {
                // gunshot.pause();
                circleGroup.eachLayer(function (layer) {
                    layer.setStyle({opacity: 0.1});
                });

                //circleGroup.clearLayers();
                document.getElementById("showYear").innerHTML = nestedData[counter].key;
                if(counter<34){
                    //console.log(counter);
                    nestedData[counter].values.forEach(
                        function (shooting) {
                            //console.log(shooting);
                            // gunshot.play();
                            if(shooting.latitude){
                                var circle = L.circleMarker([shooting.latitude, shooting.longitude], {
                                    radius: 0,
                                    color: 'red',
                                    weight: 2,
                                    fillOpacity: 0.2,
                                    className:shooting['Year']+'-'+shooting['Weapons obtained legally']+'-'+shooting['Prior signs of mental health issues']
                                });

                                // if(shooting['Fatalities']>25){
                                //     //circle.bringToBack();
                                //     //circle.setZIndexOffset(0);
                                //     //circle.setStyle({color:'gold'});
                                //     console.log(circle);
                                //     //console.log(circle.setZIndexOffset(0));
                                // }

                                var newRadius = Math.sqrt(shooting['Fatalities'])*6;

                                //console.log(newRadius);

                                var interval = setInterval(function() {
                                    var currentRadius = circle.getRadius();
                                    currentRadius = currentRadius + 0.5;
                                    if (currentRadius < newRadius) {
                                        circle.setRadius(currentRadius);
                                    } else {
                                        clearTimeout(interval);
                                    }
                                }, 10);

                                circle.on('mouseover', function (layer) {

                                    circleGroup.eachLayer(function (circle) {
                                        // console.log(layer);
                                        circle.setStyle({opacity: 0.1});

                                    });

                                    //console.log(layer);
                                    layer.target.setStyle({opacity: 1});
                                    info.update(shooting);
                                });
                                circleGroup.addLayer(circle);
                            }
                        }
                    );
                    ++counter;
                    if(counter==33){clearTimeout(circlesByYear);}
                } else{
                    clearTimeout(circlesByYear);
                }
            }, 400);
        }
    });


    var scene0 = new ScrollMagic.Scene({triggerElement: "#spacer0", duration: getElementLength("spacer0"), triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){
            d3.selectAll('span').classed('active', false);
           // d3.select('.wbackground').transition().style('opacity', 0);
            circleGroup.eachLayer(function (circle) {
                // console.log(layer);
                circle.setStyle({opacity: 0.1});

            });
        });

    var scene = new ScrollMagic.Scene({triggerElement: "#trigger0", duration: getElementLength("trigger0"), triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger0').select('span').classed('active', true);
            circleGroup.eachLayer(function (layer) {
                layer.setStyle({color: 'red'});
             //   console.log(layer);
                if( +layer.options.className.split('-')[0] > 2004){
                    layer.setStyle({opacity: 1,
                    });
                }

            });
            geoStates.setStyle(tileStyle);
            //d3.select('.wbackground').transition().style('opacity', 1);
        });

    var scene0_1 = new ScrollMagic.Scene({triggerElement: "#trigger0_1", duration: getElementLength("trigger0_1"), triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger0_1').select('span').classed('active', true);
            map.flyTo([40.104, -97.485], 4);
            circleGroup.eachLayer(function (layer) {
                console.log(layer.options.className);
                layer.setStyle({opacity: 0.1, opacity: 0.1});
                if( layer.options.className.split('-')[1] == 'Yes' && layer.options.className.split('-')[2]=='Yes'){
                    layer.setStyle({
                        opacity: 1,
                        color: '#8F47C7',
                    });
                }
            });
            geoStates.setStyle(tileStyle);
            //d3.select('.wbackground').transition().style('opacity', 1);
        });

    var sceneA = new ScrollMagic.Scene({triggerElement: "#trigger1", duration: getElementLength("trigger1"), triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){

            circleGroup.eachLayer(function (circle) {
                // console.log(layer);
                circle.setStyle({
                    opacity: 0.1,
                color: 'red'});

            });

            geoStates.eachLayer(
                function (layer) {
                    var stateName = layer.feature.properties['NAME'];
                    if (stateName == 'California' || stateName == 'Florida' || stateName == 'Texas'){
                        console.log(layer.feature.properties['NAME']);
                        layer.setStyle({
                            weight: 2,
                            color: 'gold',
                            dashArray: '',
                            fillOpacity: 0.3
                        });
                        layer.bringToBack();
                    }
                }
            );
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger1').selectAll('span').classed('active', true);
            map.flyTo([39.938980, -85.795071], 4.5);
        });


    var sceneA2 = new ScrollMagic.Scene({triggerElement: "#trigger1_2", duration: getElementLength("trigger1_2"), triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){

            circleGroup.eachLayer(function (circle) {
                circle.setStyle({
                    opacity: 0.1,
                    color: 'red'});

            });
            geoStates.setStyle(tileStyle);
            geoStates.eachLayer(
                function (layer) {
                    var stateName = layer.feature.properties['NAME'];
                    if (stateName == 'Massachusetts' || stateName == 'Connecticut' || stateName == 'Maine' || stateName == 'Vermont' || stateName == 'New Hampshire' || stateName == 'Rhode Island'){
                        console.log(layer.feature.properties['NAME']);
                        layer.setStyle({
                            weight: 2,
                            color: 'gold',
                            dashArray: '',
                            fillOpacity: 0.3
                        });
                        layer.bringToBack();
                    }
                }
            );
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger1_2').selectAll('span').classed('active', true);
            map.flyTo([44.153928, -70.763628], 7);
        });

    // var sceneA = new ScrollMagic.Scene({ triggerElement:'#trigger1', offset: -(document.documentElement.clientHeight/th), triggerHook: 0 }) // All races
    //     .on('start',function(){
    //         map.flyTo([36.763004, -119.666739], 9);
    //     });

    var sceneB = new ScrollMagic.Scene({ triggerElement:'#trigger2', duration: getElementLength("trigger2"), triggerHook: 0, reverse: true}) // All races - charter schools
        .setPin("#map")
        .on('start',function(){
            geoStates.setStyle(tileStyle);
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger2').select('span').classed('active', true);
            map.flyTo([36.095, -115.171667], 7);
        });

    var sceneC = new ScrollMagic.Scene({ triggerElement:'#trigger3', duration: getElementLength("trigger3")+1200, triggerHook: 0, reverse: true}) // All races - charter schools
        .setPin("#map")
        .on('start',function(){
            d3.selectAll('span').classed('active', false);
            d3.select('#trigger3').select('span').classed('active', true);
            map.flyTo([40.104, -97.485], 4);
        });

    controller.addScene([scene0, scene, scene0_1, sceneA, sceneA2, sceneB, sceneC]);

    function getElementLength( id ) {
        return (document.getElementById(id).offsetHeight);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            // mouseover: highlightFeature,
            // mouseout: resetHighlight,
            // click: zoomToFeature
        })
    }
    function highlightFeature(e) {
        var layer = e.target;
        //console.log(layer);
        layer.setStyle({
            weight: 2,
            color: 'red',
            dashArray: '',
            fillOpacity: 0.5
        });
        layer.bringToBack();

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function resetHighlight(e) {
        geoStates.resetStyle(e.target);
    }

    function dateFormat(s) {
        var year = (s.split('/')[2]>20)?(s.split('/')[2]): (+s.split('/')[2]+2000),
            day = s.split('/')[1],
            month = s.split('/')[0]-1;
        var newDate = new Date(year, month, day)
            .toString();

        var newDateSplit = newDate.split(' ');
        //return newDate;
        //console.log(year);
        return newDateSplit[1]+'. '+(+newDateSplit[2])+', '+newDateSplit[3];
    }
}

export default scrollyMap