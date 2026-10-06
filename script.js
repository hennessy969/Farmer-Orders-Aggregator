var listings = [];
var orders = [];
var nextId = 1;

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function left(l) {
  var used = 0;
  orders.forEach(function (o) {
    if (o.listingId === l.id) used += o.qty;
  });
  return l.qty - used;
}

function show(t) {
  ["farmer", "buyer", "pick"].forEach(function (k) {
    document.getElementById(k).hidden = k !== t;
  });
  renderAll();
}

function renderAvailable() {
  var html = listings.map(function (l) {
    return "<p><strong>" + esc(l.produce) + "</strong> <br/>" + esc(l.farmer) +
      ": " + left(l) + " " + esc(l.unit) + " left . GH₵" + l.price +
      "  / " + esc(l.unit) + " (" + esc(l.location) + ")</p>";
  }).join("");
  document.getElementById("available").innerHTML = html || "<p>No listings yet.</p>";
}

function renderBuyer() {
  var html = listings.map(function (l) {
    return "<div><strong>" + esc(l.produce) + "</strong> : " + esc(l.farmer) +
      "<br>" + left(l) + " " + esc(l.unit) + " left. GH₵" + l.price +
      " / " + esc(l.unit) + ". Collect at " + esc(l.location) + "<br>" +
      '<input type="number" min="1" id="q' + l.id + '" placeholder="Qty"> ' +
      '<button type="button" data-order="' + l.id + '">Order</button>' +
      '<p id="m' + l.id + '"></p></div><hr>';
  }).join("");
  document.getElementById("buyerList").innerHTML = html || "<p>Nothing to order yet.</p>";
}

function renderPick() {
  var groups = {};
  orders.forEach(function (o) {
    var l = listings.find(function (x) { return x.id === o.listingId; });
    var key = l.produce + " (" + l.unit + ")";
    groups[l.location] = groups[l.location] || {};
    groups[l.location][key] = (groups[l.location][key] || 0) + o.qty;
  });
  var html = Object.keys(groups).map(function (loc) {
    var rows = Object.keys(groups[loc]).map(function (k) {
      return "<li>" + esc(k) + ": " + groups[loc][k] + "</li>";
    }).join("");
    return "<h3>" + esc(loc) + "</h3><ul>" + rows + "</ul>";
  }).join("");
  document.getElementById("pickList").innerHTML = html || "<p>No orders yet.</p>";
}

function renderAll() {
  renderAvailable();
  renderBuyer();
  renderPick();
}

document.querySelectorAll("nav button").forEach(function (b) {
  b.onclick = function () {
    show(b.dataset.t);
  };
});

document.getElementById("add").onclick = function () {
  var farmer = document.getElementById("farmerName").value.trim();
  var produce = document.getElementById("produce").value.trim();
  var qty = Number(document.getElementById("quantity").value);
  var price = document.getElementById("price").value;
  var location = document.getElementById("location").value;
  if (!farmer || !produce || qty <= 0 || price === "" || !location) {
    alert("Please fill in every field.");
    return;
  }
  listings.push({
    id: nextId++, farmer: farmer, produce: produce, qty: qty,
    unit: document.getElementById("unit").value,
    price: Number(price), location: location
  });
  document.querySelector("#farmer form").reset();
  renderAll();
};

document.getElementById("buyerList").onclick = function (e) {
  var id = Number(e.target.dataset.order);
  if (!id) return;
  var l = listings.find(function (x) { return x.id === id; });
  var qty = Number(document.getElementById("q" + id).value);
  var msg = document.getElementById("m" + id);
  var name = document.getElementById("buyerName").value.trim();
  if (!name) { msg.textContent = "Enter your name first."; return; }
  if (qty <= 0) { msg.textContent = "Enter a quantity."; return; }
  if (qty > left(l)) { msg.textContent = "Only " + left(l) + " left."; return; }
  orders.push({ buyer: name, listingId: id, qty: qty });
  renderAll();
};

renderAll();