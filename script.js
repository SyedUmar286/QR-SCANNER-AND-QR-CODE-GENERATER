let currentType = "text";
let generatedValue = "";

function setType(type){
  currentType = type;
  const inputDiv = document.getElementById("inputs");
  if(type === "text" || type === "url"){
    inputDiv.innerHTML = `<input type="text" id="mainInput" placeholder="Enter ${type}">`;
  } else if(type === "wifi"){
    inputDiv.innerHTML = `<input type="text" id="ssid" placeholder="WiFi Name"><input type="text" id="password" placeholder="Password">`;
  } else if(type === "email"){
    inputDiv.innerHTML = `<input type="text" id="email" placeholder="Email Address">`;
  } else if(type === "phone"){
    inputDiv.innerHTML = `<input type="text" id="phone" placeholder="Phone Number">`;
  }
}
setType("text");

async function generateQR(){
  const canvas = document.getElementById("qr-code");
  const color = document.getElementById("qrColor").value;
  const logoInput = document.getElementById("logoInput");

  // Get Value
  if(currentType === "text" || currentType === "url") generatedValue = document.getElementById("mainInput").value;
  else if(currentType === "wifi") generatedValue = `WIFI:T:WPA;S:${document.getElementById("ssid").value};P:${document.getElementById("password").value};;`;
  else if(currentType === "email") generatedValue = `mailto:${document.getElementById("email").value}`;
  else if(currentType === "phone") generatedValue = `tel:${document.getElementById("phone").value}`;

  if(!generatedValue) return alert("Kuch enter toh karo!");

  // 1. Generate QR with Color
  await QRCode.toCanvas(canvas, generatedValue, { 
    width: 250, 
    margin: 2,
    color: { dark: color, light: "#ffffff" }
  });

  // 2. Add Logo if selected
  if (logoInput.files && logoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const ctx = canvas.getContext("2d");
        const size = canvas.width / 4;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
        ctx.drawImage(img, x, y, size, size);
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(logoInput.files[0]);
  }
}

function copyQRText(){
  if(!generatedValue) return;
  navigator.clipboard.writeText(generatedValue);
  alert("Text copied!");
}

function downloadQR(){
  const canvas = document.getElementById("qr-code");
  const link = document.createElement('a');
  link.download = "qr-code.png";
  link.href = canvas.toDataURL();
  link.click();
}

// History & Scanning
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
  localStorage.setItem("scanCount", 0);
  document.getElementById("scan-count").innerText = "Total Scans: 0";
  showHistory();
}

function onScanSuccess(decodedText){
  document.getElementById("qr-result").innerText = "Result: " + decodedText;
  if(decodedText.startsWith("http")){
    document.getElementById("openLinkBtn").style.display = "block";
    generatedValue = decodedText; // Update for open link
  }
  scanCount++;
  localStorage.setItem("scanCount", scanCount);
  document.getElementById("scan-count").innerText = "Total Scans: " + scanCount;
  saveHistory(decodedText);
}

function openLink(){ window.open(generatedValue, "_blank"); }

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);

// Theme Toggle
document.getElementById('mode-toggle').onclick = () => {
    document.body.style.backgroundColor = document.body.style.backgroundColor === 'white' ? '#1e1e2f' : 'white';
    document.body.style.color = document.body.style.color === 'black' ? 'white' : 'black';
};
