let currentType = "text";
let uploadedLogo = null;
let logoSizeValid = false;
let generatedValue = "";
// ===== Dynamic QR + Logo Size System =====
let qrSize = Math.min(window.innerWidth * 0.45, 450);
let logoSize = qrSize * 0.20;

function getMaxQRSize() {
  return Math.min(window.innerWidth * 0.9, 900);
}

function getMinQRSize() {
  return 180;
}
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

  QRCode.toCanvas(canvas, generatedValue, {
  width: qrSize,
  errorCorrectionLevel: "H"
}, function () {
  if(uploadedLogo && logoSizeValid){
    const ctx = canvas.getContext("2d");

    
    const x = (canvas.width - logoSize) / 2;
    const y = (canvas.height - logoSize) / 2;

    ctx.drawImage(uploadedLogo, x, y, logoSize, logoSize);
  }

});
}
function copyQRText(){
  if(!generatedValue) return;
  navigator.clipboard.writeText(generatedValue);
}

function downloadQR(){

  const canvas = document.getElementById("qr-code");

  const tempCanvas = document.createElement("canvas");
  const scale = 3; // HD quality

  tempCanvas.width = canvas.width * scale;
  tempCanvas.height = canvas.height * scale;

  const ctx = tempCanvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = "qr-code.png";
  link.href = tempCanvas.toDataURL("image/png");
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
  "reader",
  {
    fps: 10,
    qrbox: { width: 300, height: 300 }
  }
);

html5QrcodeScanner.render(onScanSuccess);

// Dark Mode Toggle
document.getElementById("mode-toggle").addEventListener("click", function() {
  document.body.classList.toggle("light-mode");
});
// Logo Upload System

const logoInput = document.getElementById("logoInput");
const logoMessage = document.getElementById("logoMessage");
const fixLogoBtn = document.getElementById("fixLogoBtn");

logoInput.addEventListener("change", function(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){

      uploadedLogo = img;

      if(img.width > 200){
        logoMessage.innerText = "Logo is too large. Click Fix Logo Size ⚠️";
        logoSizeValid = false;
        fixLogoBtn.style.display = "inline-block";
      }
      else if(img.width < 50){
        logoMessage.innerText = "Logo is too small. Click Fix Logo Size ⚠️";
        logoSizeValid = false;
        fixLogoBtn.style.display = "inline-block";
      }
      else{
        logoMessage.innerText = "Logo size fixed and applied ✅";
        logoSizeValid = true;
        fixLogoBtn.style.display = "none";
        generateQR();
      }
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
});

fixLogoBtn.addEventListener("click", function(){
  logoMessage.innerText = "Logo size fixed and applied ✅";
  logoSizeValid = true;
  fixLogoBtn.style.display = "none";
  generateQR();
});
// ===== QR SIZE CONTROLS =====

function increaseQR() {
  const maxSize = getMaxQRSize();
  if (qrSize < maxSize) {
    qrSize += 5;
    logoSize = qrSize * 0.20; // logo auto adjust
    generateQR();
  } else {
    alert("QR maximum size reached for this device");
  }
}

function decreaseQR() {
  const minSize = getMinQRSize();
  if (qrSize > minSize) {
    qrSize -= 5;
    logoSize = qrSize * 0.20;
    generateQR();
  }
}
// ===== LOGO SIZE CONTROLS =====

function increaseLogo() {
  const maxLogo = qrSize * 0.25;

  if (logoSize < maxLogo) {
    logoSize += qrSize * 0.01;
    generateQR();
  } else {
    alert("Logo maximum safe size reached");
  }
}

function decreaseLogo() {
  const minLogo = qrSize * 0.05;
  
  if (logoSize > minLogo) {
    logoSize -= qrSize * 0.01;
    generateQR();
  }
}
window.addEventListener("resize", function(){
  qrSize = Math.min(window.innerWidth * 0.6, 600);
  logoSize = qrSize * 0.20;
  generateQR();
});
