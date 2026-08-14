(function () {
  "use strict";

  const terminalWindow = document.getElementById("terminal-window");
  const terminalBody = document.getElementById("terminal-body");
  const terminalOutput = document.getElementById("terminal-output");
  const inputLine = document.getElementById("input-line");
  const inputBuffer = document.getElementById("input-buffer");
  const hiddenInput = document.getElementById("hidden-input");
  const flashOverlay = document.getElementById("flash-overlay");
  const revealScreen = document.getElementById("reveal-screen");
  const runAgainBtn = document.getElementById("run-again-btn");

  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playBeep(
    freq = 800,
    duration = 0.03,
    type = "sine",
    gainVal = 0.03,
  ) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration,
      );

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playTypeClick() {
    const freqs = [600, 750, 900, 1050];
    const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
    playBeep(randomFreq, 0.015, "square", 0.015);
  }

  function playWarningBeep() {
    playBeep(440, 0.1, "sawtooth", 0.05);
  }

  function playSuccessChime() {
    if (!soundEnabled) return;
    playBeep(523.25, 0.1, "sine", 0.04);
    setTimeout(() => playBeep(659.25, 0.1, "sine", 0.04), 100);
    setTimeout(() => playBeep(783.99, 0.2, "sine", 0.04), 200);
  }

  function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function typeLine(text, className = "", speed = 25) {
    const lineEl = document.createElement("div");
    lineEl.className = `terminal-line ${className}`;
    terminalOutput.appendChild(lineEl);

    for (let i = 0; i < text.length; i++) {
      lineEl.textContent += text[i];
      if (text[i] !== " ") {
        playTypeClick();
      }
      scrollToBottom();
      await sleep(speed);
    }
    return lineEl;
  }

  function appendLine(text, className = "") {
    const lineEl = document.createElement("div");
    lineEl.className = `terminal-line ${className}`;
    lineEl.textContent = text;
    terminalOutput.appendChild(lineEl);
    scrollToBottom();
    return lineEl;
  }

  const fakeOperations = [
    "Deleting Windows System Files (C:\\Windows\\System32\\*)",
    "Removing Registry Entries (HKEY_LOCAL_MACHINE\\SYSTEM)",
    "Destroying Kernel Protection Modules (ntoskrnl.exe)",
    "Wiping User Profiles & Master Data (C:\\Users\\*)",
    "Formatting System Partition Drive C: (NTFS)",
    "Destroying Master File Table (MFT) & Sector Allocation",
    "Erasing Graphics & Device Drivers (nvlddmkm.sys)",
    "Deleting Recovery Partition & Volume Shadow Copies",
    "Removing System Restore Points (vssadmin purge)",
    "Corrupting UEFI/GPT Bootloader (winload.efi)",
    "Clearing Motherboard BIOS / NVRAM Configuration",
    "Wiping NVMe Solid State Drive Metadata & TRIM Logs",
    "Erasing Windows Security Policies & SAM Accounts",
    "Removing BitLocker Hardware Encryption Keys",
    "Deleting TCP/IP Network Stack & Adapter Profiles",
    "Clearing Local DNS Resolver Cache & Host Tables",
    "Destroying Virtual Memory Page File (pagefile.sys)",
    "Removing Core Operating System Background Services",
    "Cleaning Temporary System Files & Prefetch Archives",
    "Destroying System Event Log Records (EventViewer)",
    "Deleting Windows Update Cache & Component Store",
    "Overwriting Master Boot Record (MBR) Boot Vector",
    "Purging 64-bit Dynamic Link Libraries (SysWOW64)",
    "Terminating Win32 Core Subsystem Threads",
    "Unlinking Storage Controller Hardware Drivers",
    "Erasing Trusted Platform Module (TPM 2.0) Keys",
    "Purging Processor Microcode Patch Allocations",
    "Zero-Filling Physical Disk Storage Sectors",
    "Dismounting Active File System Drivers",
    "Finalizing System Integrity Destruction",
  ];

  let isWaitingForInput = false;

  async function startWarningSequence() {
    terminalOutput.innerHTML = "";
    inputLine.classList.add("hidden");
    inputBuffer.textContent = "";
    hiddenInput.value = "";

    await sleep(300);

    appendLine("C:\\Users\\Admin> sudo rm -rf", "text-white");
    await sleep(200);

    const gaugeEl = appendLine(":.:.: [               ] 0%", "text-cyan");
    const gaugeFrames = [
      ":.:.: [===>           ] 25%",
      ":.:.: [========>      ] 55%",
      ":.:.: [=============> ] 85%",
      ":.:.: [===============] 100%",
    ];

    for (let frame of gaugeFrames) {
      await sleep(250);
      gaugeEl.textContent = frame;
      playTypeClick();
      scrollToBottom();
    }

    await sleep(300);
    playWarningBeep();

    await typeLine(
      "CRITICAL WARNING: Unauthorized administrative escalation detected.",
      "text-red",
      18,
    );
    await sleep(150);

    await typeLine(
      "Security Alert: System integrity protection protocol overridden.",
      "text-red",
      18,
    );
    await sleep(150);

    await typeLine(
      "Kernel Safeguard: Memory locking disabled. Privileges elevated.",
      "text-red",
      18,
    );
    await sleep(150);

    await typeLine(
      "Drive Encryption: Master volume keys & SAM database exposed.",
      "text-red",
      18,
    );
    await sleep(150);

    await typeLine(
      "System Access: Low-level hardware controller now fully accessible.",
      "text-red",
      18,
    );
    await sleep(250);

    inputLine.classList.remove("hidden");
    hiddenInput.focus();
    isWaitingForInput = true;
  }

  async function submitChoice(choice) {
    isWaitingForInput = false;
    hiddenInput.blur();
    inputLine.classList.add("hidden");

    appendLine(
      `Do you still wish to continue? (Y/N): ${choice}`,
      "text-yellow",
    );

    if (choice === "N") {
      await sleep(300);
      await typeLine("Sorry, too late!", "text-red", 20);
      await sleep(800);
      startDeletionSequence();
    } else if (choice === "Y") {
      startDeletionSequence();
    }
  }

  window.addEventListener("keydown", (e) => {
    if (!isWaitingForInput) return;

    const key = e.key;

    if (key.toLowerCase() === "y" || key.toLowerCase() === "n") {
      e.preventDefault();
      const uppercaseKey = key.toUpperCase();
      inputBuffer.textContent = uppercaseKey;
      playTypeClick();
    } else if (key === "Backspace") {
      e.preventDefault();
      inputBuffer.textContent = "";
      playTypeClick();
    } else if (key === "Enter") {
      e.preventDefault();
      const currentVal = inputBuffer.textContent.trim().toUpperCase();
      if (currentVal === "Y" || currentVal === "N") {
        submitChoice(currentVal);
      }
    }
  });

  hiddenInput.addEventListener("input", () => {
    if (!isWaitingForInput) return;
    const val = hiddenInput.value.trim().toUpperCase();
    if (val.length > 0) {
      const lastChar = val[val.length - 1];
      if (lastChar === "Y" || lastChar === "N") {
        inputBuffer.textContent = lastChar;
        playTypeClick();
      }
    } else {
      inputBuffer.textContent = "";
    }
    hiddenInput.value = "";
  });

  terminalWindow.addEventListener("click", () => {
    if (isWaitingForInput) {
      hiddenInput.focus();
    }
  });

  async function startDeletionSequence() {
    await sleep(400);
    appendLine("");
    await typeLine("Initializing system purge sequence...", "text-red", 20);
    await sleep(400);
    appendLine("");

    const totalOps = fakeOperations.length;

    for (let i = 0; i < totalOps; i++) {
      const opName = fakeOperations[i];
      await animateProgressBar(opName, i + 1, totalOps);
      await sleep(Math.floor(Math.random() * 60) + 30);
    }

    await sleep(400);
    await renderCompletionBanner();
  }

  function animateProgressBar(label, index, total) {
    return new Promise(async (resolve) => {
      const container = document.createElement("div");
      container.className = "progress-container terminal-line";

      const maxLabelLen = 42;
      let displayLabel = label;
      if (displayLabel.length > maxLabelLen) {
        displayLabel = displayLabel.substring(0, maxLabelLen - 3) + "...";
      } else {
        displayLabel = displayLabel.padEnd(maxLabelLen, " ");
      }

      const labelSpan = document.createElement("span");
      labelSpan.className = "progress-label";
      labelSpan.textContent = displayLabel;

      const barSpan = document.createElement("span");
      barSpan.className = "progress-bar-text";

      const percentSpan = document.createElement("span");
      percentSpan.className = "progress-percent";

      container.appendChild(labelSpan);
      container.appendChild(barSpan);
      container.appendChild(percentSpan);
      terminalOutput.appendChild(container);

      const totalBlocks = 14;
      let currentPercent = 0;

      const stepDelay = Math.floor(Math.random() * 20) + 10;

      while (currentPercent <= 100) {
        const filledBlocks = Math.round((currentPercent / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        const barText =
          "[" + "#".repeat(filledBlocks) + "-".repeat(emptyBlocks) + "]";

        barSpan.textContent = ` ${barText} `;
        percentSpan.textContent = `${currentPercent}%`;

        scrollToBottom();

        if (currentPercent === 100) break;

        currentPercent += Math.floor(Math.random() * 25) + 15;
        if (currentPercent > 100) currentPercent = 100;

        playTypeClick();
        await sleep(stepDelay);
      }

      resolve();
    });
  }

  async function renderCompletionBanner() {
    appendLine("");
    appendLine("====================================", "text-red");
    await sleep(150);
    appendLine("OS SUCCESSFULLY DELETED", "text-red");
    await sleep(150);
    appendLine("100%", "text-green");
    await sleep(150);
    appendLine("System destruction complete.", "text-white");
    await sleep(200);
    appendLine("On next restart,", "text-yellow");
    appendLine(
      "your computer will boot into BIOS / Boot Manager.",
      "text-yellow",
    );
    await sleep(150);
    appendLine("====================================", "text-red");
    appendLine("");

    playSuccessChime();
    await sleep(1200);

    await startShutdownSequence();
  }

  async function startShutdownSequence() {
    for (let i = 5; i >= 1; i--) {
      await typeLine(`System shutting down in ${i}...`, "text-red", 15);
      playWarningBeep();
      await sleep(800);
    }

    await sleep(300);
    await triggerBlackoutTransition();
  }

  async function triggerBlackoutTransition() {
    terminalWindow.classList.add("fade-out");
    await sleep(300);

    flashOverlay.classList.add("active");
    playBeep(120, 0.3, "sawtooth", 0.08);

    await sleep(5000);
    flashOverlay.classList.remove("active");

    await sleep(5000);

    showRevealScreen();
  }

  let matrixAnimId = null;

  function startMatrixRain() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.85) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = "#00ff66";
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      matrixAnimId = requestAnimationFrame(draw);
    }

    if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
    draw();

    window.addEventListener("resize", resizeCanvas);
  }

  function stopMatrixRain() {
    if (matrixAnimId) {
      cancelAnimationFrame(matrixAnimId);
      matrixAnimId = null;
    }
  }

  function showRevealScreen() {
    revealScreen.classList.remove("hidden");
    void revealScreen.offsetWidth;
    revealScreen.classList.add("visible");
    startMatrixRain();
    playSuccessChime();
  }

  runAgainBtn.addEventListener("click", () => {
    stopMatrixRain();
    revealScreen.classList.remove("visible");
    setTimeout(() => {
      revealScreen.classList.add("hidden");
      terminalWindow.classList.remove("fade-out");
      startWarningSequence();
    }, 300);
  });

  window.addEventListener("DOMContentLoaded", () => {
    startWarningSequence();
  });
})();
