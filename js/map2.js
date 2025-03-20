map2 = L.map('map2').setView([40, -105.782], 4); // Center map over US

L.tileLayer('https://api.mapbox.com/styles/v1/griggkyl/cm869xyfd007q01sscz00c6pl/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3JpZ2dreWwiLCJhIjoiY202emRreHVyMDN3NjJycTIzNGJ6NzRnaSJ9.aEoPhdkBaG6QTaCUAzXcSw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Imagery &copy; <a href="https://www.mapbox.com">Mapbox</a>',
    maxZoom: 19
}).addTo(map2);


function countyColor(feature){
    //define features
    var countyAtt = "2024_US_County_Level_Presidential_Results_diff"
    //tie them to the feature
    var votesDiff = feature.properties[countyAtt]

    //conditional color logic
    var fillColor;
    if(votesDiff >= 0) {
        fillColor =  "#CD4444"; //red for majority GOP
    } else {
        fillColor = "#75A6CE"; //blue
    }

    return{
        fillColor: fillColor,
        weight: 0.5,
        color: "white",
        fillOpacity: 1
    }

}

//load counties
fetch("data/geojsons/election_results_by_county.geojson")
.then(response => response.json())
.then(counties => { //first add styling for counties , then load points
L.geoJSON(counties, {
    style: countyColor
}).addTo(map2)
    fetch("data/geojsons/funding_loss_summary!.geojson")
    .then(response => response.json())
    .then(pointData => {
//calculate the radius based on amount of funding lost (or number of awards??)
function calcPropRadius(attValue, zoomLevel){
    var minRadius = 5;
    var maxRadius = 25;
    var radius = Math.sqrt(attValue)*2;

    //adjust the radius based on zoom level
    radius = radius / Math.pow(1.05, (zoomLevel - 10));
  

    //ensure the radius doesn't go below a minimum or above a maximum threshold
   radius = Math.max(minRadius, Math.min(radius, maxRadius));

    return radius
}

//create the legend 
function createLegend() {
    var legend2 = L.control({position: 'topleft'});
    
    legend2.onAdd = function(){
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<strong> Recipient Type </strong><br>'; //title
        categories = ['For-profit Organization', 'Medical Center', 'Museum', 'Non-profit Organization', 
            'Private Institution of Higher Education', 'Public Institution of Higher Education', 
            'Research Institute', 'Small Business', 'Designated Tribal Organization ']
            colors = ["#E84E66", "#FCD475", "#C7E3B6", "#4CB679", "#F9D5D6","#674196", "#1A4D2E", "#CC7DB1",  "#f1FA8C"]
    
            //loop through the categories and generate a label
            for (var i = 0; i < categories.length; i++) {
                div.innerHTML +=
                '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>' + categories[i] + '<br>';
            }

            //section 2: Election Results
            div.innerHTML += '<br><strong>Results of the 2024 Presidential Election at the County Level</strong><br>';
            var electionColors = ["#CD4444", "#75A6CE"];
            var electionLabels = ['Republican Majority: Donald Trump', 'Democratic Majority: Kamala Harris'];

            //loop through election symbology
            for (var j = 0; j < electionLabels.length; j++){
                div.innerHTML += 
                '<i style="background:' + electionColors[j] + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
                electionLabels[j] + '<br>';
            }
    return div;
        }
        legend2.addTo(map2)
    }
//assign color based on org type
function colorchooser(Value){
    if(Value == "For-profit organization"){
        return "#E84E66" //vibrant pink
    }
    else if(Value == "Medical center"){
        return "#FCD475" //pale yellow
    }
    else if(Value == "Museum"){
        return  "#C7E3B6" //light green
    }
    else if(Value == "Non-profit organization"){
        return "#4CB679" //green
    }
    else if(Value == "Private Institution of Higher Education"){
        return "#F9D5D6" //light pink
    }
    else if(Value == "Public Institution of Higher Education"){
        return "#674196" //darker purple
    }
    else if(Value == "Research institute"){
        return "#1A4D2E" //forest green
    }
    else if(Value == "Small business"){
        return "#CC7DB1" //plum
    }
    else if(Value == "Tribal designated organization"){
        return "#f1FA8C" //lime green
    }
}

//add circle markers for point features to the map
function createPropSymbols(data){
    var prop_attribute = "award_count"
    var color_attribute = "recipient_type"
  //create marker options
  var geojsonMarkerOptions = {
    radius : 5,
    fillColor: "#ff0000",
    color: "black",
    weight:1,
    opacity: 1,
    fillOpacity: 1
  };

  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        var attValue = Number(feature.properties[prop_attribute]);
        var Value = feature.properties[color_attribute];
        var zoomLevel = map2.getZoom();
        
        geojsonMarkerOptions.radius = calcPropRadius(attValue, zoomLevel);
        geojsonMarkerOptions.fillColor = colorchooser(Value);

        //create circles
        var layer = L.circleMarker(latlng, geojsonMarkerOptions);
        //add a popup layer
        var popupContent = "<p><b>Recipient Name: </b>" + feature.properties.name +
        "<br><b>Recipient Type: </b>" + feature.properties.recipient_type +
        "<br><b>Total Number of Awards: </b>" + feature.properties.award_count +
        "<br><b>Total Funding Awarded ($): </b>" + feature.properties.total_funding_awarded;
       
        layer.bindPopup(popupContent);
layer.on({
    mouseover: function(e) {
        var layer = e.target;
        layer.openPopup();
    },
    mouseout: function (e) {
        var layer= e.target;
        layer.closePopup();
    }
});
        return layer;
    }
  }).addTo(map2);
}
createPropSymbols(pointData);
createLegend();

})

.catch(error => {
    console.error("Error loading the GeoJSON data:", error);
});

    
})
