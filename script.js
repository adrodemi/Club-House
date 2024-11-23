// Initialize the map
const map = L.map('map', { zoomControl: false }).setView([34.6823, 33.0460], 13);

// Add the CartoDB Dark Matter tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Custom marker icon
const customIcon = L.icon({
    iconUrl: './pictures/pointToGo_high_res.png', // Update with your actual icon path
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});


// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const toggleSidebarButton = document.getElementById('toggle-sidebar');

// Toggle sidebar visibility
toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});

// Populate sidebar with events
function populateSidebar(events) {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = ''; // Clear the existing list

    events.forEach(event => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '10px';

        listItem.innerHTML = `
            <strong>${event.title}</strong><br>
            ${event.description}<br>
            <button onclick="centerMap(${event.latitude}, ${event.longitude})" style="margin-top: 5px; background-color: #2ecc71; color: white; padding: 5px 10px; border: none; cursor: pointer;">
                View on Map
            </button>
        `;

        eventList.appendChild(listItem);
    });
}

// Center the map on a specific location
function centerMap(lat, lng) {
    map.setView([lat, lng], 15); // Adjust zoom level if needed
}

function renderEvents(events) {
    events.forEach(event => {
        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
            <div style="max-width: 250px;">
                <h3 style="margin-bottom: 10px;">${event.title}</h3>
                ${event.photoUrl ? `<img src="http://127.0.0.1:5000/${event.photoUrl}" alt="Event Photo" style="width:100%; max-height:150px; object-fit:cover; margin-bottom:8px;">` : ''}
                <p style="margin-bottom: 0;">${event.description}</p>
            </div>
        `;
        marker.bindPopup(popupContent);
    });

    // Populate the sidebar with events
    populateSidebar(events);
}

// Example function to add a message to the Event List
function addMessage(username, messageText) {
    const eventList = document.getElementById('event-list');

    // Create the message container
    const messageContainer = document.createElement('li');
    messageContainer.className = 'message-container';

    // Add username
    const usernameElement = document.createElement('p');
    usernameElement.className = 'username';
    usernameElement.textContent = username;
    messageContainer.appendChild(usernameElement);

    // Add message text
    const messageElement = document.createElement('p');
    messageElement.className = 'message';
    messageElement.textContent = messageText;
    messageContainer.appendChild(messageElement);

    // Add icons (like and comment)
    const iconsContainer = document.createElement('div');
    iconsContainer.className = 'message-icons';

    const likeIcon = document.createElement('span');
    likeIcon.className = 'icon';
    likeIcon.textContent = '👍';
    iconsContainer.appendChild(likeIcon);

    const commentIcon = document.createElement('span');
    commentIcon.className = 'icon';
    commentIcon.textContent = '💬';
    iconsContainer.appendChild(commentIcon);

    messageContainer.appendChild(iconsContainer);

    // Add the message container to the Event List
    eventList.appendChild(messageContainer);
}

// Example usage
addMessage('Lanitio Football', 'Vasia69 and Arseny123 are going!');
addMessage('Basketball Shawarma Night', 'anDROID and YaKoV are going to this event!');
addMessage('Cyprus_iT', 'ivaniidze and Sererga3000 are attending!');



// Click event listener to create a new event
map.on('click', (e) => {
    openCreateEventPopup(e.latlng);
});

// Open a popup to create an event
function openCreateEventPopup(latlng) {
    const popupContent = `
        <div style="color: white; max-width: 250px;">
            <h3 style="margin-bottom: 10px;">Create Event</h3>
            <form id="eventForm">
                <label for="title" style="display:block; margin-bottom: 5px;">Event Title:</label>
                <input type="text" id="title" name="title" placeholder="Enter event title" required style="width: 100%; margin-bottom: 10px;">

                <label for="photo" style="display:block; margin-bottom: 5px;">Upload Photo (Optional):</label>
                <label for="photo" class="custom-file-upload" style="display: inline-block; cursor: pointer; color: lightblue;">Choose File</label>
                <input type="file" id="photo" name="photo" accept="image/*" style="display: none;">
                <div id="uploaded-file-name" style="font-size: small; color: lightgray; margin-bottom: 10px;"></div>

                <label for="description" style="display:block; margin-bottom: 5px;">Description:</label>
                <textarea id="description" name="description" placeholder="Enter event description" required style="width: 100%; height: 60px; margin-bottom: 10px;"></textarea>

                <button type="button" onclick="saveEvent(${latlng.lat}, ${latlng.lng})" style="background-color: #2ecc71; color: white; padding: 8px 12px; border: none; cursor: pointer;">Save Event</button>
            </form>
        </div>
    `;

    L.popup()
        .setLatLng(latlng)
        .setContent(popupContent)
        .openOn(map);

    // Display the selected file name when a file is uploaded
    document.getElementById('photo').addEventListener('change', (e) => {
        const fileName = e.target.files[0] ? e.target.files[0].name : '';
        document.getElementById('uploaded-file-name').textContent = fileName ? `Selected: ${fileName}` : '';
    });
}

// Save a new event to the server
async function saveEvent(lat, lng) {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    if (!title || !description) {
        alert("Please fill out all required fields.");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/create-event', {
            method: 'POST',
            body: formData // Automatically sets the proper headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create event.');
        }

        const data = await response.json();
        alert(data.message || 'Event created successfully!');
        map.closePopup();
        loadEvents(); // Reload events to include the new one
    } catch (error) {
        console.error('Error creating event:', error);
        alert(`Error: ${error.message}`);
    }
}

// Load all events from the server
async function loadEvents() {
    try {
        const response = await fetch('http://127.0.0.1:5000/events');
        if (!response.ok) {
            throw new Error('Failed to load events.');
        }

        const events = await response.json();
        renderEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Failed to load events. Please try again later.');
    }
}

// Render events as markers on the map
function renderEvents(events) {
    events.forEach(event => {
        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
            <div style="max-width: 250px;">
                <h3 style="margin-bottom: 10px;">${event.title}</h3>
                ${event.photoUrl ? `<img src="http://127.0.0.1:5000/${event.photoUrl}" alt="Event Photo" style="width:100%; max-height:150px; object-fit:cover; margin-bottom:8px;">` : ''}
                <p style="margin-bottom: 0;">${event.description}</p>
            </div>
        `;
        marker.bindPopup(popupContent);
    });
}

// Call the function to load events after initializing the map
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
