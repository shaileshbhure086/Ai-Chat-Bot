// chat.js

const promptInput = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
const imagebtn = document.querySelector("#image");
const imageInput = document.querySelector("#image-input");

imagebtn.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent button from submitting or reloading
  imageInput.click(); // Open file picker
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    // Log basic info
    console.log("Name:", file.name);
    console.log("Type:", file.type);
    console.log("Size:", (file.size / 1024).toFixed(2), "KB");

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        console.log("Width:", img.width + "px");
        console.log("Height:", img.height + "px");

        const imageHTML = `
          <img src="user.png" width="50">
          <div class="user-chat-area">
            <strong>${file.name}</strong><br>
            <img src="${e.target.result}" width="200"><br>
            Type: ${file.type}<br>
            Size: ${(file.size / 1024).toFixed(2)} KB<br>
            Dimensions: ${img.width} × ${img.height}
          </div>`;
        
        chatContainer.appendChild(createChatBox(imageHTML, "user-chat-box"));
        chatContainer.scrollTop = chatContainer.scrollHeight;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});


let user = { data: null };

// Utility to create chat bubbles
function createChatBox(html, className) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(className);
  return div;
}

// Send the user's input to Gemini and update the AI bubble
async function generateResponse(aiChatBox) {
  const area = aiChatBox.querySelector(".ai-chat-area");
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDQPFZ-WVRoiYZwX7ngRvZht3nRz2q-qZE";

  const payload = {
    contents: [
      { parts: [ { text: user.data } ] }
    ],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 }  // disable thinking for faster, cheaper responses :contentReference[oaicite:2]{index=2}
    }
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text
                 || "Sorry, I couldn't process that.";
    area.innerHTML = aiText;

  } catch (err) {
    console.error("API error:", err);
    area.innerHTML = "Error fetching response. Please try again.";
  }
}

// Handle user message submission
function handleUserMessage(text) {
  user.data = text.trim();
  promptInput.value = "";

  const userHTML = `
    <img src="user.png" width="50">
    <div class="user-chat-area">${user.data}</div>`;
  chatContainer.appendChild(createChatBox(userHTML, "user-chat-box"));

  setTimeout(() => {
    const aiHTML = `
      <img src="ai.png" width="70">
      <div class="ai-chat-area">
        <img src="load.gif" width="50">
      </div>`;
    const aiBox = createChatBox(aiHTML, "ai-chat-box");
    chatContainer.appendChild(aiBox);
    generateResponse(aiBox);
  }, 300);
}

// Listen for Enter key to send message
promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && promptInput.value.trim()) {
    handleUserMessage(promptInput.value);
  }
});

