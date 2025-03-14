var map1 = L.map('map1').setView([39.7392, -100.55], 4.45); // Center map over Mexico

L.tileLayer('https://api.mapbox.com/styles/v1/griggkyl/cm869xyfd007q01sscz00c6pl/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3JpZ2dreWwiLCJhIjoiY202emRreHVyMDN3NjJycTIzNGJ6NzRnaSJ9.aEoPhdkBaG6QTaCUAzXcSw', {
    
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Imagery &copy; <a href="https://www.mapbox.com">Mapbox</a>',
    maxZoom: 16
}).addTo(map1);

   
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

var recipientLayers= {};
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        var attValue = Number(feature.properties[prop_attribute]);
        var Value = feature.properties[color_attribute];
        geojsonMarkerOptions.radius = calcPropRadius(attValue);
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

// //Function to aggregate by recipient type
// function byRecipientType(data){
//     const fundingByType = {};

//     //Loop through each feature
//     data.features.forEach(function(feature){
//         const recipientType = feature.properties.recipient_type;
//         const fundingLost = feature.properties.total_funding_awarded;

//         //aggregate funding
//         if(!fundingByType[recipientType]){
//             fundingByType[recipientType] = 0;
//         }
//         fundingByType[recipientType] += fundingLost;
//     });
//     return fundingByType;
// }

// //function to create the bar chart
// function createFundingBarChart(fundingData){
//     var ctx = document.getElementById('fundingBarChart').getContext('2d');

//     // Extract labels (recipient types) and data (funding lost)
//     var labels = Object.keys(fundingData);
//     var data = Object.values(fundingData);

//     // Create the chart
//     new Chart(ctx, {
//         type: 'bar', // Specify that it's a bar chart
//         data: {
//             labels: labels, // X-axis labels (recipient types)
//             datasets: [{
//                 label: 'Amount of Funding Lost ($)',
//                 data: data, // Y-axis data (funding lost)
//                 backgroundColor: 'rgba(54, 162, 235, 0.2)', // Bar color (blue with transparency)
//                 borderColor: 'rgba(54, 162, 235, 1)', // Border color of bars
//                 borderWidth: 1 // Border width
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true // Ensure the y-axis starts at 0
//                 }
//             }
//         }
//     });
// }

}
  
fetch("data/geojsons/funding_loss_summary!.geojson")
.then(response => response.json())
.then(data => { 
    // const fundingByType = byRecipientType(data);
    // createFundingBarChart(fundingByType);
createPropSymbols(data)}).addTo(map1)



.catch(error => {
    console.error("Error loading the GeoJSON data:", error);
});

