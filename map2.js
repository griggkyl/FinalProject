var map2 = L.map('map2').setView([39.7392, -100.55], 4.45); // Center map over Mexico

L.tileLayer('https://api.mapbox.com/styles/v1/griggkyl/cm869xyfd007q01sscz00c6pl/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3JpZ2dreWwiLCJhIjoiY202emRreHVyMDN3NjJycTIzNGJ6NzRnaSJ9.aEoPhdkBaG6QTaCUAzXcSw', {
    
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Imagery &copy; <a href="https://www.mapbox.com">Mapbox</a>',
    maxZoom: 16
}).addTo(map2);


function countyColor(feature){
    //define features
    var countyAtt = "2024_US_County_Level_Presidential_Results_diff"
    //tie them to the feature
    var votesDiff = feature.properties[countyAtt]

    //conditional color logic
    var fillColor;
    if(votesDiff >= 0) {
        fillColor =  "#D7003A"; //red for majority GOP
    } else {
        fillColor = "#4682B4"; //blue
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
function calcPropRadius(attValue){
    var minRadius = 3;
    var radius = Math.sqrt(attValue)*2;
    return Math.max(radius, minRadius);
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
        return "#1FA8C" //lime green
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
        geojsonMarkerOptions.radius = calcPropRadius(attValue);
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
createPropSymbols(pointData)

})

.catch(error => {
    console.error("Error loading the GeoJSON data:", error);
});

    
})
