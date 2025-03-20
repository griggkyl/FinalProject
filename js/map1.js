
        
map1 = L.map('map1').setView([40, -105.782], 4); // Adjust initial view
L.tileLayer('https://api.mapbox.com/styles/v1/griggkyl/cm869xyfd007q01sscz00c6pl/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3JpZ2dreWwiLCJhIjoiY202emRreHVyMDN3NjJycTIzNGJ6NzRnaSJ9.aEoPhdkBaG6QTaCUAzXcSw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Imagery &copy; <a href="https://www.mapbox.com">Mapbox</a>',
    maxZoom: 19
}).addTo(map1);

fetch("data/geojsons/funding_loss_summary!.geojson")
.then(response => response.json())
.then(data => { 
    // const fundingByType = byRecipientType(data);
    // createFundingBarChart(fundingByType);
createPropSymbols(data);
createLegend();
})



.catch(error => {
    console.error("Error loading the GeoJSON data:", error);
});

//create the legend 
function createLegend() {
var legend = L.control({position: 'topleft'});

legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<strong> Recipient Type </strong><br>'; //title
    categories = ['For-profit Organization', 'Medical Center', 'Museum', 'Non-profit Organization', 
        'Private Institution of Higher Education', 'Public Institution of Higher Education', 
        'Research Institute', 'Small Business', 'Designated Tribal Organization ']
        colors = ["#E84E66", "#FCD475", "#C7E3B6", "#4CB679", "#F9D5D6","#674196", "#1A4D2E", "#CC7DB1",  "#f1FA8C"]

        //loop through the categories and generate a label
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
            '<i style="background:' + colors[i] + '; width: 20px; height:20px; display: inline-block; margin-right: 5px;"></i> ' + categories[i] + '<br>';
        }
return div;
    }
    legend.addTo(map1)
}
//calculate the radius based on amount of funding lost (or number of awards??)
function calcPropRadius(attValue, zoomLevel){
    var minRadius = 5;
    var maxRadius = 18;
    var radius = Math.sqrt(attValue)*2;

    //adjust the radius based on zoom level
    radius = radius / Math.pow(1.05, (zoomLevel - 10));
  

    //ensure the radius doesn't go below a minimum or above a maximum threshold
   radius = Math.max(minRadius, Math.min(radius, maxRadius));

    return radius
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
    if (!data.features || data.features.length === 0) {
        console.log("No features found in the GeoJSON data.");
        return;
    }
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

var recipientLayers= {};
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        var attValue = Number(feature.properties[prop_attribute]);
        var Value = feature.properties[color_attribute];
        var zoomLevel = map1.getZoom();
    
        //calculate the marker based on attribute and zoom level
        geojsonMarkerOptions.radius = calcPropRadius(attValue, zoomLevel);
       //color based on recipient type
        geojsonMarkerOptions.fillColor = colorchooser(Value);

        //create circles
        var layer = L.circleMarker(latlng, geojsonMarkerOptions);

        //if the layer doesn't exist, create it 
        if (!recipientLayers[Value]) {
            recipientLayers[Value] = L.layerGroup(); //create a new layer for the sect
        }

        //add the marker to the correct sect layer
        recipientLayers[Value].addLayer(layer);
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
  }).addTo(map1);

  //add a control to toggle layers based on recipient type
   // Add each layer to the map by default
   for (var type in recipientLayers) {
    recipientLayers[type].addTo(map1);  // Add the recipient layers to the map
}

  var overlays = {};
  for (var type in recipientLayers) {
    overlays[type] = recipientLayers[type]
  }
  L.control.layers(null, overlays).addTo(map1);

}


