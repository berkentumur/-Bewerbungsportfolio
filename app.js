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
