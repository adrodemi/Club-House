// Initialize the map
var map = L.map('map', { zoomControl: false }).setView([34.6823, 33.0460], 13);

// Add the CartoDB Dark Matter tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Custom marker icon
var customIcon = L.icon({
    iconUrl: './images/custom-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

// Array to store events
var events = [];

// Click event to create a new event
map.on('click', function (e) {
    openCreateEventPopup(e.latlng);
});

function openCreateEventPopup(latlng) {
  var popupContent = `
      <div style="color: white;">
          <h3>Create Event</h3>
          <form id="eventForm">
              <label for="title" style="display:block; margin-bottom: 8px;">Event Title:</label>
              <input type="text" id="title" name="title" placeholder="Enter event title" required>
              
              <label style="display:block; margin-bottom: 8px;">Upload Photo (Optional):</label>
              <label for="photo" class="custom-file-upload">Choose File</label>
              <input type="file" id="photo" name="photo" accept="image/*">
              <div id="uploaded-file-name"></div> <!-- Shows the uploaded file name -->
              
              <label for="description" style="display:block; margin-bottom: 8px;">Description:</label>
              <textarea id="description" name="description" placeholder="Enter event description" required></textarea>
              
              <button type="button" onclick="saveEvent(${latlng.lat}, ${latlng.lng})">Save Event</button>
          </form>
      </div>
  `;

  L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);

  // Add event listener to display the selected file name
  document.getElementById('photo').addEventListener('change', function (e) {
      const fileName = e.target.files[0] ? e.target.files[0].name : '';
      document.getElementById('uploaded-file-name').textContent = fileName ? `Selected: ${fileName}` : '';
  });
}

function saveEvent(lat, lng) {
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var photoInput = document.getElementById('photo');
    var photoFile = photoInput.files[0];

    if (title && description) {
        var formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('latitude', lat);
        formData.append('longitude', lng);
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        fetch('http://127.0.0.1:5000/create-event', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert('Event created successfully!');
                } else {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        map.closePopup();
    } else {
        alert("Please fill out all fields.");
    }
}

function loadEvents() {
    fetch('http://127.0.0.1:5000/events')
        .then(response => response.json())
        .then(events => {
            events.forEach(event => {
                var marker = L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map);
                var popupContent = `
                    <div>
                        <h3>${event.title}</h3>
                        ${event.photoUrl ? `<img src="http://127.0.0.1:5000/${event.photoUrl}" alt="Event Photo" style="width:100%; max-height:150px; object-fit:cover; margin-bottom:8px;">` : ''}
                        <p>${event.description}</p>
                    </div>
                `;
                marker.bindPopup(popupContent);
            });
        })
        .catch(error => {
            console.error('Error loading events:', error);
        });
}

// Call the function after initializing the map
loadEvents();

function createMarker(event) {
  var marker = L.marker([event.lat, event.lng], { icon: customIcon }).addTo(map);
  var popupContent = `
      <div>
          <h3>${event.title}</h3>
          ${event.photoUrl ? `<img src="${event.photoUrl}" alt="Event Photo" style="width:100%; max-height:150px; object-fit:cover; margin-bottom:8px;">` : ''}
          <p>${event.description}</p>
      </div>
  `;
  marker.bindPopup(popupContent);
}
