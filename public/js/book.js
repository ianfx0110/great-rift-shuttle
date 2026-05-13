document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const dynamicSteps = document.getElementById('dynamic-steps');
    const stepBar = document.getElementById('stepBar');
    
    let bookingData = {
        from: null,
        to: null,
        date: null,
        passengers: 1,
        tripId: null,
        selectedSeats: [],
        details: []
    };

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(searchForm);
            bookingData.from = fd.get('from');
            bookingData.to = fd.get('to');
            bookingData.date = fd.get('date');
            bookingData.passengers = parseInt(fd.get('passengers'));

            await goToStep(2);
        });
    }

    async function goToStep(step) {
        // Update Step Bar
        document.querySelectorAll('.step').forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === step);
            s.classList.toggle('done', sNum < step);
        });

        // Hide all steps
        document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
        
        const container = document.getElementById('dynamic-steps');
        container.innerHTML = '<div class="text-center p-2"><i class="ti ti-loader animate-spin"></i> Loading...</div>';

        if (step === 2) {
            const res = await fetch(`/api/trips/search?from=${bookingData.from}&to=${bookingData.to}&date=${bookingData.date}`);
            const trips = await res.json();
            
            let html = `<h3>Select Your Trip</h3><div class="mt-1">`;
            trips.forEach(t => {
                html += `
                    <div class="card mb-1 flex justify-between items-center transition hover:border-primary cursor-pointer" onclick="selectTrip(${t.id})">
                        <div>
                            <p class="font-bold text-lg">${t.time}</p>
                            <p class="text-muted text-sm">${t.vehicle}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-primary font-bold">KES ${t.fare}</p>
                            <p class="text-xs text-muted">${t.seats} seats left</p>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else if (step === 3) {
            let html = `<h3>Select ${bookingData.passengers} Seat(s)</h3><div class="seat-grid">`;
            for (let i = 1; i <= 14; i++) {
                if (i % 3 === 0) html += `<div class="aisle"></div>`;
                html += `<div class="seat-item" onclick="toggleSeat(this, '${i}')">${i}</div>`;
            }
            html += `</div><div class="mt-2 text-right"><button class="pure-button btn-primary" onclick="goToStep(4)">Continue &rarr;</button></div>`;
            container.innerHTML = html;
        } else if (step === 4) {
            let html = `<h3>Passenger Details</h3><form id="detailsForm" class="pure-form pure-form-stacked mt-1">`;
            for (let i = 0; i < bookingData.passengers; i++) {
                html += `
                    <div class="mb-2">
                        <h5>Passenger ${i+1} (Seat ${bookingData.selectedSeats[i] || '?'})</h5>
                        <div class="pure-g">
                            <div class="pure-u-1 pure-u-md-1-2">
                                <label>Full Name</label>
                                <input type="text" name="name_${i}" required class="pure-input-1">
                            </div>
                            <div class="pure-u-1 pure-u-md-1-2">
                                <label>National ID / Passport</label>
                                <input type="text" name="id_${i}" required class="pure-input-1">
                            </div>
                        </div>
                    </div>
                `;
            }
            html += `</form><div class="text-right"><button class="pure-button btn-primary" onclick="submitDetails()">Confirm Details &rarr;</button></div>`;
            container.innerHTML = html;
        } else if (step === 5) {
            const total = bookingData.passengers * 1500; // Mock fare
            container.innerHTML = `
                <div class="text-center">
                    <h3>Confirm & Send via WhatsApp</h3>
                    <p class="text-xl mt-1">Amount to Pay: <strong>KES ${total}</strong></p>
                    <p class="text-muted text-sm mb-2">Click below to send your booking details to our official WhatsApp line for confirmation and payment instructions.</p>
                    <div class="mt-2 max-w-sm mx-auto">
                        <button class="pure-button btn-primary w-full mt-1 flex items-center justify-center gap-1" onclick="sendBookingWhatsApp()">
                            <i class="ti ti-brand-whatsapp"></i> Send Booking via WhatsApp
                        </button>
                    </div>
                </div>
            `;
        } else if (step === 6) {
            container.innerHTML = `
                <div class="text-center p-2">
                    <i class="ti ti-circle-check text-6xl text-success mb-1"></i>
                    <h2>Booking Confirmed!</h2>
                    <p class="text-muted">Your ticket has been sent to your phone and email.</p>
                    <div class="card mt-2 text-left max-w-md mx-auto">
                        <p><strong>Reference:</strong> GR8-XYZ-789</p>
                        <p><strong>Trip:</strong> Nairobi to Eldoret</p>
                        <p><strong>Date:</strong> ${bookingData.date}</p>
                        <p><strong>Seats:</strong> ${bookingData.selectedSeats.join(', ')}</p>
                    </div>
                    <div class="mt-2 flex gap-1 justify-center">
                        <button class="pure-button btn-outline">Download PDF</button>
                        <a href="/" class="pure-button btn-primary">Go Home</a>
                    </div>
                </div>
            `;
        }
    }

    window.selectTrip = (id) => {
        bookingData.tripId = id;
        goToStep(3);
    };

    window.toggleSeat = (el, seat) => {
        if (el.classList.contains('taken')) return;
        
        if (el.classList.contains('selected')) {
            el.classList.remove('selected');
            bookingData.selectedSeats = bookingData.selectedSeats.filter(s => s !== seat);
        } else {
            if (bookingData.selectedSeats.length >= bookingData.passengers) {
                window.showToast(`You can only select ${bookingData.passengers} seat(s)`, 'error');
                return;
            }
            el.classList.add('selected');
            bookingData.selectedSeats.push(seat);
        }
    };

    window.goToStep = goToStep;
    
    window.submitDetails = () => {
        const form = document.getElementById('detailsForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        goToStep(5);
    };

    window.sendBookingWhatsApp = () => {
        const total = bookingData.passengers * 1500;
        let message = `*NEW BOOKING REQUEST*\n\n`;
        message += `*Route:* ${bookingData.from} to ${bookingData.to}\n`;
        message += `*Date:* ${bookingData.date}\n`;
        message += `*Passengers:* ${bookingData.passengers}\n`;
        message += `*Seats:* ${bookingData.selectedSeats.join(', ')}\n\n`;
        message += `*Passenger Details:*\n`;
        
        const detailsForm = document.getElementById('detailsForm');
        if (detailsForm) {
            const fd = new FormData(detailsForm);
            for (let i = 0; i < bookingData.passengers; i++) {
                message += `- ${fd.get(`name_${i}`)} (ID: ${fd.get(`id_${i}`)})\n`;
            }
        }

        message += `\n*Total Amount:* KES ${total}\n`;
        message += `\nPlease confirm availability and provide payment details.`;

        const encoded = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/254115481162?text=${encoded}`;
        
        window.open(whatsappUrl, '_blank');
        goToStep(6);
    };

    window.initiateMpesa = () => {
        window.showToast("M-Pesa STK Push sent! Please check your phone.");
        setTimeout(() => goToStep(6), 3000);
    };
});
