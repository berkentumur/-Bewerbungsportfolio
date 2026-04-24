const accessCode = "4837";
const accessSessionKey = "berken-portfolio-access";

function initAccessGate() {
  if (sessionStorage.getItem(accessSessionKey) === "granted") {
    return;
  }

  document.body.classList.add("access-locked");

  const gate = document.createElement("div");
  gate.className = "access-gate";
  gate.innerHTML = `
    <form class="access-box">
      <p class="eyebrow">Geschützte Bewerbung</p>
      <h1>Zugangscode</h1>
      <p>Bitte geben Sie den vierstelligen Code aus der Bewerbungsmail ein.</p>
      <label>
        Code
        <input
          id="accessCodeInput"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          maxlength="4"
          pattern="[0-9]{4}"
          required
        />
      </label>
      <button class="button primary" type="submit">Website öffnen</button>
      <p class="access-error" aria-live="polite"></p>
    </form>
  `;

  document.body.appendChild(gate);

  const form = gate.querySelector("form");
  const input = gate.querySelector("#accessCodeInput");
  const error = gate.querySelector(".access-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value.trim() === accessCode) {
      sessionStorage.setItem(accessSessionKey, "granted");
      document.body.classList.remove("access-locked");
      gate.remove();
      return;
    }

    error.textContent = "Der Code ist nicht korrekt.";
    input.value = "";
    input.focus();
  });

  input.focus();
}

initAccessGate();

const copyButtons = document.querySelectorAll("[data-copy]");

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return "copied";
    } catch {
      // Local file browsers can block clipboard access.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();

  if (copied) {
    return "copied";
  }

  const confirmed = window.prompt("Zum Kopieren Strg+C drücken:", value);
  return confirmed === null ? "blocked" : "manual";
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const result = await copyText(button.dataset.copy);
    const originalText = button.textContent;
    button.textContent = result === "copied" ? "Kopiert" : "Bereit";
    button.classList.add("copied");

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 1400);
  });
});
