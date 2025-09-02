const btn = document.getElementById("btn");
const results = document.getElementById("text");

// ✅ Correct API usage
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US"; // you can change language if needed
recognition.interimResults = false;

btn.onclick = () => {
  recognition.start();
};

recognition.onstart = function () {
  console.log("You can speak now...");
};

recognition.onresult = function (event) {
  const text = event.results[0][0].transcript;
  console.log(text);
  results.innerText = text;
};

recognition.onerror = function (event) {
  alert("Error occurred: " + event.error);
};

function copyDivToClipboard() {
  const textToCopy = results.innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Copied the text: " + textToCopy);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}
