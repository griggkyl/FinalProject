var map = L.map('map').setView([39.7392, -100.55], 4.45); // Center map over Mexico

L.tileLayer('https://api.mapbox.com/styles/v1/griggkyl/cm7dotogg002g01sg8aclfwgt/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3JpZ2dreWwiLCJhIjoiY202emRreHVyMDN3NjJycTIzNGJ6NzRnaSJ9.aEoPhdkBaG6QTaCUAzXcSw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Imagery &copy; <a href="https://www.mapbox.com">Mapbox</a>',
    maxZoom: 16
}).addTo(map);


fetch("data/geojsons/academic_funding_summary2.geojson")
.then(response => response.json())
.then(data => {
    L.geoJSON(data).addTo(map)
})