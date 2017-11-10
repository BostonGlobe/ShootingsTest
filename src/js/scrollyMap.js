import * as d3 from 'd3v4'

const scrollyMap = () => {
    console.log('set the map');
    let map;
    let screenWidth= window.innerWidth;

    var option = {
        useEasing: true,
        useGrouping: true,
    };
    let shootingA = new CountUp('shootingCount', 0, 94, 0, 2, option);
    let shootingB = new CountUp('killCount', 0, 790, 0, 4, option);
    let shootingC = new CountUp('injureCount', 0, 1983, 0, 6, option);
    shootingA.start();
    shootingB.start();
    shootingC.start();




    let controller = new ScrollMagic.Controller();



    // graphic code
    map = L.map("map",{minZoom: 3, maxZoom: 10, zoomControl: false, dragging: false, scrollWheelZoom:false, doubleClickZoom:false});
    const lightBackground = "https://api.mapbox.com/styles/v1/gabriel-florit/cj8nbv8ow7m9g2rntzv29ckj5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA";
    const blackBackground = "https://api.mapbox.com/styles/v1/gabriel-florit/cj8vp0rr7fe232rk5mg0vdwf5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA";
    const satellite = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ";
    //map layer
    const streetMap = L.tileLayer(blackBackground, {
        id: 'mapbox.street',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    streetMap.addTo(map);

    map.setView([40.104, -97.485], 4);
    if(screenWidth<=720){
        map.setView([40.104, -97.485], 4);
    }

    d3.csv('./assets/usMassShootingfromMotherJones2017_revised.csv', function (data) {
        console.log(data);
        var circleGroup = L.layerGroup().addTo(map);


        var nestedData = d3.nest().key(function (d) {
            return d['Year'];
        }).sortKeys(d3.ascending).entries(data);

        //console.log(nestedData);
        //var gunshot = document.getElementById('gunshot');



        var info = L.control({position: 'topright'});
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
                                    className:'shootingCircle'
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

                                    circleGroup.eachLayer(function (layer) {
                                        // console.log(layer);
                                        layer.setStyle({opacity: 0.1});

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
    var scene0 = new ScrollMagic.Scene({triggerElement: "#spacer0", duration: 100, triggerHook: 0, reverse: true})
        .setPin("#map");

    var scene = new ScrollMagic.Scene({triggerElement: "#trigger0", duration: 400, triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){
            map.flyTo([40.104, -97.485], 4);
        });

    var sceneA = new ScrollMagic.Scene({triggerElement: "#trigger1", duration: 400, triggerHook: 0, reverse: true})
        .setPin("#map")
        .on('start',function(){
            map.flyTo([37.501398, -112.985513], 6);
        });

    // var sceneA = new ScrollMagic.Scene({ triggerElement:'#trigger1', offset: -(document.documentElement.clientHeight/th), triggerHook: 0 }) // All races
    //     .on('start',function(){
    //         map.flyTo([36.763004, -119.666739], 9);
    //     });

    var sceneB = new ScrollMagic.Scene({ triggerElement:'#trigger2', duration: 800, triggerHook: 0, reverse: true}) // All races - charter schools
        .setPin("#map")
        .on('start',function(){
            map.flyTo([36.095, -115.171667], 12);
        });

    var sceneC = new ScrollMagic.Scene({ triggerElement:'#trigger3', duration: 800, triggerHook: 0, reverse: true}) // All races - charter schools
        .setPin("#map")
        .on('start',function(){
            map.flyTo([40.104, -97.485], 4);
        });

    controller.addScene([scene0, scene, sceneA, sceneB, sceneC]);


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