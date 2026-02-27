let currentType = "text";
let generatedValue = "";

function setType(type){
  currentType = type;
  const inputDiv = document.getElementById("inputs");

  if(type === "text" || type === "url"){
    inputDiv.innerHTML = `<input type="text" id="mainInput" placeholder="Enter ${type}">`;
  }

  if(type === "wifi"){
    inputDiv.innerHTML = `
      <input type="text" id="ssid" placeholder="WiFi Name">
      <input type="text" id="password" placeholder="Password">
    `;
  }

  if(type === "email"){
    inputDiv.innerHTML = `
      <input type="text" id="email" placeholder="Email Address">
    `;
  }

  if(type === "phone"){
    inputDiv.innerHTML = `
      <input type="text" id="phone" placeholder="Phone Number">
    `;
  }
}

setType("text");

function generateQR(){
  const canvas = document.getElementById("qr-code");

  if(currentType === "text" || currentType === "url"){
    generatedValue = document.getElementById("mainInput").value;
  }

  if(currentType === "wifi"){
    const ssid = document.getElementById("ssid").value;
    const password = document.getElementById("password").value;
    generatedValue = `WIFI:T:WPA;S:${ssid};P:${password};;`;
  }

  if(currentType === "email"){
    const email = document.getElementById("email").value;
    generatedValue = `mailto:${email}`;
  }

  if(currentType === "phone"){
    const phone = document.getElementById("phone").value;
    generatedValue = `tel:${phone}`;
  }

  QRCode.toCanvas(canvas, generatedValue, { width: 250 });
}

function copyQRText(){
  if(!generatedValue) return;
  navigator.clipboard.writeText(generatedValue);
}

function downloadQR(){
  const canvas = document.getElementById("qr-code");
  const link = document.createElement('a');
  link.download = "qr-code.png";
  link.href = canvas.toDataURL();
  link.click();
}

let scanCount = localStorage.getItem("scanCount") || 0;
document.getElementById("scan-count").innerText = "Total Scans: " + scanCount;

function saveHistory(text){
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(text);
  localStorage.setItem("history", JSON.stringify(history));
  showHistory();
}

function showHistory(){
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let list = document.getElementById("history-list");
  list.innerHTML = "";
  history.slice(0,10).forEach(item => {
    let li = document.createElement("li");
    li.innerText = item;
    list.appendChild(li);
  });
}
showHistory();

function clearHistory(){
  localStorage.removeItem("history");
  localStorage.removeItem("scanCount");
  scanCount = 0;
  document.getElementById("scan-count").innerText = "Total Scans: 0";
  showHistory();
}

function onScanSuccess(decodedText){
  document.getElementById("qr-result").innerHTML =
    `<a href="${decodedText}" target="_blank">${decodedText}</a>`;

  if(decodedText.startsWith("http")){
    document.getElementById("openLinkBtn").style.display = "block";
  }

  generatedValue = decodedText;

  scanCount++;
  localStorage.setItem("scanCount", scanCount);
  document.getElementById("scan-count").innerText = "Total Scans: " + scanCount;
  saveHistory(decodedText);
}

function openLink(){
  window.open(generatedValue, "_blank");
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", { fps: 10, qrbox: 300 }
);
html5QrcodeScanner.render(onScanSuccess);
// Dark Mode Toggle
document.getElementById("mode-toggle").addEventListener("click", function() {
  document.body.classList.toggle("light-mode");
});
