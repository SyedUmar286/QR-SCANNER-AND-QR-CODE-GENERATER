// Dark Mode
const modeBtn = document.getElementById("mode-toggle");
modeBtn.onclick = () => document.body.classList.toggle("light");

// QR Generator (Button Only)
const qrInput = document.getElementById("qr-text");
const qrCanvas = document.getElementById("qr-code");

function generateQR(){
  const text = qrInput.value;
  if(!text){
    qrCanvas.getContext('2d').clearRect(0,0, qrCanvas.width, qrCanvas.height);
    return;
  }
  QRCode.toCanvas(qrCanvas, text, { width: 250 });
}

// Copy
function copyQRText(){
  const text = qrInput.value;
  if(!text) return alert("No text to copy!");
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

// Download
function downloadQR(){
  const link = document.createElement('a');
  link.download = "qr-code.png";
  link.href = qrCanvas.toDataURL();
  link.click();
}

// Scan Counter + History
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

// Scanner
function onScanSuccess(decodedText){
  document.getElementById("qr-result").innerText = decodedText;
  scanCount++;
  localStorage.setItem("scanCount", scanCount);
  document.getElementById("scan-count").innerText = "Total Scans: " + scanCount;
  saveHistory(decodedText);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", { fps: 10, qrbox: 300 }
);
html5QrcodeScanner.render(onScanSuccess);

// PWA Install
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", () => {
  deferredPrompt.prompt();
});
