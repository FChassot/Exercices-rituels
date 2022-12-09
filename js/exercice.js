var padding = {top:0, right:0, bottom:0, left:0}
var w = 400 - padding.left - padding.right
var h = 400 - padding.top  - padding.bottom
var r = Math.min(w, h)/2
var rotation = 0
var oldrotation = 0
var picked = 10000
var oldpick = []
var color = d3.scale.category20()

var data = [
    { "label": "Rejouez", "value": 1, "question": "Désolé! Vous avez perdu. Rejouez!", "color": "#2E64FE" },
    { "label": "Vin chaud", "value": 2, "question": "Bravo! vous avez gagné un verre de vin chaud. Veuillez présenter l'écran de votre portable au stand de vin chaud.", "color": "red"},
    { "label": "Perdu", "value": 3, "question": "Désolé! Vous avez perdu! Merci pour votre participation.", "color": "blue" },
    { "label": "Rejouez", "value": 4, "question": "Désolé! Vous avez perdu. Rejouez!", "color": "#2E64FE"},
    { "label": "Perdu", "value": 5, "question": "Mince! Vous avez perdu! Merci pour votre participation.", "color": "blue"},
    { "label": "Rejouez", "value": 6, "question": "Désolé! Vous avez perdu. Rejouez!", "color": "#2E64FE"},
    { "label": "Perdu", "value": 7, "question": "Mince! Vous avez perdu! Merci pour votre participation.", "color": "blue" },
    { "label": "Rejouez", "value": 8, "question": "Désolé! Vous avez perdu. Rejouez!", "color": "#2E64FE"},
    { "label": "Perdu", "value": 9, "question": "Mince! Vous avez perdu! Merci pour votre participation.", "color": "blue"},  
    { "label": "Rejouez", "value": 10, "question": "Désolé! Vous avez perdu. Rejouez!", "color": "#2E64FE" },
    { "label": "Perdu", "value": 11, "question": "Mince! Vous avez perdu! Merci pour votre participation.", "color": "blue" },
];

var svg = d3.select('#chart')
    .append("svg")
    .data([data])
    .attr("width",  w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);
    //.attr("viewBox", `0 0 300 600`)

var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");

var vis = container
    .append("g");
            
var pie = d3.layout.pie().sort(null).value(function(d){return 1;});

// declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);

// select paths, use arc generator to draw
var arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");
            
arcs.append("path")
    .attr("fill", function (d, i) { return data[i].color; })
    .attr("d", function (d) { return arc(d); });

// add the text
arcs.append("text").attr("transform", function(d){
        d.innerRadius = 0;
        d.outerRadius = r;
        d.angle = (d.startAngle + d.endAngle)/2;
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
    })
    .attr("text-anchor", "end")
    .text( function(d, i) {
        return data[i].label;
    });

container.on("click", spin);

function spin(d){

    container.on("click", null);

    d3.select("#question p")
        .text("");

    if ((sessionStorage.getItem("gift") === "Verre de vin chaud") && sessionStorage.getItem("validity").toString() === new Date().getDate().toString()) {
        d3.select("#question p")
            .text("Vous avez déjà participé aujourd'hui! Vous pouvez toujours retentez votre chance demain!");
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open("../html/win.html", "Malheureusement vous ne pouvez plus rejouer!", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }
    else if ((sessionStorage.getItem("gift") === "None") && sessionStorage.getItem("validity").toString() === new Date().getDate().toString()) {
        d3.select("#question p")
            .text("Vous avez déjà participé aujourd'hui! Vous pouvez toujours retentez votre chance demain!");
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open("../html/finish.html", "Malheureusement vous ne pouvez plus rejouer!", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }
    else {
        sessionStorage.clear();
    };

    //all slices have been seen, all done
    //console.log("OldPick: " + oldpick.length, "Data length: " + data.length);

    if(oldpick.length == data.length){
        //console.log("done");
        container.on("click", null);
        return;
    }

    var ps = 360/data.length
    var pieslice = Math.round(1440/data.length)
    var rng = Math.floor((Math.random() * 1440) + 360)
                
    rotation = (Math.round(rng / ps) * ps);
            
    picked = Math.round(data.length - (rotation % 360)/ps);
    picked = picked >= data.length ? (picked % data.length) : picked;

    if(oldpick.indexOf(picked) !== -1){
        d3.select(this).call(spin);
        return;
    } else {
        oldpick.push(picked);
    }

    rotation += 90 - Math.round(ps/2);
            
    vis.transition()
        .duration(2000)
        .attrTween("transform", rotTween)
        // Actions à lancer à l'arrêt de la roue
        .each("end", function(){

            //mark question as seen
            /*d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                .attr("fill", "purple");*/
 
            // populate question
            d3.select("#question p")
                .text(data[picked].question);

            oldrotation = rotation;
                
            container.on("click", spin);

            if (data[picked].value == 2) {
                // Save data to sessionStorage
                sessionStorage.setItem("gift", "Verre de vin chaud");
                sessionStorage.setItem("validity", new Date().getDate());

                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                window.location.reload();
                return window.open("./win.html", "VOUS AVEZ GAGNE!", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
            }
            else if (data[picked].value == 1) {
                sessionStorage.setItem("gift", "Replay");
            }
            else if (data[picked].value == 4) {
                sessionStorage.setItem("gift", "Replay");
            }
            else if (data[picked].value == 6) {
                sessionStorage.setItem("gift", "Replay");
            }
            else if (data[picked].value == 8) {
                sessionStorage.setItem("gift", "Replay");
            }
            else if (data[picked].value == 10) {
                sessionStorage.setItem("gift", "Replay");
            }
            else {
                sessionStorage.setItem("gift", "None");
                sessionStorage.setItem("validity", new Date().getDate());
            }
        });
}

svg.append("g")
    .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
    .append("path")
    .attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
    .style({"fill":"white"});

container.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({"fill":"white","cursor":"pointer","background": "#CCEAF1"});

container.append("text")
    .attr("x", 0)
    .attr("y", 8)
    .attr("text-anchor", "middle")
    .text("Jouer")
    .style({"font-weight":"bold", "font-size":"22px"});

function rotTween(to) {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function(t) {
    return "rotate(" + i(t) + ")";
    };
}