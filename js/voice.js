/* Voice — speech synthesis + recognition (Web Speech API) wired to BilqisBrain */
window.BilqisVoice = (function () {
  const synth = window.speechSynthesis;
  let voice = null;

  function pickVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    const FEMALE = /female|zira|hazel|susan|samantha|victoria|kate|serena|fiona|moira|tessa|karen|sonia|libby|aria|jenny|emma|ava|salma|zariyah/i;
    const isFemale = (v) => FEMALE.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/ig, ""));
    const isNeural = (v) => /natural|online|neural|premium|enhanced/i.test(v.name);
    // rank: neural female en-GB > neural female en > Google female > any female > en-GB > en
    voice =
      voices.find((v) => /en-GB/i.test(v.lang) && isFemale(v) && isNeural(v)) ||
      voices.find((v) => /^en/i.test(v.lang) && isFemale(v) && isNeural(v)) ||
      voices.find((v) => /^Google UK English Female$/i.test(v.name)) ||
      voices.find((v) => /google/i.test(v.name) && /^en/i.test(v.lang) && isFemale(v)) ||
      voices.find((v) => /en-GB/i.test(v.lang) && isFemale(v)) ||
      voices.find((v) => /^en/i.test(v.lang) && isFemale(v)) ||
      voices.find((v) => isFemale(v)) ||
      voices.find((v) => /en-GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0] ||
      null;
  }

  /* convert display text to natural speech: say "Bilqees", not letter-by-letter */
  function speechify(text) {
    return String(text)
      .replace(/B\.I\.L\.Q\.I\.S\.?/gi, "Bilqees")
      .replace(/\bBilqis\b/gi, "Bilqees");
  }
  if (synth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  function speak(text) {
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(speechify(text));
    if (voice) u.voice = voice;
    // neural voices sound best untouched; pitch-shift only classic robotic ones
    const neural = voice && /natural|online|neural|premium|enhanced|google/i.test(voice.name);
    u.rate = 1.0;
    u.pitch = neural ? 1.0 : 1.06;
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
      speak("Voice recognition is not supported in this browser, Grand Master Caan.");
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
