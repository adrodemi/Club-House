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
      var newEvent = { lat, lng, title, description, photoUrl: null };

      // If a photo is uploaded, process it
      if (photoFile) {
          var reader = new FileReader();
          reader.onload = function (e) {
              newEvent.photoUrl = e.target.result;

              // Save the event with the photo
              createMarker(newEvent);
          };
          reader.readAsDataURL(photoFile); // Convert photo to base64
      } else {
          // Save the event without a photo
          createMarker(newEvent);
      }

      // Close the popup
      map.closePopup();
  } else {
      alert("Please fill out all fields.");
  }
}

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
