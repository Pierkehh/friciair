document.addEventListener("DOMContentLoaded", () => {
  const isAdminPage = document.getElementById("addFlightBtn") !== null;
  const flightList = document.getElementById(isAdminPage ? "flightListAdmin" : "flightList");

  if (isAdminPage) {
    setupAdminPanel(flightList);
  } else {
    setupPassengerView(flightList);
  }
});

// === UTAS OLDAL (jegyvásárlás, lekérdezés) ===

function setupPassengerView(flightList) {
  const flights = JSON.parse(localStorage.getItem("flights")) || [];

  if (!flights.length) {
    flightList.innerHTML = "<li>Nincs elérhető járat.</li>";
    return;
  }

  flightList.innerHTML = "";
  flights.forEach((flight, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${flight.date} | ${flight.from} → ${flight.to} | ${flight.aircraft.toUpperCase()} | ${flight.travelClass}
      <br/>
      <button onclick="openModal(${index})">Jegyet veszek</button>
    `;
    flightList.appendChild(li);
  });

  const modal = document.getElementById("ticketModal");
  const form = document.getElementById("ticketForm");
  const cancelBtn = document.getElementById("cancelBtn");

  let selectedFlightIndex = null;

  window.openModal = function(index) {
    selectedFlightIndex = index;
    modal.classList.remove("hidden");
  };

  function closeModal() {
    modal.classList.add("hidden");
    form.reset();
    selectedFlightIndex = null;
  }

  cancelBtn?.addEventListener("click", closeModal);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("buyerName").value;
    const count = parseInt(document.getElementById("ticketCount").value);

    if (!name || count <= 0) {
      alert("Adj meg érvényes nevet és jegyszámot!");
      return;
    }

    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];

    const flight = flights[selectedFlightIndex];

    tickets.push({
      name,
      count,
      flight
    });

    localStorage.setItem("tickets", JSON.stringify(tickets));
    alert("Jegyvásárlás sikeres!");
    closeModal();
  });
}

// === ADMIN PANEL (járatfelvétel, törlés, szerkesztés) ===

function setupAdminPanel(flightListAdmin) {
  const aircraftSelect = document.getElementById("aircraft");
  const classSelect = document.getElementById("travelClass");
  const addFlightBtn = document.getElementById("addFlightBtn");

  const allAircrafts = ["a380", "a320neo", "a321neo", "a330", "b747", "b737", "b787"];
  const businessAircrafts = ["a380", "a330", "b747", "b737", "b787"]; // csak ezek legyenek választhatók business class esetén

  function populateAircrafts(aircrafts) {
    aircraftSelect.innerHTML = "";
    aircrafts.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type.toUpperCase();
      aircraftSelect.appendChild(option);
    });
  }

  // alapértelmezett: economy
  populateAircrafts(allAircrafts);

  classSelect.addEventListener("change", () => {
    if (classSelect.value === "business") {
      populateAircrafts(businessAircrafts);
    } else {
      populateAircrafts(allAircrafts);
    }
  });

  addFlightBtn.addEventListener("click", () => {
    const from = document.getElementById("from").value.trim();
    const to = document.getElementById("to").value.trim();
    const date = document.getElementById("date").value;
    const travelClass = classSelect.value;
    const aircraft = aircraftSelect.value;
    const today = new Date().toISOString().split("T")[0];
if (date < today) {
  alert("A dátumnak a jövőben kell lennie!");
  return;
}


    if (!from || !to || !date) {
      alert("Kérlek tölts ki minden mezőt!");
      return;
    }

    const flights = JSON.parse(localStorage.getItem("flights")) || [];

    flights.push({ from, to, date, travelClass, aircraft });

    localStorage.setItem("flights", JSON.stringify(flights));
    alert("Járat hozzáadva!");

    document.getElementById("from").value = "";
    document.getElementById("to").value = "";
    document.getElementById("date").value = "";

    renderFlightList(flightListAdmin);
  });

  function renderFlightList(list) {
    const flights = JSON.parse(localStorage.getItem("flights")) || [];
    list.innerHTML = "";

    if (flights.length === 0) {
      list.innerHTML = "<li>Nincs járat.</li>";
      return;
    }

    flights.forEach((flight, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${flight.date} | ${flight.from} → ${flight.to} | ${flight.aircraft.toUpperCase()} | ${flight.travelClass}
        <button class="editBtn" data-index="${index}">Szerkesztés</button>
        <button class="deleteBtn" data-index="${index}">Törlés</button>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index);
        if (confirm("Biztosan törlöd a járatot?")) {
          const flights = JSON.parse(localStorage.getItem("flights")) || [];
          flights.splice(i, 1);
          localStorage.setItem("flights", JSON.stringify(flights));
          renderFlightList(list);
        }
      });
    });

    list.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index);
        const flights = JSON.parse(localStorage.getItem("flights")) || [];
        const f = flights[i];

        const from = prompt("Indulás:", f.from);
        const to = prompt("Érkezés:", f.to);
        const date = prompt("Dátum (YYYY-MM-DD):", f.date);
        const travelClass = prompt("Osztály (economy/business):", f.travelClass);
        const aircraft = prompt("Géptípus:", f.aircraft);

        if (from && to && date && travelClass && aircraft) {
          flights[i] = { from, to, date, travelClass, aircraft };
          localStorage.setItem("flights", JSON.stringify(flights));
          renderFlightList(list);
        }
      });
    });
  }

  renderFlightList(flightListAdmin);
}
function renderTickets() {
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
  const list = document.getElementById("ticketListAdmin");
  list.innerHTML = "";

  if (!tickets.length) {
    list.innerHTML = "<li>Nincs eladott jegy.</li>";
    return;
  }

  tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.name} vett ${t.count} db jegyet a ${t.flight.from} → ${t.flight.to} járatra (${t.flight.date})`;
    list.appendChild(li);
  });
}
function setupPassengerView(flightList) {
  let flights = JSON.parse(localStorage.getItem("flights")) || [];

  function renderFlights(list = flights) {
    if (!list.length) {
      flightList.innerHTML = "<li>Nincs elérhető járat.</li>";
      return;
    }

    flightList.innerHTML = "";
    list.forEach((flight, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${flight.date} | ${flight.from} → ${flight.to} | ${flight.aircraft.toUpperCase()} | ${flight.travelClass}
        <br/>
        <button onclick="openModal(${index})">Jegyet veszek</button>
      `;
      flightList.appendChild(li);
    });
  }

  renderFlights(); // első betöltés

  // === Kereső funkció ===
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");

  searchBtn?.addEventListener("click", () => {
    const from = document.getElementById("searchFrom").value.trim().toLowerCase();
    const to = document.getElementById("searchTo").value.trim().toLowerCase();
    const date = document.getElementById("searchDate").value;

    const filtered = flights.filter(f =>
      (!from || f.from.toLowerCase().includes(from)) &&
      (!to || f.to.toLowerCase().includes(to)) &&
      (!date || f.date === date)
    );

    renderFlights(filtered);
  });

  resetBtn?.addEventListener("click", () => {
    document.getElementById("searchFrom").value = "";
    document.getElementById("searchTo").value = "";
    document.getElementById("searchDate").value = "";
    renderFlights();
  });

  // ... a jegyvásárlási modalos rész marad változatlan ...
}
window.openModal = function(index) {
  selectedFlightIndex = index;
  modal.classList.remove("hidden");
};
