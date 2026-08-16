/* Voice — speech synthesis + recognition (Web Speech API) wired to BilqisBrain */
window.BilqisVoice = (function () {
  const synth = window.speechSynthesis;
  let voice = null;

  function pickVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    const FEMALE = /female|zira|hazel|susan|samantha|victoria|kate|serena|fiona|moira|tessa|karen|sonia|libby|aria|jenny|salma|zariyah/i;
    const isFemale = (v) => FEMALE.test(v.name) && !/male(?!female)/i.test(v.name.replace(/female/ig, ""));
    voice =
      voices.find((v) => /en-GB/i.test(v.lang) && isFemale(v)) ||
      voices.find((v) => /^en/i.test(v.lang) && isFemale(v)) ||
      voices.find((v) => isFemale(v)) ||
      voices.find((v) => /en-GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0] ||
      null;
  }
  if (synth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  function speak(text) {
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 1.02;
    u.pitch = 1.08;
    const orb = document.getElementById("orb");
    u.onstart = () => orb && orb.classList.add("speaking");
    u.onend = () => orb && orb.classList.remove("speaking");
    synth.speak(u);
  }

  /* recognition */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let listening = false;

  function toast(text, ms = 6000) {
    const el = document.getElementById("bilqis-toast");
    el.textContent = text;
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), ms);
  }

  async function handleUtterance(text) {
    toast("» " + text, 2500);
    const reply = await BilqisBrain.respond(text);
    toast(reply);
    speak(reply);
  }

  function listen() {
    const orb = document.getElementById("orb");
    if (!SR) {
      toast("Voice recognition unavailable in this browser. Use the Assistant window or Terminal instead.");
      speak("Voice recognition is not supported in this browser, sir.");
      return;
    }
    if (listening) {
      rec && rec.stop();
      return;
    }
    rec = new SR();
    rec.lang = navigator.language || "en-GB";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      listening = true;
      orb.classList.add("listening");
      document.getElementById("orb-caption").textContent = "LISTENING...";
    };
    rec.onend = () => {
      listening = false;
      orb.classList.remove("listening");
      document.getElementById("orb-caption").textContent = "CLICK ORB · VOICE COMMAND";
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") toast("Microphone access denied. Enable it to use voice commands.");
    };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleUtterance(text);
    };
    rec.start();
  }

  return { speak, listen, handleUtterance };
})();
