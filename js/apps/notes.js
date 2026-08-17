/* Notes — persistent scratchpad backed by localStorage */
Apps.notes = {
  title: "Field Notes",
  width: 380,
  height: 320,

  mount(body) {
    body.innerHTML = `<textarea class="notes-area" placeholder="Dictate or type your notes, Grand Master Caan..."></textarea>`;
    const area = body.querySelector("textarea");
    area.value = localStorage.getItem("bilqis-notes") || "";
    area.addEventListener("input", () => localStorage.setItem("bilqis-notes", area.value));
  },
};
