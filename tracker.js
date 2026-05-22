if (typeof window.CodePen === "undefined") window.CodePen = {};

// -------------------- GLOBAL STATE --------------------
let gameData = null;
let trackerStarted = false;
let selectedCharacter = null;
let initiativeOrder = [];
let currentTurnIndex = 0;
let combatStarted = false;
let npcCount = 0;
let selectedTag = null;
let reactionMode = false;
let reactionCharacter = null;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveGameData("tab hidden");
});

window.addEventListener("beforeunload", () => {
  saveGameData("before unload");
});


// -------------------- INITIALIZATION --------------------
function saveGameData(reason = "auto") {
  if (!trackerStarted || !gameData) return;

  gameData.__lastSaved = {
    reason,
    time: new Date().toISOString()
  };

  localStorage.setItem("myGameData", JSON.stringify(gameData));
  console.log("💾 Saved", reason);
}

function loadGameData() {
  const saved = localStorage.getItem("myGameData");
  if (!saved) return false;

  gameData = JSON.parse(saved);
  console.log("📂 Loaded saved game");

  // Only start tracker if there are characters
  return gameData.characters && gameData.characters.length > 0;
}

function init() {
  const hasCharacters = loadGameData(); // now returns true only if characters exist
  const startForm = document.getElementById("start-form");
  const numPCsInput = document.getElementById("numPCs");

  if (!startForm || !numPCsInput) {
    console.error("❌ Missing #start-form or #numPCs in the DOM");
    return;
  }

  // Correctly attach event listeners
  document.getElementById("start-btn")?.addEventListener("click", setupGame);
  numPCsInput.addEventListener("input", generatePCInputs);
  setupTabs();

  // ✅ Attach restart button here
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", restartProgram);
  }

  const syncBtn = document.getElementById("sync-google-btn");
  if (syncBtn) {
    syncBtn.addEventListener("click", openSyncModal);
  }


  if (hasCharacters) {
    trackerStarted = true; // ✅ only now do we consider the tracker started
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("app-tracker").style.display = "block";

    selectedCharacter = gameData.characters[0] || null;
    renderCharacterButtons();
    populateStatsSelects();
    renderStatsActions(selectedCharacter);

    console.log("📂 Loaded saved game and skipping start menu!");
  } else {
    trackerStarted = false; // explicitly allow starting a new game
    document.getElementById("start-menu").style.display = "block";
    document.getElementById("app-tracker").style.display = "none";
    console.log("🟢 Ready for new game input");
  }
}


// -------------------- GAME SETUP --------------------
function setupGame(e) {
  if (trackerStarted) {
    console.warn("⚠️ Tracker already started");
    return;
  }

  trackerStarted = true;

  if (!gameData) {
    gameData = {
      edition: "pathfinder",
      characters: [],
      characterStats: {},
      sessionStartedAt: Date.now()
    };
  }

  if (e && typeof e.preventDefault === "function") e.preventDefault();

  // --- Hardcoded script URL ---
  gameData.scriptUrl = "https://script.google.com/macros/s/AKfycbwZvcjT_o93h80haSyjvx5B0O3EtX9pcLRPoIBUQGq3n2oRhX1SDLffZipEyeWOuRdq/exec";

  // --- Get sheet input (full URL or bare ID accepted) ---
  const sheetIdInput = (document.getElementById("sheetId")?.value || "").trim();
  let sheetId = "";
  if (sheetIdInput) {
    const sheetMatch = sheetIdInput.match(/\/d\/([A-Za-z0-9\-_]+)/);
    sheetId = sheetMatch?.[1] || sheetIdInput.replace(/[^A-Za-z0-9\-_]/g, "");
  }
  gameData.sheetId = sheetId;

  console.log("🟩 Using hardcoded Apps Script URL:", gameData.scriptUrl);

  // --- Setup PCs from inputs ---
  const numPCs = parseInt(document.getElementById("numPCs")?.value, 10) || 0;
  gameData.characters = [];
  for (let i = 1; i <= numPCs; i++) {
    const input = document.getElementById(`pcName${i}`);
    gameData.characters.push(input?.value.trim() || `PC${i}`);
  }

  // ensure NPC present (you renamed to "NPC") 
  const includeNPCs = document.getElementById("includeNPCs")?.checked;
  if (includeNPCs && !gameData.characters.includes("NPC")) {
    gameData.characters.push("NPC");
  }

  const editionInput = document.getElementById("edition");
  if (editionInput) {
    gameData.edition = editionInput.value;
  }

  // --- Initialize stats ---  
  gameData.characters.forEach(name => {
    if (!gameData.characterStats[name]) {
      gameData.characterStats[name] = {
        rolls: [],
        attackRolls: [],
        abilityRolls: [],
        saveRolls: [],
        concentrationRolls: [],
        initiativeRolls: [],
        attacksMade: 0,
        abilityChecks: 0,
        savingThrows: 0,
        concentrationChecks: 0,
        initiative: 0,
        totalD20Rolls: [],
        totalModD20Rolls: [],
        spellsCast: 0,
        timesKilled: 0,
        natural1s: 0,
        natural20s: 0,
        moneySpent: 0,
        totalDamage: 0,
        attackDamage: 0,
        healingDone: 0,
        totalHealing: 0,
        spellHistory: [],
        spellResistanceRolls: [],
        totalSpellResistance: 0
      };
    }
  });

  // --- Default selected character --- 
  selectedCharacter = gameData.characters[0] || null;

  // --- Hide start menu / show main UI (keep your IDs consistent) --- 
  document.getElementById("start-menu").style.display = "none";
  document.getElementById("app-tracker").style.display = "block";

  // --- Render UI --- 
  renderCharacterButtons();
  populateStatsSelects();
  renderStatsActions(selectedCharacter);

  console.log("✅ Game setup complete!", gameData);
}

async function sendGameDataToGoogleSheet() {
  if (!gameData.scriptUrl) return alert("Apps Script URL not set!");
  if (!gameData.sheetId) return alert("Please enter a Google Sheet URL before syncing.");
  if (!gameData.sessionNumber) return alert("Please enter a session number before syncing.");

  // 🔁 Normalize all per-character data before sending
  gameData.characters.forEach(name => {
    const stats = gameData.characterStats[name];
    if (!stats) return;

    // 🧮 Calculate spell healing/damage dynamically
    let spellHealing = 0;
    if (Array.isArray(stats.spellHistory)) {
      stats.spellHistory.forEach(spell => {
        if (spell.extra) {
          spellHealing += parseFloat(spell.extra.healing) || 0;
        }
      });
    }

    stats.damageDealt = (stats.totalDamage || 0) + (stats.attackDamage || 0);
    const heal = (stats.healingDone || 0) + spellHealing;
    if (stats.totalHealing !== heal) {
      console.log("HIT!");
      stats.totalHealing = (stats.healingDone || 0) + spellHealing;
    }
    stats.sessionNumber = gameData.sessionNumber;
  })

  try {
    const response = await fetch(gameData.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(JSON.stringify(gameData))
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("✅ Data sent to Google Sheet!");
    } else {
      alert("❌ Error: " + result.message);
    }
  } catch (err) {
    console.error("❌ Network Error: " + err.message);
  }
}

function openSyncModal() {
  const modal = document.getElementById("sync-modal");
  modal.classList.remove("hidden");

  const confirmBtn = document.getElementById("sync-confirm");
  const cancelBtn = document.getElementById("sync-cancel");

  confirmBtn.onclick = () => {
    const sheetInput = document.getElementById("syncSheetUrl").value.trim();
    const sessionNum = parseInt(document.getElementById("sessionNumber").value, 10) || 0;

    // 🧩 Extract the Sheet ID
    let sheetId = "";
    if (sheetInput) {
      const match = sheetInput.match(/\/d\/([A-Za-z0-9\-_]+)/);
      sheetId = match?.[1] || sheetInput.replace(/[^A-Za-z0-9\-_]/g, "");
    }

    gameData.sheetId = sheetId;
    gameData.sessionNumber = sessionNum;

    modal.classList.add("hidden");
    sendGameDataToGoogleSheet();
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

function generatePCInputs() {
  const num = parseInt(document.getElementById("numPCs").value) || 0;
  const pcNamesDiv = document.getElementById("pc-names");
  pcNamesDiv.innerHTML = "";

  for (let i = 1; i <= num; i++) {
    const label = document.createElement("label");
    label.htmlFor = `pcName${i}`;
    label.textContent = `PC ${i} Name:`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `pcName${i}`;
    input.name = `pcName${i}`;

    pcNamesDiv.appendChild(label);
    pcNamesDiv.appendChild(input);
    pcNamesDiv.appendChild(document.createElement("br"));
  }
}

// -------------------- TABS --------------------
function setupTabs() {
  const tabs = document.querySelectorAll("#app-tracker .tab-btn");
  const contents = document.querySelectorAll("#app-tracker .tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      contents.forEach(c => (c.style.display = "none"));
      const target = document.getElementById(tabId);
      if (target) target.style.display = "flex";

      if (tabId === "stats") renderStatsActions(selectedCharacter);
      else clearStatsActions();
    });
  });

  if (tabs.length > 0) tabs[0].click();
}

window.switchTab = function (tabId) {
  // hide all tab contents
  document.querySelectorAll("#app-tracker .tab-content").forEach(tab => {
    tab.style.display = "none";
  });

  // show selected tab
  document.getElementById(tabId).style.display = "block";

  // update active button styling
  document.querySelectorAll(".tab-buttons button").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(`.tab-buttons button[onclick="switchTab('${tabId}')"]`);
  if (activeBtn) activeBtn.classList.add("active");

  // ✅ show/hide right-side stats panel
  const sideStats = document.getElementById("side-stats");
  if (sideStats) {
    if (tabId === "summary") {
      sideStats.style.display = "none"; // hide during summary view
    } else {
      sideStats.style.display = "block"; // show for other tabs
    }
  }

  if (tabId === "combat") {
    renderStatsActions(selectedCharacter, "combat");
    renderInitiativeControls();
    renderInitiative();
  } else if (tabId === "stats") {
    renderCharacterButtons();
    renderStatsActions(selectedCharacter, "stats");
  } else if (tabId === "stats-editor") {
    renderEditorStats(selectedCharacter);
    renderCharacterButtons();
  } else if (tabId === "summary") {
    renderStatsSummary();
  }
}

function playSoundFromUrl(url, vol) {
  const audio = new Audio(url);
  audio.volume = vol;
  audio.play().catch(err => console.log("Playback failed:", err));
}

function renderStatsSummary() {
  const grid = document.getElementById("summary-grid");
  if (!grid) return;
  grid.innerHTML = ""; // clear previous render

  const edition = gameData.edition;
  const summaries = [];

  // build summaries
  gameData.characters.forEach(name => {
    const s = gameData.characterStats[name];
    if (!s) return;

    let spellHealing = 0;
    if (Array.isArray(s.spellHistory)) {
      s.spellHistory.forEach(spell => {
        if (spell.extra) spellHealing += parseFloat(spell.extra.healing) || 0;
      });
    }

    const combinedDamage = (s.totalDamage || 0) + (s.attackDamage || 0);
    const combinedHealing = (s.healingDone || 0) + spellHealing;

    const summaryText = [
      `=== ${name} ===`,
      `Attacks Made: ${s.attacksMade}`,
      `Ability Checks: ${s.abilityChecks}`,
      `Saving Throws: ${s.savingThrows}`,
      edition === "pathfinder" ? `Concentration Checks: ${s.concentrationChecks}` : "",
      edition === "pathfinder" ? `Spell Resistances: ${s.totalSpellResistance}` : "",
      `Spells Cast: ${s.spellsCast}`,
      `Initiative: ${s.initiativeRolls.length > 0
        ? formatD20RollsDisplay(s.initiativeRolls)
        : "No rolls yet."
      }`,
      `Total D20 Rolls: ${s.totalD20Rolls.length > 0 ? formatRolls(s.totalD20Rolls) : "No rolls yet."
      }`,
      `Total Modded D20 Rolls: ${s.totalModD20Rolls.length > 0
        ? formatD20RollsDisplay(s.totalModD20Rolls)
        : "No rolls yet."
      }`,
      `Times Killed: ${s.timesKilled}`,
      `Natural 1s: ${s.natural1s}`,
      `Natural 20s: ${s.natural20s}`,
      `Total Damage: ${combinedDamage}`,
      `Total Healing: ${combinedHealing}`,
      `Money Spent: ${s.moneySpent.toFixed(2)}`
    ]
      .filter(Boolean)
      .join("\n");

    summaries.push(summaryText);

    // create a visual card
    const card = document.createElement("div");
    card.className = "summary-card";
    card.classList.add("summary-card");

    const pre = document.createElement("pre");
    pre.textContent = summaryText;

    const copyBtn = document.createElement("button");
    copyBtn.textContent = `Copy ${name}'s Summary`;
    copyBtn.style.cssText = `
      margin-top: 10px;
      align-self: flex-end;
      background-color: #333;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    copyBtn.addEventListener("mouseenter", () => (copyBtn.style.backgroundColor = "#555"));
    copyBtn.addEventListener("mouseleave", () => (copyBtn.style.backgroundColor = "#333"));
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(summaryText);

        // Visual "Copied!" feedback instead of blocking alert
        const prevText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        copyBtn.style.backgroundColor = "#2b662b";
        setTimeout(() => {
          copyBtn.textContent = prevText;
          copyBtn.style.backgroundColor = "#333";
        }, 1500);
      } catch (err) {
        console.warn("Clipboard write failed, using fallback:", err);

        // Fallback for Edge/private mode/local file
        const textarea = document.createElement("textarea");
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        copyBtn.textContent = "✅ Copied (Fallback)";
        copyBtn.style.backgroundColor = "#2b662b";
        setTimeout(() => {
          copyBtn.textContent = `Copy ${name}'s Summary`;
          copyBtn.style.backgroundColor = "#333";
        }, 1500);
      }
    };


    card.appendChild(pre);
    card.appendChild(copyBtn);
    grid.appendChild(card);
  });

  // setup the global "Copy All" button
  const copyAllBtn = document.getElementById("copy-summary-btn");
  if (copyAllBtn) {
    copyAllBtn.onclick = () => {
      const combined = summaries.join("\n\n");
      copyAllBtn.onclick = async () => {
        const combined = summaries.join("\n\n");
        try {
          await navigator.clipboard.writeText(combined);
          copyAllBtn.textContent = "Copied!";
          setTimeout(() => (copyAllBtn.textContent = "Copy All Summaries"), 1200);
        } catch (err) {
          const textarea = document.createElement("textarea");
          textarea.value = combined;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          alert("All character summaries copied! (fallback)");
        }
      };

    };
  }

  saveGameData();
}

// 🌟 The easter egg logic
function triggerEasterEgg() {
  console.log("Egg Cracked")
  const img = document.getElementById("mystery-image");
  if (!img) return;

  // 1% chance (1 out of 100)
  if (Math.random() < 0.001) {
    if (Math.random() < 0.5) {
      playSoundFromUrl("https://www.myinstants.com/media/sounds/cave21.mp3", 0.5);
    }
    else {
      playSoundFromUrl("https://www.myinstants.com/media/sounds/cave1_gqB8CwT.mp3", 0.5);
    }
    const current = parseFloat(img.style.opacity) || 0;
    const newOpacity = Math.min(current + 0.05, 1); // +5% max 100%
    img.style.opacity = newOpacity;
  }
}

// -------------------- HELPERS --------------------
function clearStatsActions() {
  const actionsDiv = document.getElementById("stats-actions");
  if (actionsDiv) actionsDiv.innerHTML = "";
}

function showTrackerMessage(msg, duration = 4000) {
  const messageDiv = document.getElementById("tracker-message");
  if (!messageDiv) return;
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
  setTimeout(() => (messageDiv.style.display = "none"), duration);
}

function highlightSelectedButton(name) {
  document
    .querySelectorAll("#combat-character-buttons button, #stats-character-buttons button, #editor-character-buttons button")
    .forEach(btn => btn.classList.toggle("selected", btn.textContent === name));
}

// Helper: find initiative entry by tag in gameData
function resolveEntryByTag(tag) {
  if (!tag) return null;
  // Search all characters' initiativeRolls (including NPC)
  for (const stats of Object.values(gameData.characterStats)) {
    if (!stats?.initiativeRolls) continue;
    const found = stats.initiativeRolls.find(r => r.tag === tag);
    if (found) return found;
  }
  return null;
}

function resolveToStatName(idOrTagOrName) {
  if (!idOrTagOrName) return null;

  // If it matches a real character key, return it
  if (gameData.characterStats[idOrTagOrName]) return idOrTagOrName;

  // If it looks like a tag (UUID), try find entry by tag
  const byTag = resolveEntryByTag(idOrTagOrName);
  if (byTag) return byTag.source || null;

  // Otherwise try to match by displayName across initiativeRolls
  for (const stats of Object.values(gameData.characterStats)) {
    if (!stats?.initiativeRolls) continue;
    const found = stats.initiativeRolls.find(r => r.displayName === idOrTagOrName);
    if (found) return found.source || null;
  }

  return null;
}

// -------------------- D20 & INPUT --------------------
function openUnifiedActionModal(type, includeDamage = false) {
  return new Promise(resolve => {
    const container = document.createElement("div");

    // --- Roll Section ---
    const rollLabel = document.createElement("p");
    rollLabel.textContent = "Select D20 Roll:";
    playSoundFromUrl("https://cdn.pixabay.com/audio/2022/03/20/audio_88eba5c9da.mp3", 0.3);
    container.appendChild(rollLabel);

    const rollButtons = document.createElement("div");
    rollButtons.style.display = "flex";
    rollButtons.style.flexWrap = "wrap";
    rollButtons.style.gap = "4px";

    let selectedRoll = null;
    for (let i = 1; i <= 20; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.style.width = "36px";
      btn.style.height = "36px";
      btn.style.borderRadius = "6px";
      btn.style.border = "1px solid #666";
      btn.style.background = "#222";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.style.display = "flex";
      btn.style.justifyContent = "center";
      btn.style.alignItems = "center";
      btn.style.transition = "all 0.15s ease";

      btn.onclick = () => {
        selectedRoll = i;
        if (i === 1) { playSoundFromUrl("https://cdn.pixabay.com/audio/2022/03/10/audio_e4e7943871.mp3", 0.3); }
        if (i === 20) { playSoundFromUrl("https://cdn.pixabay.com/audio/2021/08/09/audio_2e957962fc.mp3", 1.0); }
        // Reset all buttons to default
        [...rollButtons.children].forEach(b => {
          b.style.background = "#222";
          b.style.color = "#fff";
          b.style.transform = "scale(1)";
        });
        // Highlight the selected one
        btn.style.background = "red";
        btn.style.color = "#fff";
        btn.style.transform = "scale(1.1)";
      };
      rollButtons.appendChild(btn);
    }
    container.appendChild(rollButtons);

    // --- Modifier Section ---
    const modLabel = document.createElement("label");
    modLabel.textContent = "Modifier:";
    const modInput = document.createElement("input");
    modInput.type = "number";
    modInput.value = "0";
    modInput.style.marginLeft = "6px";
    modInput.style.width = "100px";
    container.appendChild(document.createElement("br"));
    container.appendChild(modLabel);
    container.appendChild(modInput);

    // --- Damage Section (only if includeDamage = true) ---
    let dmgInput = null;
    if (includeDamage) {
      const dmgLabel = document.createElement("label");
      dmgLabel.textContent = "Damage:";
      dmgInput = document.createElement("input");
      dmgInput.type = "number";
      dmgInput.value = "0";
      dmgInput.style.marginLeft = "6px";
      dmgInput.style.width = "100px";
      container.appendChild(document.createElement("br"));
      container.appendChild(dmgLabel);
      container.appendChild(dmgInput);
    }

    showModal(`Perform ${type} Roll`, container, () => {
      if (selectedRoll === null) {
        alert("Please select a D20 roll before confirming.");
        return;
      }
      const modifier = parseInt(modInput.value) || 0;
      const damage = dmgInput ? parseInt(dmgInput.value) || 0 : 0;
      resolve({ roll: selectedRoll, modifier, damage });
    });

    // Cancel handling
    const cancelBtn = document.getElementById("modal-cancel");
    cancelBtn.onclick = () => {
      hideModal();
      resolve(null);
    };

    triggerEasterEgg();
  });
}

async function openMultiRollModal(characterName, type, includeDamage = false) {
  return new Promise(resolve => {
    const container = document.createElement("div");

    const typeLabel = document.createElement("p");
    typeLabel.textContent = `Enter number of ${type} rolls and set values:`;
    container.appendChild(typeLabel);

    const countLabel = document.createElement("label");
    countLabel.textContent = "Number of Rolls:";
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.min = 1;
    countInput.max = 90;
    countInput.value = 1;
    countInput.style.width = "60px";
    container.appendChild(countLabel);
    container.appendChild(countInput);

    container.appendChild(document.createElement("hr"));

    const rollsContainer = document.createElement("div");
    rollsContainer.style.display = "grid";
    rollsContainer.style.gridGap = "10px";
    container.appendChild(rollsContainer);

    const maxPerColumn = 10;
    const rowHeight = 36;

    function buildHeaderRow() {
      const headerRow = document.createElement("div");
      headerRow.style.display = "grid";
      headerRow.style.gridTemplateColumns = `60px 60px${includeDamage ? " 60px" : ""}`;
      headerRow.style.fontWeight = "bold";
      headerRow.style.marginBottom = "4px";
      headerRow.style.height = `${rowHeight}px`;
      headerRow.style.alignItems = "center";

      const d20Header = document.createElement("div");
      d20Header.textContent = "D20";
      d20Header.style.textAlign = "center";
      const modHeader = document.createElement("div");
      modHeader.textContent = "Mod";
      modHeader.style.textAlign = "center";

      headerRow.append(d20Header, modHeader);

      if (includeDamage) {
        const dmgHeader = document.createElement("div");
        dmgHeader.textContent = "Dmg";
        dmgHeader.style.textAlign = "center";
        headerRow.appendChild(dmgHeader);
      }

      return headerRow;
    }

    function rebuildRows() {
      // Step 1: collect current values
      const currentValues = [];
      rollsContainer.querySelectorAll("div").forEach(colDiv => {
        const rows = [...colDiv.children].slice(1); // skip header
        rows.forEach(row => {
          const inputs = [...row.querySelectorAll("input")];
          currentValues.push(inputs.map(input => input.value));
        });
      });

      // Step 2: clear container and rebuild
      rollsContainer.innerHTML = "";
      const numRolls = parseInt(countInput.value) || 1;
      const numColumns = Math.ceil(numRolls / maxPerColumn);
      rollsContainer.style.gridTemplateColumns = `repeat(${numColumns}, auto)`;

      for (let col = 0; col < numColumns; col++) {
        const columnDiv = document.createElement("div");
        columnDiv.style.display = "grid";
        columnDiv.style.rowGap = "6px";
        columnDiv.style.alignContent = "start";

        columnDiv.appendChild(buildHeaderRow());

        for (let i = col * maxPerColumn; i < Math.min((col + 1) * maxPerColumn, numRolls); i++) {
          const inputRow = document.createElement("div");
          inputRow.style.display = "grid";
          inputRow.style.gridTemplateColumns = `60px 60px${includeDamage ? " 60px" : ""}`;
          inputRow.style.gap = "6px";
          inputRow.style.height = `${rowHeight}px`;
          inputRow.style.alignItems = "center";

          const d20Input = document.createElement("input");
          d20Input.type = "number";
          d20Input.min = 1;
          d20Input.max = 20;
          d20Input.style.width = "60px";

          const modInput = document.createElement("input");
          modInput.type = "number";
          modInput.style.width = "60px";

          const dmgInput = includeDamage ? document.createElement("input") : null;
          if (includeDamage) {
            dmgInput.type = "number";
            dmgInput.style.width = "60px";
          }

          // Step 3: restore previous values if available
          const saved = currentValues[i] || [];
          d20Input.value = saved[0] ?? 1;
          modInput.value = saved[1] ?? 0;
          if (includeDamage) dmgInput.value = saved[2] ?? 0;

          inputRow.append(d20Input, modInput);
          if (includeDamage) inputRow.appendChild(dmgInput);

          columnDiv.appendChild(inputRow);
        }

        rollsContainer.appendChild(columnDiv);
      }
    }

    rebuildRows();
    countInput.addEventListener("input", rebuildRows);

    // --- Use the modal's built-in confirm button ---
    showModal(`Perform ${type} Rolls — ${characterName}`, container, () => {
      const results = [];
      const columns = [...rollsContainer.children];
      columns.forEach(colDiv => {
        const rows = [...colDiv.children].slice(1); // skip header
        rows.forEach(row => {
          const inputs = [...row.querySelectorAll("input")];
          const roll = parseInt(inputs[0].value) || 1;
          const modifier = parseInt(inputs[1].value) || 0;
          const damage = includeDamage ? parseInt(inputs[2].value) || 0 : 0;
          results.push({ roll, modifier, damage });
        });
      });
      return resolve(results);
    });
  });
}

async function inputAction(characterName, type, label) {
  if (!characterName) return;

  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  // --- MONEY SPENDING ---
  if (type === "money") {
    const coins = await openMoneyModal(`${characterName} — ${label}`, `Enter coins spent:`);

    if (!coins) return;

    // Convert all coins → gold
    const goldValue =
      (coins.cp / 100) +
      (coins.sp / 10) +
      (coins.ep / 2) +
      coins.gp +
      (coins.pp * 10);

    const total = parseFloat(goldValue.toFixed(2));

    stats.moneySpent = parseFloat((stats.moneySpent + total).toFixed(2));

    showTrackerMessage(`${characterName} ${label}: ${total} gp`);
    updateStatsAndRender(characterName);
    return; // stop here so it does NOT continue to damage/healing
  }

  // --- DAMAGE & HEALING (unchanged behavior) ---
  const step = type === "money" ? 0.01 : 1;

  const num = await openNumberModal(
    `${characterName} — ${label}`,
    `Enter amount of ${label}:`,
    step
  );

  if (num === null) return;

  switch (type) {
    case "damage":
      stats.attackDamage += Math.round(num);
      break;

    case "healing":
      stats.healingDone += Math.round(num);
      break;
  }

  showTrackerMessage(`${characterName} ${label}: ${num}`);
  updateStatsAndRender(characterName);
}

function openMoneyModal(title, prompt) {
  return new Promise(resolve => {
    const container = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = prompt;
    container.appendChild(label);
    container.appendChild(document.createElement("br"));

    const coins = [
      { key: "cp", label: "Copper (cp)" },
      { key: "sp", label: "Silver (sp)" },
      { key: "ep", label: "Electrum (ep)" },
      { key: "gp", label: "Gold (gp)" },
      { key: "pp", label: "Platinum (pp)" }
    ];

    const inputs = {};

    coins.forEach(c => {
      const row = document.createElement("div");
      row.style.marginTop = "6px";

      const l = document.createElement("label");
      l.textContent = c.label + ": ";
      row.appendChild(l);

      const input = document.createElement("input");
      input.type = "number";
      input.step = 1;
      input.min = 0;
      input.value = "";
      input.style.width = "80px";
      input.addEventListener("input", () => {
        input.value = Math.max(0, Math.round(input.value || 0));
      });

      inputs[c.key] = input;
      row.appendChild(input);
      container.appendChild(row);
    });

    showModal(title, container, () => {
      const result = {};
      for (const key in inputs) {
        const val = parseInt(inputs[key].value);
        result[key] = isNaN(val) ? 0 : val;
      }

      hideModal();
      resolve(result);
    });

    // Cancel
    document.getElementById("modal-cancel").onclick = () => {
      hideModal();
      resolve(null);
    };
  });
}

function openNumberModal(title, prompt, step = 0) {
  return new Promise(resolve => {
    const container = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = prompt;
    container.appendChild(label);

    const input = document.createElement("input");
    input.type = "number";
    input.step = step;
    input.value = step; // default to step
    input.style.marginLeft = "6px";

    // Force integer input if step === 1
    if (step === 1) {
      input.addEventListener("input", () => {
        input.value = Math.round(input.value);
      });
    }

    container.appendChild(document.createElement("br"));
    container.appendChild(input);

    showModal(title, container, () => {
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        alert("Please enter a valid number.");
        return;
      }
      hideModal();
      resolve(value);
    });

    // Cancel button
    const cancelBtn = document.getElementById("modal-cancel");
    cancelBtn.onclick = () => {
      hideModal();
      resolve(null);
    };
  });
}

function openCastSpellModal(characterName) {
  return new Promise(resolve => {

    // Draft spell object — SAME SHAPE as spellHistory entries
    const spell = {
      name: "",
      attacks: [],
      saves: [],
      spellResistance: [],
      extra: { damage: 0, healing: 0 }
    };

    // === Layout ===
    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "1fr 1.5fr";
    wrapper.style.gap = "16px";

    const left = document.createElement("div");
    const right = document.createElement("div");
    wrapper.append(left, right);

    // === RIGHT COLUMN ===
    const attackSection = document.createElement("div");
    const saveSection = document.createElement("div");
    const srSection = document.createElement("div");
    right.append(attackSection, saveSection, srSection);

    // === Helper functions ===
    function createBoundInput(obj, key, min = null, max = null, onChange = null) {
      const input = document.createElement("input");
      input.type = "number";
      if (min !== null) input.min = min;
      if (max !== null) input.max = max;
      input.value = obj[key] ?? 0;
      input.addEventListener("input", () => {
        obj[key] = parseInt(input.value) || 0;
        if (onChange) onChange();
      });
      return input;
    }

    function createCountInput(label, onChange) {
      const row = document.createElement("div");
      const l = document.createElement("label");
      const i = document.createElement("input");

      l.textContent = label + ": ";
      i.type = "number";
      i.min = 0;
      i.value = 0;
      i.addEventListener("input", () => {
        onChange(parseInt(i.value) || 0);
      });

      row.append(l, i);
      return row;
    }

    function createNumberInput(label, onChange) {
      const row = document.createElement("div");
      const l = document.createElement("label");
      const i = document.createElement("input");

      l.textContent = label + ": ";
      i.type = "number";
      i.value = 0;
      i.addEventListener("input", () => {
        onChange(parseFloat(i.value) || 0);
      });

      row.append(l, i);
      return row;
    }

    function buildColumnHeader(labels) {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = `120px repeat(${labels.length}, 1fr)`;
      row.style.fontWeight = "bold";
      row.style.marginBottom = "4px";

      row.appendChild(document.createElement("div")); // empty label column
      labels.forEach(text => {
        const cell = document.createElement("div");
        cell.textContent = text;
        cell.style.textAlign = "center";
        row.appendChild(cell);
      });
      return row;
    }

    function buildAttackRow(atk, index) {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "120px 1fr 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("div");
      label.textContent = `Atk ${index + 1}`;

      const roll = createBoundInput(atk, "roll", 1, 20);
      const mod = createBoundInput(atk, "modifier");
      const dmg = createBoundInput(atk, "damage");

      row.append(label, roll, mod, dmg);
      return row;
    }

    function buildSaveRow(sv, index, casterName) {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "120px 1.5fr 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("div");
      label.textContent = `Save ${index + 1}`;

      const targetSelect = document.createElement("select");
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "-- Select Target --";
      targetSelect.appendChild(emptyOption);

      Object.keys(gameData.characterStats).forEach(char => {
        const opt = document.createElement("option");
        opt.value = char;
        opt.textContent = char;
        targetSelect.appendChild(opt);
      });

      // Initialize target to null
      sv.target = null;

      // Use your existing updateTarget function
      function updateTarget(newTarget) {
        const oldTarget = sv.target;

        // Remove from old target if necessary
        if (oldTarget && oldTarget !== newTarget) {
          const oldStats = gameData.characterStats[oldTarget];
          if (oldStats?.savesFromSpells) {
            oldStats.savesFromSpells = oldStats.savesFromSpells.filter(s => s !== sv);
            recalcCharacterStats(oldTarget);
          }
        }

        // Only add to new target if it's not the caster
        if (newTarget && newTarget !== casterName) {
          const tStats = gameData.characterStats[newTarget];
          if (!tStats.savesFromSpells) tStats.savesFromSpells = [];
          if (!tStats.savesFromSpells.includes(sv)) tStats.savesFromSpells.push(sv);
        }

        sv.target = newTarget;

        if (casterName) recalcCharacterStats(casterName);
        if (newTarget) recalcCharacterStats(newTarget);
        updateSideStats();
      }


      // Only call updateTarget when the user explicitly selects a target
      targetSelect.addEventListener("change", () => {
        updateTarget(targetSelect.value || null);
      });

      // Inputs
      const roll = createBoundInput(sv, "roll", 1, 20, () => {
        if (sv.target) recalcCharacterStats(sv.target);
        updateSideStats();
      });

      const mod = createBoundInput(sv, "modifier", null, null, () => {
        if (sv.target) recalcCharacterStats(sv.target);
        updateSideStats();
      });

      row.append(label, targetSelect, roll, mod);
      return row;
    }



    function buildSRRow(sr, index) {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "120px 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("div");
      label.textContent = `SR ${index + 1}`;

      const roll = createBoundInput(sr, "roll", 1, 20);
      const mod = createBoundInput(sr, "modifier");
      mod.addEventListener("input", () => sr.casterLevel = sr.modifier);

      row.append(label, roll, mod);
      return row;
    }

    // === SYNC FUNCTIONS ===
    function syncAttacks(count) {
      while (spell.attacks.length < count) spell.attacks.push({ roll: 1, modifier: 0, damage: 0 });
      spell.attacks.length = count;

      attackSection.innerHTML = "";
      if (count > 0) {
        attackSection.appendChild(document.createElement("h4")).textContent = "Attacks";
        attackSection.appendChild(buildColumnHeader(["D20", "Mod", "Dmg"]));
        spell.attacks.forEach((atk, i) => attackSection.appendChild(buildAttackRow(atk, i)));
      }
    }

    function syncSaves(count) {
      // Make sure the spell.saves array has the right number of entries
      while (spell.saves.length < count)
        spell.saves.push({ target: null, roll: 1, modifier: 0 });
      spell.saves.length = count;

      // Clear the save section
      saveSection.innerHTML = "";

      if (count > 0) {
        saveSection.appendChild(document.createElement("h4")).textContent = "Saving Throws";
        saveSection.appendChild(buildColumnHeader(["Target", "D20", "Mod"]));

        spell.saves.forEach((sv, i) => {
          const row = buildSaveRow(sv, i, characterName);

          // Clear the dropdown selection so nothing is preselected
          const select = row.querySelector("select");
          if (select) select.value = "";

          saveSection.appendChild(row);
        });
      }
    }

    function syncSR(count) {
      while (spell.spellResistance.length < count) spell.spellResistance.push({ roll: 1, modifier: 0, casterLevel: 0 });
      spell.spellResistance.length = count;

      srSection.innerHTML = "";
      if (count > 0) {
        srSection.appendChild(document.createElement("h4")).textContent = "Spell Resistance";
        srSection.appendChild(buildColumnHeader(["D20", "CL"]));
        spell.spellResistance.forEach((sr, i) => srSection.appendChild(buildSRRow(sr, i)));
      }
    }

    // === LEFT COLUMN CONTENT ===
    const nameInput = document.createElement("input");
    nameInput.placeholder = "Spell Name";
    nameInput.addEventListener("input", () => spell.name = nameInput.value);
    left.appendChild(nameInput);

    left.appendChild(document.createElement("hr"));

    left.appendChild(createCountInput("Attack Rolls", v => syncAttacks(v)));
    left.appendChild(createCountInput("Saving Throws", v => syncSaves(v)));
    if (gameData.edition === "pathfinder") left.appendChild(createCountInput("Spell Resistance", v => syncSR(v)));

    left.appendChild(document.createElement("hr"));

    left.appendChild(createNumberInput("Extra Damage", v => spell.extra.damage = v));
    left.appendChild(createNumberInput("Extra Healing", v => spell.extra.healing = v));

    // === MODAL ===
    showModal(`Cast Spell — ${characterName}`, wrapper, () => {
      spell.name = spell.name || "New Spell";
      resolve(spell);
    });

    const cancelBtn = document.getElementById("modal-cancel");
    cancelBtn.onclick = () => {
      hideModal();
      resolve(null);
    };
  });
}

function openCharacterSelectModal(title) {
  return new Promise(resolve => {
    const container = document.createElement("div");
    const select = document.createElement("select");

    gameData.characters.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    container.appendChild(document.createTextNode(title));
    container.appendChild(document.createElement("br"));
    container.appendChild(select);

    showModal(title, container, () => {
      resolve(select.value);
    });

    const cancelBtn = document.getElementById("modal-cancel");
    cancelBtn.onclick = () => {
      hideModal();
      resolve(null);
    };
  });
}

function updateStatsAndRender(characterName) {
  renderEditorStats(characterName);
  updateSideStats();
  renderStatsActions(characterName);
}

// -------------------- CHARACTER HANDLING --------------------
function selectCharacter(nameOrTag) {
  // If a tag was given (e.g. from clicking initiative list), resolve to source name
  const statName = resolveToStatName(nameOrTag) || nameOrTag;

  if (!statName || !gameData.characterStats[statName]) {
    // if it's not a real stat name, don't change (or we could keep previous)
    console.warn("selectCharacter: could not resolve", nameOrTag);
    return;
  }

  selectedCharacter = statName;

  // optional: keep track of selectedTag (if user selected via initiative row)
  if (typeof nameOrTag === "string") {
    const entry = resolveEntryByTag(nameOrTag) || initiativeOrder.find(e => e.displayName === nameOrTag);
    selectedTag = entry?.tag || null;
  } else {
    selectedTag = null;
  }
  updateSideStats();
  renderStatsActions(selectedCharacter);
  renderSpellEditor(selectedCharacter);
  renderEditorStats(selectedCharacter);
  highlightSelectedButton(selectedCharacter);
}

// -------------------- INITIATIVE --------------------
function renderInitiativeControls() {
  const controlsDiv = document.getElementById("initiative-controls");
  if (!controlsDiv) return;

  controlsDiv.innerHTML = `
      <button id="start-combat-btn">Start Combat</button>
      <button id="add-init-btn">Add Initiative</button>
      <button id="clear-init-btn">Clear All</button>
      <button id="next-turn-btn" disabled>Next Turn</button>
      <button id="prev-turn-btn" disabled>Previous Turn</button>
    `;

  // Disable next/prev if no initiative
  const nextBtn = document.getElementById("next-turn-btn");
  const prevBtn = document.getElementById("prev-turn-btn");

  // Enable/disable next/prev buttons if there’s initiative
  const updateTurnButtons = () => {
    const hasInit = initiativeOrder.length > 0;
    nextBtn.disabled = !hasInit;
    prevBtn.disabled = !hasInit;
    nextBtn.style.display = hasInit ? "inline-block" : "none";
    prevBtn.style.display = hasInit ? "inline-block" : "none";
  };
  updateTurnButtons();

  // Attach events
  document.getElementById("start-combat-btn").onclick = startCombat;

  document.getElementById("add-init-btn").onclick = async () => {
    const name = await openCharacterSelectModal("Select a character for initiative");
    if (!name || !gameData.characterStats[name]) return;

    const stats = gameData.characterStats[name];
    if (!stats.initiativeRolls) stats.initiativeRolls = [];
    stats.isActiveInCombat = true;

    const result = await openUnifiedActionModal(`${name} Initiative`, false);
    if (!result) return;

    const { roll, modifier } = result;
    const total = roll + modifier;
    const tag = crypto.randomUUID();

    // Special-case NPC so displayName becomes "NPC X" but source remains "NPC"
    let displayName = name;
    let source = name;
    if (name === "NPC") {
      const npcPool = gameData.characterStats["NPC"];
      if (!npcPool.initiativeRolls) npcPool.initiativeRolls = [];
      const nextNpcNumber = npcPool.initiativeRolls.filter(r => r.isVisibleInOrder !== false).length + 1;
      displayName = `NPC ${nextNpcNumber}`;
      source = "NPC";
    }

    // Add to the character's initiativeRolls (source is the real data owner)
    const entry = {
      roll,
      modifier,
      total,
      isVisibleInOrder: true,
      tag,
      displayName,
      source
    };
    stats.initiativeRolls.push(entry);

    // Global quick index for UI sorted rendering (store displayName but keep tag & source)
    initiativeOrder.push({ tag, displayName, initiative: total, source });
    initiativeOrder.sort((a, b) => b.initiative - a.initiative);

    critChecker(name, roll);
    renderInitiative();
    updateSideStats();
    updateTurnButtons();
  };

  document.getElementById("next-turn-btn").onclick = () => {
    if (initiativeOrder.length > 0) {
      currentTurnIndex = (currentTurnIndex + 1) % initiativeOrder.length;
      const activeName = getCurrentTurnCharacter();

      // ✅ Automatically select that character
      if (activeName) {
        selectCharacter(activeName);
      }

      renderInitiative();
    }
  };

  document.getElementById("prev-turn-btn").onclick = () => {
    if (initiativeOrder.length > 0) {
      currentTurnIndex =
        (currentTurnIndex - 1 + initiativeOrder.length) % initiativeOrder.length;
      const activeName = getCurrentTurnCharacter();

      // ✅ Automatically select that character
      if (activeName) {
        selectCharacter(activeName);
      }

      renderInitiative();
    }
  };

  document.getElementById("clear-init-btn").onclick = () => {
    if (confirm("Clear all initiative entries?")) {
      initiativeOrder = [];
      combatStarted = false;
      Object.values(gameData.characterStats).forEach(stats => {
        stats.isActiveInCombat = false;

        if (Array.isArray(stats.initiativeRolls)) {
          stats.initiativeRolls.forEach(entry => {
            entry.isVisibleInOrder = false;
          });
        }
      });
      currentTurnIndex = 0;
      npcCount = 0;
      renderInitiative();
      updateSideStats();
      updateTurnButtons();
    }
  };
}

function updateTurnButtons() {
  const prevBtn = document.getElementById("prev-turn-btn");
  const nextBtn = document.getElementById("next-turn-btn");
  const reactionBtn = document.getElementById("reaction-btn");

  const show = combatStarted; // or however you track active combat

  [prevBtn, nextBtn].forEach(btn => {
    if (btn) btn.style.display = show ? "inline-block" : "none";
  });

  // Handle Reaction button
  if (reactionBtn) {
    reactionBtn.style.display = show ? "inline-block" : "none";
  } else {
    // Create it if it doesn't exist yet
    const container = document.getElementById("initiative-controls");
    if (container && show) {
      const btn = document.createElement("button");
      btn.id = "reaction-btn";
      btn.textContent = "Reaction";
      btn.onclick = handleReactionMode;
      container.appendChild(btn);
    }
  }
}

function addToInitiative(name) {
  const value = parseInt(prompt(`Enter initiative for ${name}:`));
  if (!isNaN(value)) {
    initiativeOrder.push({ name, initiative: value });
    initiativeOrder.sort((a, b) => b.initiative - a.initiative);
    renderInitiative();
    updateTurnButtons();
  }
}

function updateNpcInitiative(npcNumber, newInitiative) {
  const npcName = `NPC ${npcNumber}`;
  const entry = initiativeOrder.find(e => e.name === npcName);
  if (entry) {
    entry.initiative = newInitiative;
    renderInitiative();
  }
}

function renderInitiative() {
  const trackerDiv = document.getElementById("combat-tracker");
  if (!trackerDiv) return;

  const listEl = document.getElementById("initiative-list");
  if (!listEl) return;

  // 🔹 Step 1. Dynamically rebuild initiativeOrder each time
  let combinedOrder = [];


  // PCs
  gameData.characters.forEach(pc => {
    if (pc === "NPC") return;
    const stats = gameData.characterStats[pc];
    if (stats?.isActiveInCombat && stats.initiativeRolls?.length > 0) {
      stats.initiativeRolls.forEach((rollObj) => {
        if (rollObj && Boolean(rollObj.isVisibleInOrder)) {
          if (!rollObj.tag) rollObj.tag = crypto.randomUUID();
          rollObj.source = rollObj.source || pc;
          rollObj.displayName = rollObj.displayName || pc;
          combinedOrder.push({ tag: rollObj.tag, displayName: rollObj.displayName, initiative: rollObj.total, source: rollObj.source });
        }
      });
    }
  });

  // NPCs
  const npcPool = gameData.characterStats["NPC"];
  if (npcPool?.isActiveInCombat && npcPool.initiativeRolls?.length > 0) {
    npcPool.initiativeRolls.forEach((rollObj, i) => {
      if (rollObj && Boolean(rollObj.isVisibleInOrder)) {
        if (!rollObj.tag) rollObj.tag = crypto.randomUUID();
        rollObj.source = rollObj.source || "NPC";
        rollObj.displayName = rollObj.displayName || `NPC ${i + 1}`;
        combinedOrder.push({ tag: rollObj.tag, displayName: rollObj.displayName, initiative: rollObj.total, source: rollObj.source, npcIndex: rollObj.npcIndex });
      }
    });
  }

  // Sort descending and store globally
  combinedOrder.sort((a, b) => b.initiative - a.initiative);
  initiativeOrder = combinedOrder;

  // 🔹 Step 2. Handle empty case
  if (initiativeOrder.length === 0) {
    listEl.innerHTML = "<p>No initiative yet</p>";
    document.getElementById("next-turn-btn").disabled = true;
    document.getElementById("prev-turn-btn").disabled = true;
    return;
  } else {
    // ✅ Re-enable turn buttons when we have initiative
    document.getElementById("next-turn-btn").disabled = false;
    document.getElementById("prev-turn-btn").disabled = false;
  }


  // 🔹 Step 3. Render UI
  listEl.innerHTML = initiativeOrder.map((entry, index) => `
  <li class="${index === currentTurnIndex ? "active-turn" : ""}" data-tag="${entry.tag}">
    <input type="text" class="initiative-name-input" data-tag="${entry.tag}" value="${entry.displayName}" title="Click to edit name" />
    (Init: ${entry.initiative})
    <button class="remove-btn" data-tag="${entry.tag}">Remove</button>
  </li>
`).join("");

  // Click a list item to select it
  listEl.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", e => {
      const tag = li.dataset.tag;
      selectCharacter(tag);
    });
  });

  // 🔹 Step 4. Select the active turn’s character
  const activeName = initiativeOrder[currentTurnIndex]?.source;
  if (activeName) selectCharacter(activeName);

  // 🔹 Step 5. Handle Remove buttons
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.onclick = () => {
      const tag = btn.dataset.tag;

      // Search all characters + NPC pool
      const found = resolveEntryByTag(tag);
      if (found) {
        found.isVisibleInOrder = false;
      }

      renderInitiative();
      updateSideStats();
    };
  });

  document.querySelectorAll(".initiative-name-input").forEach(input => {
    input.addEventListener("change", e => {
      const newName = e.target.value.trim() || "Unknown";
      const tag = e.target.dataset.tag;
      const entry = resolveEntryByTag(tag);
      if (entry) {
        entry.displayName = newName;
      }
      renderInitiative();
    });
  });
}

async function startCombat() {
  // 1️⃣ Ask for NPC count
  playSoundFromUrl("https://cdn.pixabay.com/audio/2024/08/07/audio_b41cb4e0ac.mp3", 0.2);
  const npcCount = parseInt(await openNumberModal("Start Combat", "How many NPCs join combat?")) || 0;

  initiativeOrder = [];
  combatStarted = true;

  // 2️⃣ Roll initiative for each PC
  for (const pc of gameData.characters) {
    if (pc === "NPC") continue; // skip pool placeholder

    const result = await openUnifiedActionModal(pc + " Initiative", false);
    if (!result) continue;

    const { roll, modifier } = result;
    const total = roll + modifier;
    const tag = crypto.randomUUID();

    const stats = gameData.characterStats[pc];
    stats.isActiveInCombat = true;
    stats.initiative = total;
    if (!stats.initiativeRolls)
      stats.initiativeRolls = [];
    stats.initiativeRolls.push({ roll, modifier, total, isVisibleInOrder: true, tag, displayName: pc, source: pc });

    critChecker(pc, roll);
  }

  // 3️⃣ Roll initiative for NPCs (store in the NPC)
  const npcPool = gameData.characterStats["NPC"];
  npcPool.isActiveInCombat = true;
  // npcPool.initiativeRolls = []; // reset

  for (let i = 1; i <= npcCount; i++) {
    const result = await openUnifiedActionModal(`NPC ${i} Initiative`, false);
    if (!result) continue;

    const { roll, modifier } = result;
    const total = roll + modifier;
    const tag = crypto.randomUUID();

    npcPool.initiativeRolls.push({ roll, modifier, total, isVisibleInOrder: true, tag, displayName: `NPC ${i}`, source: "NPC", npcIndex: i }); //------------------------i was 1--------------------------------
    critChecker(`NPC ${i}`, roll);
  }

  // 4️⃣ Sort and render dynamically (renderInitiative rebuilds the full list)
  currentTurnIndex = 0;
  renderInitiative();
  updateSideStats();
  updateTurnButtons();
  showTrackerMessage("Combat started!");
}

// -------------------- CHARACTER BUTTONS --------------------
function renderCharacterButtons() {
  const combatDiv = document.getElementById("combat-character-buttons");
  const statsDiv = document.getElementById("stats-character-buttons");
  const editorDiv = document.getElementById("editor-character-buttons");

  [combatDiv, statsDiv, editorDiv].forEach(container => {
    if (!container) return;
    container.innerHTML = "";
    gameData.characters.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.onclick = () => {
        selectedCharacter = name;
        selectCharacter(name);
        updateSideStats();
        renderStatsActions(selectedCharacter, "stats");
      };

      container.appendChild(btn);

      // ✅ Only in combat tab: add "Init" button
      if (container.id === "combat-character-buttons") {
        const initBtn = document.createElement("button");
        initBtn.textContent = "Add to Initiative";
        initBtn.onclick = () => addToInitiative(name);
        container.appendChild(initBtn);
      }
    })
  });

  highlightSelectedButton(selectedCharacter);
}

function exitReactionMode() {
  if (!reactionMode) return;

  reactionMode = false;
  showTrackerMessage(`Reaction complete. Returning to ${getCurrentTurnCharacter()}'s turn.`);

  reactionCharacter = null;

  // Re-render normal UI
  renderStatsActions(getCurrentTurnCharacter());
}

function restartProgram() {
  const confirmation = prompt(
    "⚠️ This will erase all current game data.\n\n" +
    "To confirm, type the word 'restart' below:"
  );

  if (!confirmation || confirmation.trim().toLowerCase() !== "restart") {
    alert("Restart cancelled.");
    return;
  }

  // Clear saved data
  // ---------------- Reset all in-memory game state ----------------
  gameData = null;
  combatStarted = false;
  npcCount = 0;
  selectedTag = null;
  reactionMode = false;
  reactionCharacter = null;
  localStorage.removeItem("myGameData");

  // Reset in-memory state
  trackerStarted = false;
  selectedCharacter = null;
  initiativeOrder = [];
  currentTurnIndex = 0;

  // ---------------- Clear all dynamic UI ----------------
  const uiIds = [
    "stats-character-buttons",
    "combat-character-buttons",
    "stats-content",
    "tracker",
    "initiative-controls",
    "stats-buttons",
    "stats-display-content",
    "pc-names"
  ];

  uiIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  // ---------------- Reset form fields ----------------
  const numPCs = document.getElementById("numPCs");
  if (numPCs) numPCs.value = "";

  const editionInput = document.getElementById("edition");
  if (editionInput) editionInput.value = "5e";

  // ---------------- Hide main game UI ----------------
  const mainTabs = document.getElementById("app-tracker");
  if (mainTabs) mainTabs.style.display = "none";

  // ---------------- Show start menu ----------------
  const startMenu = document.getElementById("start-menu");
  if (startMenu) startMenu.style.display = "block";

  // ---------------- Reset tabs ----------------
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => tab.classList.remove("active"));

  const tabContents = document.querySelectorAll("#app-tracker .tab-content");
  tabContents.forEach(c => (c.style.display = "none"));

  // ---------------- Reset selectedCharacter dropdowns ----------------
  const statsSelect = document.getElementById("stats-character-select");
  const editorSelect = document.getElementById("editor-character-select");
  [statsSelect, editorSelect].forEach(select => {
    if (select) select.innerHTML = "";
  });

  // ---------------- Show tracker placeholder ----------------
  const tracker = document.getElementById("tracker");
  if (tracker) tracker.innerHTML = "<p>Combat Tracker Placeholder</p>";

  // ---------------- Reset modals ----------------
  hideModal();
}

// -------------------- MODAL HELPERS --------------------
function showModal(title, bodyContent, onConfirm = null) {
  const modal = document.getElementById("action-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  modalTitle.textContent = title;
  modalBody.innerHTML = "";

  if (bodyContent instanceof HTMLElement) modalBody.appendChild(bodyContent);
  else modalBody.textContent = bodyContent;

  confirmBtn.onclick = () => {
    if (onConfirm) onConfirm();
    hideModal();
  };
  cancelBtn.onclick = hideModal;

  modal.classList.remove("hidden");
}

function hideModal() {
  const modal = document.getElementById("action-modal");
  modal.classList.add("hidden");
}

function getCurrentTurnCharacter() {
  if (reactionMode && reactionCharacter) return reactionCharacter;
  if (initiativeOrder.length === 0) return null;
  const entry = initiativeOrder[currentTurnIndex];
  if (!entry) return null;
  return entry.source || resolveToStatName(entry.tag) || entry.displayName || null;
}

function getStatName(name) {
  if (name && name.startsWith("NPC ")) return "NPC";
  return name;
}

// NEW helper - performs one attack, updates stats, returns a result object
async function performSingleAttack(name, options = { logGlobal: false }) {
  const stats = gameData.characterStats[name];
  if (!stats) return null;

  const result = await openUnifiedActionModal("attack", true);
  if (!result) return null;

  const { roll, modifier, damage } = result;
  const moddedRoll = roll + modifier;

  critChecker(name, roll);

  if (options.logGlobal) {
    // Track per-attack data instead of global damage
    const attackEntry = { roll, modifier, damage, moddedRoll };

    // Push to all the appropriate roll tracking arrays
    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.attackRolls.push(attackEntry);

    // Increment counts
    stats.attacksMade++;

    // Recalculate totals dynamically (damage totals now come from the attackRolls array)
    recalcCharacterStats(name);
    updateStatsAndRender(name);
  }

  showTrackerMessage(buildDisplayString(name, "attack", { roll, modifier, moddedRoll, damage }));
  return { roll, modifier, moddedRoll, damage };
}

function critChecker(characterName, roll) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;
  if (roll === 1) stats.natural1s++;
  else if (roll === 20) stats.natural20s++;
}

function buildDisplayString(characterName, type, result) {
  if (!result) return "";

  let msg = `${characterName} `;

  switch (type) {
    case "attack":
      msg += result.hit
        ? `HIT! Damage: ${result.damage}`
        : `ATTACK MISSED (roll: ${result.moddedRoll})`;
      break;
    case "ability":
      msg += `ability check → Roll: ${result.roll} (mod: ${result.modifier})`;
      break;
    case "save":
      msg += `saving throw → Roll: ${result.roll} (mod: ${result.modifier})`;
      break;
    case "initiative":
      msg += `initiative → Total: ${result.moddedRoll}`;
      break;
    default:
      msg += `${type} → Roll: ${result.roll} (mod: ${result.modifier})`;
  }

  return msg;
}

// -------------------- ACTION HANDLERS --------------------
async function handleAttack(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const rolls = await openMultiRollModal(characterName, "Attack", true);
  if (!rolls) return;

  for (const { roll, modifier, damage } of rolls) {
    const moddedRoll = roll + modifier;
    critChecker(characterName, roll);

    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.attackRolls.push({ roll, modifier, damage, moddedRoll });
    stats.attacksMade++;

    showTrackerMessage(buildDisplayString(characterName, "attack", { roll, modifier, moddedRoll, damage }));
  }

  recalcCharacterStats(characterName);
  updateStatsAndRender(characterName);
}

async function handleAbility(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const rolls = await openMultiRollModal(characterName, "Ability", false);
  if (!rolls) return;

  for (const { roll, modifier } of rolls) {
    const moddedRoll = roll + modifier;

    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.abilityChecks++;
    stats.abilityRolls.push({ roll, modifier, moddedRoll });

    showTrackerMessage(buildDisplayString(characterName, "ability", { roll, modifier, moddedRoll }));
  }

  recalcCharacterStats(characterName);
  updateStatsAndRender(characterName);
}

async function handleSave(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const rolls = await openMultiRollModal(characterName, "Save", false);
  if (!rolls) return;

  for (const { roll, modifier } of rolls) {
    const moddedRoll = roll + modifier;
    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.savingThrows++;
    stats.saveRolls.push({ roll, modifier, moddedRoll });

    showTrackerMessage(buildDisplayString(characterName, "save", { roll, modifier, moddedRoll }));
  }

  recalcCharacterStats(characterName);
  updateStatsAndRender(characterName);
}

async function handleConcentration(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const rolls = await openMultiRollModal(characterName, "Concentration", false);
  if (!rolls) return;

  for (const { roll, modifier } of rolls) {
    const moddedRoll = roll + modifier;

    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.concentrationChecks++;
    stats.concentrationRolls.push({ roll, modifier, moddedRoll });

    showTrackerMessage(buildDisplayString(characterName, "concentration", { roll, modifier, moddedRoll }));
  }

  recalcCharacterStats(characterName);
  updateStatsAndRender(characterName);
}

async function handleInitiative(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const rolls = await openMultiRollModal(characterName, "Initiative", false);
  if (!rolls) return;

  for (const { roll, modifier } of rolls) {
    const moddedRoll = roll + modifier;

    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier });
    stats.initiativeRolls.push({ roll, modifier, total: moddedRoll });
    stats.initiative = moddedRoll; // update current initiative to last roll

    showTrackerMessage(buildDisplayString(characterName, "initiative", { roll, modifier, moddedRoll }));
  }

  recalcCharacterStats(characterName);
  updateStatsAndRender(characterName);
}

async function handleSpellsCast(name) {
  name = getStatName(name);
  const stats = gameData.characterStats[name];
  if (!stats) return;

  const spell = await openCastSpellModal(name);
  if (!spell) return;
  playSoundFromUrl("https://cdn.pixabay.com/audio/2021/08/02/audio_4527d82a75.mp3", 0.3);

  stats.spellHistory.push(spell);
  stats.spellsCast = stats.spellHistory.length;

  recalcCharacterStats(name);
  renderSpellEditor(name);
  updateSideStats();
  updateStatsAndRender(name);
}

function handleMoneySpent(name) {
  playSoundFromUrl("https://cdn.pixabay.com/audio/2022/12/17/audio_43e9af63f3.mp3", 0.2);
  name = getStatName(name);
  if (!gameData.characterStats[name]) return;
  inputAction(name, "money", "money spent");
}

function handleDamageTaken(name) {
  playSoundFromUrl("https://cdn.pixabay.com/audio/2025/08/03/audio_639437072a.mp3", 0.3);
  name = getStatName(name);
  if (!gameData.characterStats[name]) return;
  inputAction(name, "damage", "damage");
}

function handleHealingDone(name) {
  playSoundFromUrl("https://cdn.pixabay.com/download/audio/2021/08/09/audio_07e661df12.mp3?filename=health-pickup-6860.mp3", 0.4);
  name = getStatName(name);
  if (!gameData.characterStats[name]) return;
  inputAction(name, "healing", "healing");
}

function handleTimesKilled(name) {
  playSoundFromUrl("https://us-tuna-sounds-files.voicemod.net/d23c1e88-eb51-448e-8ad1-9abde6e2cad7-1659635683462.mp3", 0.5);
  name = getStatName(name);
  const stats = gameData.characterStats[name];
  if (!stats) {
    console.warn("Stats not found for character: ${name}");
    return;
  }
  stats.timesKilled = (stats.timesKilled || 0) + 1;
  showTrackerMessage(`${name} added to Times Killed! Total: ${stats.timesKilled}`);
  renderEditorStats(name);
  updateSideStats();
}

async function handleReactionMode() {
  reactionMode = true;

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";

  const title = document.createElement("div");
  title.textContent = "Select a character to react";
  title.style.fontWeight = "bold";
  container.appendChild(title);

  // Character dropdown
  const select = document.createElement("select");
  gameData.characters.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  container.appendChild(select);

  // Placeholder for actions UI
  const actionsDiv = document.createElement("div");
  actionsDiv.id = "reaction-actions";
  container.appendChild(actionsDiv);

  // ✅ Render actions for the selected character
  const renderActionsFor = (name) => {
    actionsDiv.innerHTML = "";

    const heading = document.createElement("div");
    heading.textContent = `Actions for ${name}:`;
    heading.style.marginBottom = "6px";
    actionsDiv.appendChild(heading);

    // Base action set
    const actions = [
      { label: "Attack", handler: handleAttack },
      { label: "Ability", handler: handleAbility },
      { label: "Save", handler: handleSave },
      { label: "Spell", handler: handleSpellsCast },
      { label: "Killed", handler: handleTimesKilled },
      { label: "Spend", handler: handleMoneySpent },
      { label: "Damage", handler: handleDamageTaken },
      { label: "Heal", handler: handleHealingDone }
    ];

    // ✅ Pathfinder-only addition
    if (gameData.edition === "pathfinder") {
      actions.splice(3, 0, { label: "Concentration", handler: handleConcentration });
      // inserting it right after “Save” feels natural, but adjust order if needed
    }

    // Render all buttons
    actions.forEach(({ label, handler }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.onclick = () => handler(name);

      // small hover animation
      btn.onmouseenter = () => {
        btn.style.backgroundColor = "red";
        btn.style.transform = "scale(1.05)";
      };
      btn.onmouseleave = () => {
        btn.style.backgroundColor = "";
        btn.style.transform = "";
      };

      actionsDiv.appendChild(btn);
    });
  };

  // Initial render and update on character change
  renderActionsFor(select.value);
  select.onchange = () => renderActionsFor(select.value);

  // Show modal with full UI
  showModal("Reaction Mode", container, () => {
    reactionCharacter = select.value;
    showTrackerMessage(`${reactionCharacter} is reacting!`);
    renderActionsFor(reactionCharacter);
  });

  // Override cancel button to cleanly exit
  const cancelBtn = document.getElementById("modal-cancel");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      hideModal();
      reactionMode = false;
    };
  }
}

// -------------------- STATS UI --------------------
const handlerMap = {
  Attack: handleAttack,
  Ability: handleAbility,
  Save: handleSave,
  Concentration: handleConcentration,
  Initiative: handleInitiative,
  Spell: handleSpellsCast,
  "Times Killed": handleTimesKilled,
  "Money Spent": handleMoneySpent,
  Damage: handleDamageTaken,
  Heal: handleHealingDone
};

function renderStatsActions(characterName, context = "combat") {
  let containerId;

  // pick correct button container depending on which tab is active
  if (context === "combat") {
    containerId = "combat-actions";
  } else if (context === "stats") {
    containerId = "stats-actions";
  } else {
    console.warn("Unknown context for renderStatsActions:", context);
    return;
  }

  const statsButtons = document.getElementById(containerId);
  if (!statsButtons) {
    console.warn("No container found for", containerId);
    return;
  }

  statsButtons.innerHTML = "";

  function createBtn(label, handler) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => {
      const activeChar = getCurrentTurnCharacter() || characterName;
      handler(activeChar);
    };

    btn.style.margin = "5px";

    return btn;
  }

  let labels =
    gameData.edition === "pathfinder"
      ? ["Attack", "Ability", "Save", "Concentration", "Initiative", "Spell", "Times Killed", "Money Spent", "Damage", "Heal"]
      : ["Attack", "Ability", "Save", "Initiative", "Spell", "Times Killed", "Money Spent", "Damage", "Heal"];

  if (context === "combat") {
    labels = labels.filter(label => label !== "Initiative" && label !== "Money Spent");
  }

  labels.forEach(label => {
    statsButtons.appendChild(createBtn(label, handlerMap[label]));
  });
}

function renderSpellEditor(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  // Ensure spellHistory exists
  if (!Array.isArray(stats.spellHistory)) {
    stats.spellHistory = [];
  }

  const editorContainer = document.getElementById("editor-container");
  if (!editorContainer) return;

  // 🧹 Clear any previous spell editor
  let oldSection = editorContainer.querySelector(".spell-section");
  if (oldSection) oldSection.remove();

  // 🧾 Spell section container
  const spellSection = document.createElement("div");
  spellSection.classList.add("spell-section");

  const header = document.createElement("h3");
  header.textContent = "Spell History";
  spellSection.appendChild(header);

  // 🎯 Render each spell
  stats.spellHistory.forEach((spell, i) => {
    const spellDiv = document.createElement("div");
    spellDiv.classList.add("spell-entry");

    // === SPELL HEADER (Name + Remove) ===
    const spellHeader = document.createElement("div");
    spellHeader.classList.add("spell-header");
    spellHeader.style.display = "inline-flex";
    spellHeader.style.alignItems = "center";
    spellHeader.style.gap = "10px";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = spell.name || "New Spell";
    nameInput.addEventListener("input", () => {
      spell.name = nameInput.value;
    });
    spellHeader.appendChild(nameInput);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove Spell";
    removeBtn.addEventListener("click", () => {
      const removedSpell = stats.spellHistory.splice(i, 1)[0];

      // Clean up all saves for other targets
      if (removedSpell && removedSpell.saves) {
        removedSpell.saves.forEach(sv => {
          const target = sv.target;
          if (target && target !== characterName) {
            const tStats = gameData.characterStats[target];
            if (tStats?.savesFromSpells) {
              tStats.savesFromSpells = tStats.savesFromSpells.filter(s => s !== sv);
              recalcCharacterStats(target);
            }
          }
        });
      }
      stats.spellsCast = stats.spellHistory.length;
      recalcCharacterStats(characterName);
      renderSpellEditor(characterName);
      updateSideStats();
    });
    spellHeader.appendChild(removeBtn);

    spellDiv.appendChild(spellHeader);

    // === DAMAGE + HEALING (inline row) ===
    const dmgHealDiv = document.createElement("div");
    dmgHealDiv.classList.add("spell-dmg-heal");
    dmgHealDiv.style.display = "flex";
    dmgHealDiv.style.alignItems = "center";
    dmgHealDiv.style.fontWeight = "bold";
    dmgHealDiv.style.gap = "10px";

    // Make sure extra exists
    spell.extra = spell.extra || { damage: 0, healing: 0 };

    // Damage
    const damageLabel = document.createElement("label");
    damageLabel.textContent = "Damage:";
    dmgHealDiv.appendChild(damageLabel);

    const damageInput = document.createElement("input");
    damageInput.type = "number";
    damageInput.value = spell.extra.damage ?? "";
    damageInput.addEventListener("input", () => {
      spell.extra.damage = parseFloat(damageInput.value) || 0;
      recalcCharacterStats(characterName);
      updateSideStats();
    });
    dmgHealDiv.appendChild(damageInput);

    // Healing
    const healLabel = document.createElement("label");
    healLabel.textContent = "Healing:";
    dmgHealDiv.appendChild(healLabel);

    const healInput = document.createElement("input");
    healInput.type = "number";
    healInput.value = spell.extra.healing ?? "";
    healInput.addEventListener("input", () => {
      spell.extra.healing = parseFloat(healInput.value) || 0;
      recalcCharacterStats(characterName);
      updateSideStats();
    });
    dmgHealDiv.appendChild(healInput);

    spellDiv.appendChild(dmgHealDiv);

    // === SPELL RESISTANCE ===
    if (gameData.edition === "pathfinder") {
      const srHeader = document.createElement("h4");
      srHeader.textContent = "Spell Resistance Checks";
      spellDiv.appendChild(srHeader);

      spell.spellResistance = spell.spellResistance || [];
      spell.spellResistance.forEach((sr, srIndex) => {
        const srDiv = document.createElement("div");
        srDiv.classList.add("spell-resistance");
        srDiv.style.display = "inline-flex";
        srDiv.style.alignItems = "center";
        srDiv.style.gap = "10px";

        const rollLabel = document.createElement("label");
        rollLabel.textContent = "D20:";
        srDiv.appendChild(rollLabel);

        const rollInput = document.createElement("input");
        rollInput.type = "number";
        rollInput.min = 1;
        rollInput.max = 20;
        rollInput.value = sr.roll ?? 0;
        rollInput.addEventListener("input", () => {
          sr.roll = parseInt(rollInput.value) || 0;
          recalcCharacterStats(characterName);
          updateSideStats();
        });
        srDiv.appendChild(rollInput);

        const clLabel = document.createElement("label");
        clLabel.textContent = "Mod:";
        srDiv.appendChild(clLabel);

        const clInput = document.createElement("input");
        clInput.type = "number";
        clInput.value = sr.modifier ?? sr.casterLevel ?? 0;
        clInput.addEventListener("input", () => {
          const newVal = parseInt(clInput.value) || 0;
          sr.modifier = newVal;
          sr.casterLevel = newVal;
          recalcCharacterStats(characterName);
          updateSideStats();
        });
        srDiv.appendChild(clInput);

        const removeSRBtn = document.createElement("button");
        removeSRBtn.textContent = "Remove";
        removeSRBtn.addEventListener("click", () => {
          spell.spellResistance.splice(srIndex, 1);
          recalcCharacterStats(characterName);
          renderSpellEditor(characterName);
          updateSideStats();
        });
        srDiv.appendChild(removeSRBtn);

        spellDiv.appendChild(srDiv);
      });

      const addSRBtn = document.createElement("button");
      addSRBtn.textContent = "Add Spell Resistance";
      addSRBtn.addEventListener("click", () => {
        spell.spellResistance.push({ roll: 0, modifier: 0, casterLevel: 0 });
        renderSpellEditor(characterName);
      });
      spellDiv.appendChild(addSRBtn);
    }


    // === ATTACKS ===
    const attackHeader = document.createElement("h4");
    attackHeader.textContent = "Attacks";
    spellDiv.appendChild(attackHeader);

    spell.attacks = spell.attacks || [];
    spell.attacks.forEach((atk, atkIndex) => {
      const atkDiv = document.createElement("div");
      atkDiv.classList.add("spell-attack");
      atkDiv.style.display = "inline-flex";
      atkDiv.style.alignItems = "center";
      atkDiv.style.gap = "10px";

      // Roll
      const rollLabel = document.createElement("label");
      rollLabel.textContent = "D20:";
      atkDiv.appendChild(rollLabel);

      const rollInput = document.createElement("input");
      rollInput.type = "number";
      rollInput.min = 1;
      rollInput.max = 20;
      rollInput.value = atk.roll ?? 0;
      rollInput.addEventListener("input", () => {
        atk.roll = parseInt(rollInput.value) || 0;
        recalcCharacterStats(characterName);
        updateSideStats();
      });
      atkDiv.appendChild(rollInput);

      // Modifier
      const modLabel = document.createElement("label");
      modLabel.textContent = "Mod:";
      atkDiv.appendChild(modLabel);

      const modInput = document.createElement("input");
      modInput.type = "number";
      modInput.value = atk.modifier ?? 0;
      modInput.addEventListener("input", () => {
        atk.modifier = parseInt(modInput.value) || 0;
        recalcCharacterStats(characterName);
        updateSideStats();
      });
      atkDiv.appendChild(modInput);

      // Damage
      const dmgLabel = document.createElement("label");
      dmgLabel.textContent = "Damage:";
      atkDiv.appendChild(dmgLabel);

      const dmgInput = document.createElement("input");
      dmgInput.type = "number";
      dmgInput.value = atk.damage ?? 0;
      dmgInput.addEventListener("input", () => {
        atk.damage = parseFloat(dmgInput.value) || 0;
        recalcCharacterStats(characterName);
        updateSideStats();
      });
      atkDiv.appendChild(dmgInput);

      const removeAtkBtn = document.createElement("button");
      removeAtkBtn.textContent = "Remove";
      removeAtkBtn.addEventListener("click", () => {
        spell.attacks.splice(atkIndex, 1);
        recalcCharacterStats(characterName);
        renderSpellEditor(characterName);
        updateSideStats();
      });
      atkDiv.appendChild(removeAtkBtn);

      spellDiv.appendChild(atkDiv);
    });

    const addAttackBtn = document.createElement("button");
    addAttackBtn.textContent = "Add Attack";
    addAttackBtn.addEventListener("click", () => {
      spell.attacks.push({ roll: 0, hit: 0, damage: 0 });
      renderSpellEditor(characterName);
    });
    spellDiv.appendChild(addAttackBtn);

    // === SAVING THROWS ===
    const saveHeader = document.createElement("h4");
    saveHeader.textContent = "Saving Throws";
    spellDiv.appendChild(saveHeader);

    spell.saves = spell.saves || [];
    spell.saves.forEach((sv, svIndex) => {
      const saveDiv = document.createElement("div");
      saveDiv.classList.add("spell-save");
      saveDiv.style.display = "inline-flex";
      saveDiv.style.alignItems = "center";
      saveDiv.style.gap = "10px";

      // 🎯 Target Character Dropdown
      const targetLabel = document.createElement("label");
      targetLabel.textContent = "Target:";
      saveDiv.appendChild(targetLabel);

      const targetSelect = document.createElement("select");
      const allCharacters = Object.keys(gameData.characterStats);

      // Populate dropdown with all characters
      allCharacters.forEach((char) => {
        const opt = document.createElement("option");
        opt.value = char;
        opt.textContent = char;
        if (sv.target === char) opt.selected = true;
        targetSelect.appendChild(opt);
      });

      // Handle change — when you pick a new target, it moves the save data
      targetSelect.addEventListener("change", () => {
        const newTarget = targetSelect.value;
        linkSaveToTarget(sv, characterName, spell.name, newTarget);
      });

      saveDiv.appendChild(targetSelect);

      // Roll
      const rollLabel = document.createElement("label");
      rollLabel.textContent = "D20:";
      saveDiv.appendChild(rollLabel);

      const rollInput = document.createElement("input");
      rollInput.type = "number";
      rollInput.min = 1;
      rollInput.max = 20;
      rollInput.value = sv.roll ?? 0;
      rollInput.addEventListener("input", () => {
        sv.roll = parseInt(rollInput.value) || 0;
        if (sv.target && gameData.characterStats[sv.target]) {
          recalcCharacterStats(sv.target);
        }
        recalcCharacterStats(characterName);
        updateSideStats();
      });
      saveDiv.appendChild(rollInput);

      // Modifier
      const modLabel = document.createElement("label");
      modLabel.textContent = "Mod:";
      saveDiv.appendChild(modLabel);

      const modInput = document.createElement("input");
      modInput.type = "number";
      modInput.value = sv.modifier ?? 0;
      modInput.addEventListener("input", () => {
        sv.modifier = parseInt(modInput.value) || 0;
        if (sv.target && gameData.characterStats[sv.target]) {
          recalcCharacterStats(sv.target);
        }
        recalcCharacterStats(characterName);
        updateSideStats();
      });
      saveDiv.appendChild(modInput);

      // Remove Save Button
      const removeSaveBtn = document.createElement("button");
      removeSaveBtn.textContent = "Remove";
      removeSaveBtn.addEventListener("click", () => {
        removeSaveFromSpell(characterName, spell, svIndex);
      });
      saveDiv.appendChild(removeSaveBtn);

      spellDiv.appendChild(saveDiv);
    });


    const addSaveBtn = document.createElement("button");
    addSaveBtn.textContent = "Add Save";
    addSaveBtn.addEventListener("click", () => {
      spell.saves.push({ roll: 0, modifier: 0 });
      renderSpellEditor(characterName);
    });
    spellDiv.appendChild(addSaveBtn);

    spellSection.appendChild(spellDiv);
  });

  // === ADD SPELL BUTTON ===
  const addSpellBtn = document.createElement("button");
  addSpellBtn.textContent = "Add Spell";
  addSpellBtn.addEventListener("click", () => {
    stats.spellHistory.push({
      name: "",
      damage: 0,
      healing: 0,
      attacks: [],
      saves: []
    });
    stats.spellsCast = stats.spellHistory.length;
    recalcCharacterStats(characterName);
    renderSpellEditor(characterName);
    updateSideStats();
  });
  spellSection.appendChild(addSpellBtn);

  editorContainer.appendChild(spellSection);
}

function linkSaveToTarget(sv, casterName, spellName, newTarget) {
  // Detach from old target if necessary
  if (sv.target && sv.target !== newTarget) {
    const oldStats = gameData.characterStats[sv.target];
    if (oldStats?.savesFromSpells) {
      oldStats.savesFromSpells = oldStats.savesFromSpells.filter(s => s !== sv);
    }
  }

  // Attach to new target
  sv.target = newTarget;
  const targetStats = gameData.characterStats[newTarget];
  if (!targetStats) return;

  if (!Array.isArray(targetStats.savesFromSpells)) {
    targetStats.savesFromSpells = [];
  }

  // ✅ Only attach to target if target is NOT the caster
  if (newTarget !== casterName && !targetStats.savesFromSpells.includes(sv)) {
    targetStats.savesFromSpells.push(sv);
  }

  // store reference data for display/debug
  sv.caster = casterName;
  sv.spellName = spellName;

  recalcCharacterStats(newTarget);
  updateSideStats();
}

function updateSideStats() {
  const panel = document.getElementById("stats-display-content");
  if (!panel) return;

  // If the selected character is "NPC 1", "NPC 2", etc.,
  // use "NPC" stats instead.
  let nameToUse = selectedCharacter;

  // ✅ If we have a tag, try to resolve which character’s stats it belongs to
  if (selectedTag) {
    for (const [charName, stats] of Object.entries(gameData.characterStats)) {
      const match = stats.initiativeRolls?.some(r => r.tag === selectedTag);
      if (match) {
        nameToUse = charName;
        break;
      }
    }
  }

  // ✅ Handle NPC fallback
  if (nameToUse && nameToUse.startsWith("NPC ") && !gameData.characterStats[nameToUse]) {
    nameToUse = "NPC";
  }


  // No valid character or stats
  if (!nameToUse || !gameData.characterStats[nameToUse]) {
    panel.innerHTML = "<p>No character selected</p>";
    return;
  }

  const s = gameData.characterStats[nameToUse];

  let spellHealing = 0;

  if (Array.isArray(s.spellHistory)) {
    s.spellHistory.forEach(spell => {
      if (spell.extra) {
        spellHealing += parseFloat(spell.extra.healing) || 0;
      }
    });
  }

  const combinedDamage = (s.totalDamage || 0) + s.attackDamage;
  const combinedHealing = (s.healingDone || 0) + spellHealing;

  if (gameData.edition === "pathfinder") {
    panel.innerHTML = `
    <h4>Stats for ${nameToUse}:</h4>
    <p>Attacks Made: ${s.attacksMade}</p>
    <p>Ability Checks: ${s.abilityChecks}</p>
    <p>Saving Throws: ${s.savingThrows}</p
    <p>Concentration Checks: ${s.concentrationChecks}</p>
     <p>Spell Resistances: ${s.totalSpellResistance}</p>
    <p>Spells Cast: ${s.spellsCast}</p>
    <p>Initiative: ${s.initiativeRolls.length > 0
        ? formatD20RollsDisplay(s.initiativeRolls)
        : "No rolls yet."
      }</p>
    <p>Total D20 Rolls: ${formatRolls(s.totalD20Rolls)}</p>
    <p>Total Modded D20 Rolls: ${s.totalModD20Rolls.length > 0
        ? formatD20RollsDisplay(s.totalModD20Rolls)
        : "No rolls yet."
      }</p>
    <p>Times Killed: ${s.timesKilled}</p>
    <p>Natural 1s: ${s.natural1s}</p>
    <p>Natural 20s: ${s.natural20s}</p>
    <p>Total Damage: ${combinedDamage}</p>
    <p>Total Healing: ${combinedHealing}</p>
    <p>Money Spent: ${s.moneySpent.toFixed(2)}</p>
  `;
  }
  else {
    panel.innerHTML = `
    <h4>Stats for ${nameToUse}:</h4>
    <p>Attacks Made: ${s.attacksMade}</p>
    <p>Ability Checks: ${s.abilityChecks}</p>
    <p>Saving Throws: ${s.savingThrows}</p>
     <p>Spells Cast: ${s.spellsCast}</p>
    <p>Initiative: ${s.initiativeRolls.length > 0
        ? formatD20RollsDisplay(s.initiativeRolls)
        : "No rolls yet."
      }</p>
    <p>Total D20 Rolls: ${formatRolls(s.totalD20Rolls)}</p>
    <p>Total Modded D20 Rolls: ${s.totalModD20Rolls.length > 0
        ? formatD20RollsDisplay(s.totalModD20Rolls)
        : "No rolls yet."
      }</p>
    <p>Times Killed: ${s.timesKilled}</p>
    <p>Natural 1s: ${s.natural1s}</p>
    <p>Natural 20s: ${s.natural20s}</p>
    <p>Total Damage: ${combinedDamage}</p>
    <p>Total Healing: ${combinedHealing}</p>
    <p>Money Spent: ${s.moneySpent.toFixed(2)}</p>
  `;
  }

  saveGameData();
}

function recalcAllStats(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  // Reset totals
  stats.natural1s = 0;
  stats.natural20s = 0;
  stats.attacksMade = stats.attackRolls.length;
  stats.abilityChecks = stats.abilityRolls.length;
  stats.savingThrows = stats.saveRolls.length;

  stats.totalD20Rolls = [];
  stats.totalModD20Rolls = [];  // keep as an array
  stats.totalDamage = 0;

  // Helper to process any roll array
  function processRollArray(arr, isAttack = false) {
    arr.forEach(r => {
      if (!r) return;
      r.moddedRoll = (r.roll || 0) + (r.modifier || 0);

      if (r.roll === 1) stats.natural1s++;
      if (r.roll === 20) stats.natural20s++;

      // ✅ FIXED: push, don’t add
      stats.totalD20Rolls.push(r.roll);
      stats.totalModD20Rolls.push({ roll: r.roll, modifier: r.modifier });

      if (isAttack) stats.totalDamage += parseFloat(r.damage) || 0;
    });
  }

  processRollArray(stats.attackRolls, true);
  processRollArray(stats.abilityRolls);
  processRollArray(stats.saveRolls);

  // Initiative: count 1s/20s only
  if (Array.isArray(stats.initiativeRolls)) {
    stats.initiativeRolls.forEach(r => {
      if (!r) return;
      r.modifier = r.modifier || 0;
      r.total = r.total !== undefined ? r.total : (r.roll || 0) + r.modifier;

      if (r.roll === 1) stats.natural1s++;
      if (r.roll === 20) stats.natural20s++;
    });
  }

  // Optional: also include spellResistanceRolls if desired
  if (Array.isArray(stats.spellResistanceRolls)) {
    stats.spellResistanceRolls.forEach(r => {
      if (!r) return;
      r.moddedRoll = (r.roll || 0) + (r.modifier || 0);
      stats.totalD20Rolls.push(r.roll);
      stats.totalModD20Rolls.push({ roll: r.roll, modifier: r.modifier });
      if (r.roll === 1) stats.natural1s++;
      if (r.roll === 20) stats.natural20s++;
    });
  }
}

function removeSaveFromSpell(casterName, spell, svIndex) {
  const sv = spell.saves[svIndex];
  if (!sv) return;

  const target = sv.target;
  const casterStats = gameData.characterStats[casterName];

  // Remove from caster spell saves
  spell.saves.splice(svIndex, 1);

  // Remove from target savesFromSpells if it exists
  if (target && target !== casterName) {
    const targetStats = gameData.characterStats[target];
    if (targetStats?.savesFromSpells) {
      targetStats.savesFromSpells = targetStats.savesFromSpells.filter(s => s !== sv);
      recalcCharacterStats(target);
    }
  }

  // Remove from caster self-targeting counts
  recalcCharacterStats(casterName);
  updateSideStats();
  renderSpellEditor(casterName);
}

function recalcCharacterStats(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  // Reset counters
  stats.natural1s = 0;
  stats.natural20s = 0;
  stats.attacksMade = stats.attackRolls.length;
  stats.abilityChecks = stats.abilityRolls.length;
  stats.savingThrows = stats.saveRolls.length;
  stats.concentrationChecks = stats.concentrationRolls.length;
  stats.totalSpellResistances = stats.spellResistanceRolls.length;
  stats.spellsCast = Array.isArray(stats.spellHistory) ? stats.spellHistory.length : 0;

  // Base roll arrays
  stats.totalD20Rolls = [];
  stats.totalModD20Rolls = [];

  // Reset all totals separately
  stats.totalNonSpellDamage = 0;
  stats.totalSpellDamage = 0;
  stats.totalNonSpellHealing = 0;
  stats.totalSpellHealing = 0;

  // --- Helper to process non-spell rolls ---
  const processRolls = (arr, includeMod = false, isDamage = false) => {
    arr.forEach(r => {
      if (!r) return;

      const roll = parseInt(r.roll) || 0;
      const mod = parseInt(r.modifier) || 0;
      const dmg = parseFloat(r.damage) || 0;

      if (roll === 1) stats.natural1s++;
      if (roll === 20) stats.natural20s++;

      stats.totalD20Rolls.push(roll);
      if (includeMod) stats.totalModD20Rolls.push({ roll, modifier: mod });

      if (isDamage) stats.totalNonSpellDamage += dmg;
    });
  };

  // Process attack/ability/save rolls
  processRolls(stats.attackRolls, true, true);
  processRolls(stats.abilityRolls, true);
  processRolls(stats.saveRolls, true);
  processRolls(stats.concentrationRolls, true);
  processRolls(stats.spellResistanceRolls, true);

  if (Array.isArray(stats.healingRolls)) {
    stats.healingRolls.forEach(h => {
      const heal = parseFloat(h.healing) || 0;
      stats.totalNonSpellHealing += heal;
    });
  }


  // --- Initiative: only count natural 1s/20s ---
  if (Array.isArray(stats.initiativeRolls)) {
    stats.initiativeRolls.forEach(r => {
      if (!r) return;
      if (r.roll === 1) stats.natural1s++;
      if (r.roll === 20) stats.natural20s++;
    });
  }

  // --- Process Spell History ---
  if (Array.isArray(stats.spellHistory)) {
    let totalSR = 0;
    stats.spellHistory.forEach(spell => {
      // Spell Resistances
      if (Array.isArray(spell.spellResistance)) {
        spell.spellResistance.forEach(a => {
          const roll = parseInt(a.roll) || 0;
          const mod = parseInt(a.modifier ?? a.casterLevel) || 0;

          if (roll === 1) stats.natural1s++;
          if (roll === 20) stats.natural20s++;

          stats.totalD20Rolls.push(roll);
          stats.totalModD20Rolls.push({ roll, modifier: mod });
        })
        totalSR += spell.spellResistance.length;
      }

      // Attacks from spell
      if (Array.isArray(spell.attacks)) {
        spell.attacks.forEach(a => {
          const roll = parseInt(a.roll) || 0;
          const mod = parseInt(a.modifier) || 0;
          const dmg = parseFloat(a.damage) || 0;

          if (roll === 1) stats.natural1s++;
          if (roll === 20) stats.natural20s++;

          stats.totalD20Rolls.push(roll);
          stats.totalModD20Rolls.push({ roll, modifier: mod });
          stats.totalSpellDamage += dmg;
        });

        stats.attacksMade += spell.attacks.length;
      }

      // Saves (self-targeted)
      if (Array.isArray(spell.saves)) {
        spell.saves.forEach(sv => {
          if (sv.target !== characterName) return;
          const roll = parseInt(sv.roll) || 0;
          const mod = parseInt(sv.modifier) || 0;

          if (roll === 1) stats.natural1s++;
          if (roll === 20) stats.natural20s++;

          stats.totalD20Rolls.push(roll);
          stats.totalModD20Rolls.push({ roll, modifier: mod });
          stats.savingThrows++;
        });
      }

      // Extra spell damage/healing
      if (spell.extra) {
        stats.totalSpellDamage += parseFloat(spell.extra.damage) || 0;
        stats.totalSpellHealing += parseFloat(spell.extra.healing) || 0;
      }
    });
    stats.totalSpellResistance = totalSR;
  }

  // --- Process saves that target this character ---
  if (!Array.isArray(stats.savesFromSpells)) stats.savesFromSpells = [];
  stats.savesFromSpells.forEach(sv => {
    const roll = parseInt(sv.roll) || 0;
    const mod = parseInt(sv.modifier) || 0;

    if (roll === 1) stats.natural1s++;
    if (roll === 20) stats.natural20s++;

    stats.totalD20Rolls.push(roll);
    stats.totalModD20Rolls.push({ roll, modifier: mod });
    stats.savingThrows++;
  });

  stats.totalDamage = stats.totalNonSpellDamage + stats.totalSpellDamage;
  stats.totalHealing = stats.totalNonSpellHealing + stats.totalSpellHealing;
}

function formatRolls(rolls) {
  if (!Array.isArray(rolls) || rolls.length === 0) return "—";

  // if rolls are simple numbers
  if (typeof rolls[0] === "number") {
    const total = rolls.reduce((sum, r) => sum + r, 0);
    return `${total} = ${rolls.join(" + ")}`;
  }

  return "Invalid rolls";
}

function formatD20RollsDisplay(rolls) {
  if (!rolls || rolls.length === 0) return "No rolls yet.";

  const parts = rolls.map(r => `(${r.roll} + ${r.modifier})`);
  const sum = rolls.reduce((acc, r) => acc + (r.roll + r.modifier), 0);
  return `${sum} = ${parts.join(" + ")}`;
}

function renderEditorStats(characterName) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  const editorContainer = document.getElementById("editor-container");
  if (!editorContainer) return;

  editorContainer.innerHTML = "";

  const sections = [
    { label: "Attack Rolls", key: "attack" },
    { label: "Ability Checks", key: "ability" },
    { label: "Saving Throws", key: "save" },
    { label: "Initiative Rolls", key: "initiative" }
  ];

  // ✅ Add Concentration Checks only for Pathfinder
  if (gameData.edition === "pathfinder") {
    sections.splice(3, 0, { label: "Concentration Checks", key: "concentration" });
  }

  sections.forEach(section => {
    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("roll-section");

    const header = document.createElement("h3");
    header.textContent = section.label;
    sectionDiv.appendChild(header);

    const rolls = stats[`${section.key}Rolls`];

    rolls.forEach((rollObj, i) => {
      const rollDiv = document.createElement("div");
      rollDiv.classList.add("roll-entry");

      // --- D20 LABEL ---
      const rollLabel = document.createElement("label");
      rollLabel.textContent = "D20:";
      rollDiv.appendChild(rollLabel);

      // Roll input
      const rollInput = document.createElement("input");
      rollInput.type = "number";
      rollInput.value = rollObj.roll;
      rollInput.min = 1;
      rollInput.max = 20;
      rollInput.addEventListener("change", () => {
        rollObj.roll = parseInt(rollInput.value) || 0;

        // If initiative, keep the total field up to date
        if (section.key === "initiative") {
          rollObj.modifier = rollObj.modifier || 0;
          rollObj.total = rollObj.roll + rollObj.modifier;

          // Only sync NPC # if it's an NPC
          if (characterName.startsWith("NPC ")) {
            renderInitiative();
          } else {
            stats.initiative = rollObj.total; // For PCs
            renderInitiative();
          }
        }

        recalcCharacterStats(characterName);
        updateSideStats();
      });
      rollDiv.appendChild(rollInput);

      // --- MOD LABEL ---
      const modLabel = document.createElement("label");
      modLabel.textContent = "Mod:";
      rollDiv.appendChild(modLabel);

      // Modifier input for all roll types except initiative
      const modInput = document.createElement("input");
      modInput.type = "number";
      modInput.value = rollObj.modifier || 0;
      modInput.addEventListener("change", () => {
        rollObj.modifier = parseInt(modInput.value) || 0;

        // If initiative, update its total too
        if (section.key === "initiative") {
          rollObj.total = (rollObj.roll || 0) + rollObj.modifier;

          if (characterName.startsWith("NPC ")) {
            renderInitiative();
          } else {
            stats.initiative = rollObj.total;
            renderInitiative();
          }
        }

        recalcCharacterStats(characterName);
        updateSideStats();
      });
      rollDiv.appendChild(modInput);

      // Damage input only for attacks
      if (section.key === "attack") {
        const dmgLabel = document.createElement("label");
        dmgLabel.textContent = "Damage:";
        rollDiv.appendChild(dmgLabel);

        const damageInput = document.createElement("input");
        damageInput.type = "number";
        damageInput.value = rollObj.damage || 0;
        damageInput.addEventListener("change", () => {
          rollObj.damage = parseFloat(damageInput.value) || 0;
          recalcCharacterStats(characterName);
          updateSideStats();
        });
        rollDiv.appendChild(damageInput);
      }

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        stats[`${section.key}Rolls`].splice(i, 1);
        recalcCharacterStats(characterName);
        renderEditorStats(characterName);
        updateSideStats();
      });
      rollDiv.appendChild(removeBtn);

      // Add to Initiative Order button (only for initiatives)
      if (section.key === "initiative") {
        const addToOrderBtn = document.createElement("button");
        addToOrderBtn.textContent = "Add to Order";

        // Only show if this roll isn't visible in the initiative order
        if (rollObj.isVisibleInOrder) {
          addToOrderBtn.style.display = "none";
        }

        addToOrderBtn.addEventListener("click", () => {
          rollObj.isVisibleInOrder = true; // Mark as visible
          renderInitiative(); // Refresh initiative order
          renderEditorStats(characterName); // Refresh editor display
        });

        rollDiv.appendChild(addToOrderBtn);
      }

      sectionDiv.appendChild(rollDiv);
    });

    // Add new roll button
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Roll";
    addBtn.addEventListener("click", () => {
      const newRoll = { roll: 1, modifier: 0 };
      if (section.key === "initiative") {
        newRoll.total = newRoll.roll + newRoll.modifier;
        newRoll.isVisibleInOrder = false;
      }
      if (section.key === "attack") newRoll.damage = 0;

      stats[`${section.key}Rolls`].push(newRoll);
      recalcCharacterStats(characterName);
      renderEditorStats(characterName);
      updateSideStats();
    });
    sectionDiv.appendChild(addBtn);

    editorContainer.appendChild(sectionDiv);
  });

  // -------------------- OTHER STATS SECTION --------------------
  const otherStatsDiv = document.createElement("div");
  otherStatsDiv.classList.add("other-stats-section");

  // --- Money Spent ---
  const moneyLabel = document.createElement("h3");
  moneyLabel.textContent = "Money Spent:";
  otherStatsDiv.appendChild(moneyLabel);

  const moneyInput = document.createElement("input");
  moneyInput.type = "number";
  moneyInput.step = "0.01";
  moneyInput.value = stats.moneySpent?.toFixed(2) ?? 0;
  moneyInput.addEventListener("input", () => {
    stats.moneySpent = parseFloat(moneyInput.value) || 0;
    updateSideStats();
  });
  otherStatsDiv.appendChild(moneyInput);

  // --- Damage Taken (non-spell) ---
  const dmgLabel = document.createElement("h3");
  dmgLabel.textContent = "MISC Damage:";
  otherStatsDiv.appendChild(dmgLabel);

  const dmgInput = document.createElement("input");
  dmgInput.type = "number";
  dmgInput.value = stats.attackDamage ?? 0;
  dmgInput.addEventListener("input", () => {
    stats.attackDamage = parseFloat(dmgInput.value) || 0;
    updateSideStats();
  });
  otherStatsDiv.appendChild(dmgInput);

  // --- Healing Done ---
  const healLabel = document.createElement("h3");
  healLabel.textContent = "MISC Healing:";
  otherStatsDiv.appendChild(healLabel);

  const healInput = document.createElement("input");
  healInput.type = "number";
  healInput.value = stats.healingDone ?? 0;
  healInput.addEventListener("input", () => {
    stats.healingDone = parseFloat(healInput.value) || 0;
    updateSideStats();
  });
  otherStatsDiv.appendChild(healInput);

  // --- Times Killed ---
  const killedLabel = document.createElement("h3");
  killedLabel.textContent = "Times Killed:";
  otherStatsDiv.appendChild(killedLabel);

  const killedInput = document.createElement("input");
  killedInput.type = "number";
  killedInput.value = stats.timesKilled ?? 0;
  killedInput.addEventListener("input", () => {
    stats.timesKilled = parseInt(killedInput.value) || 0;
    updateSideStats();
  });
  otherStatsDiv.appendChild(killedInput);

  editorContainer.appendChild(otherStatsDiv);

  renderSpellEditor(characterName);
}

function removeRollEntry(characterName, type, index) {
  const stats = gameData.characterStats[characterName];
  if (!stats) return;

  let list;
  switch (type) {
    case "attack": list = stats.attackRolls; break;
    case "ability": list = stats.abilityRolls; break;
    case "save": list = stats.saveRolls; break;
    case "initiative": list = stats.initiativeRolls; break;
    default: return;
  }

  list.splice(index, 1);

  // Recount natural 1s/20s
  stats.natural1s = 0;
  stats.natural20s = 0;
  ["attackRolls", "abilityRolls", "saveRolls", "initiativeRolls"].forEach(typeKey => {
    if (Array.isArray(stats[typeKey])) {
      stats[typeKey].forEach(r => {
        if (r.roll === 1) stats.natural1s++;
        if (r.roll === 20) stats.natural20s++;
      });
    }
  });

  renderEditorStats(characterName);
  updateSideStats();
}

// -------------------- STATS DROPDOWNS --------------------
function populateStatsSelects() {
  const statsSelect = document.getElementById("stats-character-select");
  const editorSelect = document.getElementById("editor-character-select");

  [statsSelect, editorSelect].forEach(select => {
    if (!select) return;
    select.innerHTML = "";
    gameData.characters.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  });

  if (statsSelect) {
    statsSelect.onchange = () => {
      selectedCharacter = statsSelect.value;
      updateSideStats();
      renderStatsActions(selectedCharacter);
      highlightSelectedButton(selectedCharacter);
    };
  }

  if (editorSelect) {
    editorSelect.onchange = () => {
      selectedCharacter = editorSelect.value;  // Update global selectedCharacter
      renderEditorStats(editorSelect.value);
      updateSideStats(); // optional: update right-side stats panel
      highlightSelectedButton(selectedCharacter); // optional: highlight button
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
})