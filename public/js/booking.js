/* booking.js - Multi-step booking wizard logic */
const state = {
  step: 1,
  search: { from: '', to: '', date: '', passengers: 1 },
  selectedTrip: null,
  selectedSeats: [],
  passengers: [],
  payment: { phone: '' }
};

const towns = [
  { id: 1, name: 'Nairobi' },
  { id: 2, name: 'Nakuru' },
  { id: 3, name: 'Eldoret' },
  { id: 4, name: 'Kisumu' }
];

function init() {
  renderStep();
}

function renderStep() {
  const container = document.getElementById('booking-wizard');
  if (!container) return;

  updateProgressBar();

  switch(state.step) {
    case 1: renderSearch(container); break;
    case 2: renderChooseTrip(container); break;
    case 3: renderSelectSeats(container); break;
    case 4: renderPassengerDetails(container); break;
    case 5: renderPayment(container); break;
    case 6: renderConfirmation(container); break;
  }
}

function renderSearch(container) {
  container.innerHTML = `
    <div class="card">
      <h2>Search for a Trip</h2>
      <div class="grid grid-2 gap-4 mt-6">
        <div class="form-group">
          <label>From</label>
          <select id="from" class="input-field">
            ${towns.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>To</label>
          <select id="to" class="input-field">
            ${towns.map(t => `<option value="${t.id}" ${t.id === 3 ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Travel Date</label>
          <input type="date" id="date" class="input-field" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Passengers</label>
          <input type="number" id="passengers" class="input-field" min="1" max="8" value="1">
        </div>
      </div>
      <button onclick="handleSearch()" class="btn btn-primary mt-8 w-full">Search Trips</button>
    </div>
  `;
}

async function handleSearch() {
  state.search = {
    from: document.getElementById('from').value,
    to: document.getElementById('to').value,
    date: document.getElementById('date').value,
    passengers: parseInt(document.getElementById('passengers').value)
  };
  
  // API Call placeholder
  // const res = await fetch(`/api/trips/search?from=${...}`);
  // const data = await res.json();
  
  state.trips = [
    { id: 1, departure_time: '08:00', fare: 1500, vehicle_type: '14-seater', seats_available: 8 },
    { id: 2, departure_time: '11:00', fare: 1500, vehicle_type: '14-seater', seats_available: 12 }
  ];
  
  state.step = 2;
  renderStep();
}

function renderChooseTrip(container) {
  container.innerHTML = `
    <div class="card">
      <button onclick="state.step=1; renderStep()" class="btn btn-ghost mb-4">← Back to Search</button>
      <h2>Available Trips</h2>
      <div class="mt-6 flex flex-col gap-4">
        ${state.trips.map(trip => `
          <div class="card flex justify-between align-center p-4 border border-border">
            <div>
              <h3>${trip.departure_time}</h3>
              <p class="text-muted">${trip.vehicle_type}</p>
            </div>
            <div class="text-right">
              <span class="font-bold text-lg">KES ${trip.fare}</span>
              <p class="text-success text-sm">${trip.seats_available} seats left</p>
              <button onclick="selectTrip(${JSON.stringify(trip).replace(/"/g, '&quot;')})" class="btn btn-primary btn-sm mt-2">Select</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function selectTrip(trip) {
  state.selectedTrip = trip;
  state.step = 3;
  renderStep();
}

// Simple Seat Map Implementation
function renderSelectSeats(container) {
  container.innerHTML = `
    <div class="card">
       <button onclick="state.step=2; renderStep()" class="btn btn-ghost mb-4">← Back to Trips</button>
       <h2>Select Your Seats</h2>
       <div class="seat-map mt-8" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 300px; margin: 0 auto;">
          ${Array.from({length: 14}).map((_, i) => {
            const seatNum = i + 1;
            const isBooked = [3, 4, 7].includes(seatNum);
            return `<div 
              onclick="${isBooked ? '' : `toggleSeat(${seatNum})`}"
              class="seat ${isBooked ? 'booked' : ''} ${state.selectedSeats.includes(seatNum) ? 'selected' : ''}"
              style="width: 50px; height: 50px; background: ${isBooked ? '#ccc' : (state.selectedSeats.includes(seatNum) ? 'var(--accent)' : 'var(--primary-light)')}; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: ${isBooked ? 'not-allowed' : 'pointer'}; color: white;">
              ${seatNum}
            </div>`;
          }).join('')}
       </div>
       <div class="mt-8 text-center">
         <p>Selected: ${state.selectedSeats.join(', ') || 'None'}</p>
         <button onclick="handleSeatsSubmit()" class="btn btn-primary mt-4 w-full" ${state.selectedSeats.length !== state.search.passengers ? 'disabled' : ''}>Continue</button>
       </div>
    </div>
  `;
}

function toggleSeat(num) {
  const index = state.selectedSeats.indexOf(num);
  if (index > -1) {
    state.selectedSeats.splice(index, 1);
  } else if (state.selectedSeats.length < state.search.passengers) {
    state.selectedSeats.push(num);
  }
  renderSelectSeats(document.getElementById('booking-wizard'));
}

function handleSeatsSubmit() {
  state.step = 4;
  renderStep();
}

function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (bar) {
    const progress = ((state.step - 1) / 5) * 100;
    bar.style.width = `${progress}%`;
  }
}

// Fallbacks for missing components
function renderPassengerDetails(container) { container.innerHTML = `<h3>Passenger Details Step</h3><button onclick="state.step=5;renderStep()" class="btn btn-primary">Pay Now</button>`; }
function renderPayment(container) { container.innerHTML = `<h3>Payment Step</h3><button onclick="state.step=6;renderStep()" class="btn btn-primary">Confirm</button>`; }
function renderConfirmation(container) { container.innerHTML = `<h3>Success! Ticket Booked.</h3><a href="/" class="btn btn-primary">Go Home</a>`; }

window.handleSearch = handleSearch;
window.selectTrip = selectTrip;
window.toggleSeat = toggleSeat;
window.handleSeatsSubmit = handleSeatsSubmit;

init();
