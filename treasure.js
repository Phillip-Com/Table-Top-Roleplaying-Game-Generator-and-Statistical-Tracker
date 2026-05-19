// === BASIC UTILS ===
        function rollDice(dice) {
          // e.g., "3d6" or "2d4 * 100"
          const [count, sides] = dice.match(/(\d+)d(\d+)/).slice(1).map(Number);
          let total = 0;
          for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
          return total;
        }

        function combineDuplicates(array) {
          const combined = {};
          for (const item of array) {
            combined[item] = (combined[item] || 0) + 1;
          }
          return combined;
        }

        function rollPercent() {
          return Math.floor(Math.random() * 100) + 1;
        }

        // === COIN FORMATTER ===
        function formatCoins({ cp = 0, sp = 0, gp = 0, pp = 0 }) {
          let str = "";
          if (cp) str += `COPPER PIECES: ${cp} <br>`;
          if (sp) str += `SILVER PIECES: ${sp} <br>`;
          if (gp) str += `GOLD PIECES: ${gp} <br>`;
          if (pp) str += `PLATINUM PIECES: ${pp} <br>`;
          return str;
        }

        // === INDIVIDUAL TREASURE TABLES (2014 DMG p.136–139) ===
        const IndividualTreasureTables = {
          1: [
            { min: 1, max: 30, coins: () => ({ cp: rollDice("5d6") * 10 }) },
            { min: 31, max: 60, coins: () => ({ sp: rollDice("4d6") * 10 }) },
            { min: 61, max: 70, coins: () => ({ ep: rollDice("3d6") * 10 }) },
            { min: 71, max: 95, coins: () => ({ gp: rollDice("3d6") * 10 }) },
            { min: 96, max: 100, coins: () => ({ pp: rollDice("1d6") * 10 }) },
          ],
          2: [
            { min: 1, max: 30, coins: () => ({ cp: rollDice("4d6") * 100, sp: rollDice("1d6") * 50 }) },
            { min: 31, max: 60, coins: () => ({ sp: rollDice("6d6") * 10 }) },
            { min: 61, max: 70, coins: () => ({ sp: rollDice("3d6") * 50, gp: rollDice("2d6") * 10 }) },
            { min: 71, max: 95, coins: () => ({ gp: rollDice("4d6") * 10 }) },
            {min: 96, max: 100, coins: () => ({ gp: rollDice("2d6") * 10, pp: rollDice("3d6") }) },
          ],
          3: [
            { min: 1, max: 20, coins: () => ({ sp: rollDice("4d6") * 100, gp: rollDice("1d6") * 100 }) },
            { min: 21, max: 35, coins: () => ({ sp: rollDice("1d6") * 500 }) },
            { min: 36, max: 75, coins: () => ({ gp: rollDice("2d6") * 100, pp: rollDice("1d6") * 10 }) },
            { min: 76, max: 100, coins: () => ({ gp: rollDice("2d6") * 100, pp: rollDice("2d6") * 10 }) },
          ],
          4: [
            { min: 1, max: 15, coins: () => ({ sp: rollDice("2d6") * 1000, gp: rollDice("8d6") * 100 }) },
            { min: 16, max: 55, coins: () => ({ gp: rollDice("1d6") * 1000, pp: rollDice("1d6") * 100 }) },
            { min: 56, max: 100, coins: () => ({ gp: rollDice("1d6") * 1000, pp: rollDice("2d6") * 100 }) },
          ],
        };

        // === TREASURE HOARD BASE GENERATION (2014 DMG p.137–139) ===
        const HoardBaseCoins = {
          1: () => ({ cp: rollDice("6d6") * 100, sp: rollDice("3d6") * 100, gp: rollDice("2d6") * 10 }),
          2: () => ({ cp: rollDice("2d6") * 1000, sp: rollDice("2d6") * 100, gp: rollDice("6d6") * 100, pp: rollDice("3d6") * 10 }),
          3: () => ({ gp: rollDice("4d6") * 1000, pp: rollDice("5d6") * 10 }),
          4: () => ({ gp: rollDice("12d6") * 1000, pp: rollDice("8d6") * 100 }),
        };

        const HoardGemsArtItemTable = {
          1: [
            {min: 1, max: 6, reward: () => ({value: "2d6 10 gp gems", items: ""})},
            {min: 7, max: 16, reward: () => ({value: "2d4 25 gp art objects", items: ""})},
            {min: 17, max: 26, reward: () => ({value: "2d6 50 gp gems", items: ""})},
            {min: 27, max: 36, reward: () => ({value: "2d6 10 gp gems", items: ""})},
            {min: 37, max: 44, reward: () => ({value: "2d4 25 gp art objects", items: "1d6 A"})},
            {min: 45, max: 52, reward: () => ({value: "2d6 50 gp gems", items: "1d6 A"})},
            {min: 53, max: 60, reward: () => ({value: "2d6 10 gp gems", items: "1d6 A"})},
            {min: 61, max: 65, reward: () => ({value: "2d6 10 gp gems", items: "1d4 B"})},
            {min: 66, max: 70, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 B"})},
            {min: 71, max: 75, reward: () => ({value: "2d6 50 gp gems", items: "1d4 B"})},
            {min: 76, max: 78, reward: () => ({value: "2d6 10 gp gems", items: "1d4 C"})},
            {min: 79, max: 80, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 C"})},
            {min: 81, max: 85, reward: () => ({value: "2d6 50 gp gems", items: "1d4 C"})},
            {min: 86, max: 92, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 F"})},
            {min: 93, max: 97, reward: () => ({value: "2d6 50 gp gems", items: "1d4 F"})},
            {min: 98, max: 99, reward: () => ({value: "2d4 25 gp art objects", items: "1 G"})},
            {min: 100, max: 100, reward: () => ({value: "2d6 50 gp gems", items: "1 G"})},
          ],
          2: [
            {min: 1, max: 4, reward: () => ({value: "", items: ""})},
            {min: 5, max: 10, reward: () => ({value: "2d4 25 gp art objects", items: ""})},
            {min: 11, max: 16, reward: () => ({value: "3d6 50 gp gems", items: ""})},
            {min: 17, max: 22, reward: () => ({value: "3d6 100 gp gems", items: ""})},
            {min: 23, max: 28, reward: () => ({value: "2d4 250 gp art objects", items: ""})},
            {min: 29, max: 32, reward: () => ({value: "2d4 25 gp art objects", items: "1d6 A"})},
            {min: 33, max: 36, reward: () => ({value: "3d6 50 gp gems", items: "1d6 A"})},
            {min: 37, max: 40, reward: () => ({value: "3d6 100 gp gems", items: "1d6 A"})},
            {min: 41, max: 44, reward: () => ({value: "2d4 250 gp art objects", items: "1d6 A"})},
            {min: 45, max: 49, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 B"})},
            {min: 50, max: 54, reward: () => ({value: "3d6 50 gp gems", items: "1d4 B"})},
            {min: 55, max: 59, reward: () => ({value: "3d6 100 gp gems", items: "1d4 B"})},
            {min: 60, max: 63, reward: () => ({value: "2d4 250 gp art object", items: "1d4 B"})},
            {min: 64, max: 66, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 C"})},
            {min: 67, max: 69, reward: () => ({value: "3d6 50 gp gems", items: "1d4 C"})},
            {min: 70, max: 72, reward: () => ({value: "3d6 100 gp gems", items: "1d4 C"})},
            {min: 73, max: 74, reward: () => ({value: "2d4 250 gp art object", items: "1d4 C"})},
            {min: 75, max: 76, reward: () => ({value: "2d4 25 gp art objects", items: "1 D"})},
            {min: 77, max: 78, reward: () => ({value: "3d6 50 gp gems", items: "1 D"})},
            {min: 79, max: 79, reward: () => ({value: "3d6 100 gp gems", items: "1 D"})},
            {min: 80, max: 80, reward: () => ({value: "2d4 250 gp art objects", items: "1 D"})},
            {min: 81, max: 84, reward: () => ({value: "2d4 25 gp art objects", items: "1d4 F"})},
            {min: 85, max: 88, reward: () => ({value: "3d6 50 gp gems", items: "1d4 F"})},
            {min: 89, max: 91, reward: () => ({value: "3d6 100 gp gems", items: "1d4 F"})},
            {min: 92, max: 94, reward: () => ({value: "2d4 250 gp art objects", items: "1d4 F"})},
            {min: 95, max: 96, reward: () => ({value: "3d6 100 gp gems", items: "1d4 G"})},
            {min: 97, max: 98, reward: () => ({value: "2d4 250 gp art objects", items: "1d4 G"})},
            {min: 99, max: 99, reward: () => ({value: "3d6 100 gp gems", items: "1 H"})},
            {min: 100, max: 100, reward: () => ({value: "2d4 250 gp art objects", items: "1 H"})},
          ],
          3: [
            {min: 1, max: 3, reward: () => ({value: "", items: ""})},
            {min: 4, max: 6, reward: () => ({value: "2d4 250 gp art objects", items: ""})},
            {min: 7, max: 9, reward: () => ({value: "2d4 750 gp art objects", items: ""})},
            {min: 10, max: 12, reward: () => ({value: "3d6 500 gp gems", items: ""})},
            {min: 13, max: 15, reward: () => ({value: "3d6 1000 gp gems", items: ""})},
            {min: 16, max: 19, reward: () => ({value: "2d4 250 gp art objects", items: ["1d4 A", "1d6 B"]})},
            {min: 20, max: 23, reward: () => ({value: "2d4 750 gp gems", items: ["1d4 A", "1d6 B"]})},
            {min: 24, max: 26, reward: () => ({value: "3d6 500 gp gems", items: ["1d4 A", "1d6 B"]})},
            {min: 27, max: 29, reward: () => ({value: "3d6 1000 gp gems", items: ["1d4 A", "1d6 B"]})},
            {min: 30, max: 35, reward: () => ({value: "2d4 250 gp art objects", items: "1d6 C"})},
            {min: 36, max: 40, reward: () => ({value: "2d4 750 gp art objects", items: "1d6 C"})},
            {min: 41, max: 45, reward: () => ({value: "3d6 500 gp gems", items: "1d6 C"})},
            {min: 46, max: 50, reward: () => ({value: "3d6 1000 gp gems", items: "1d6 C"})},
            {min: 51, max: 54, reward: () => ({value: "2d4 250 gp art objects", items: "1d4 D"})},
            {min: 55, max: 58, reward: () => ({value: "2d4 750 gp art objects", items: "1d4 D"})},
            {min: 59, max: 62, reward: () => ({value: "3d6 500 gp gems", items: "1d4 D"})},
            {min: 63, max: 66, reward: () => ({value: "3d6 1000 gp gems", items: "1d4 D"})},
            {min: 67, max: 68, reward: () => ({value: "2d4 250 gp art objects", items: "1 E"})},
            {min: 69, max: 70, reward: () => ({value: "2d4 750 gp art objects", items: "1 E"})},
            {min: 71, max: 72, reward: () => ({value: "3d6 500 gp gems", items: "1 E"})},
            {min: 73, max: 74, reward: () => ({value: "3d6 1000 gp gems", items: "1 E"})},
            {min: 75, max: 76, reward: () => ({value: "2d4 250 gp art objects", items: ["1 F", "1d4 G"]})},
            {min: 77, max: 78, reward: () => ({value: "2d4 750 gp art objects", items: ["1 F", "1d4 G"]})},
            {min: 79, max: 80, reward: () => ({value: "3d6 500 gp gems", items: ["1 F", "1d4 G"]})},
            {min: 81, max: 82, reward: () => ({value: "3d6 1000 gp gems", items: ["1 F", "1d4 G"]})},
            {min: 83, max: 85, reward: () => ({value: "2d4 250 gp art objects", items: "1d4 H"})},
            {min: 86, max: 88, reward: () => ({value: "2d4 750 gp art objects", items: "1d4 H"})},
            {min: 89, max: 90, reward: () => ({value: "3d6 500 gp gems", items: "1d4 H"})},
            {min: 91, max: 92, reward: () => ({value: "3d6 1000 gp gems", items: "1d4 H"})},
            {min: 93, max: 96, reward: () => ({value: "2d4 250 gp art objects", items: "1 I"})},
            {min: 95, max: 97, reward: () => ({value: "2d4 750 gp art objects", items: "1 I"})},
            {min: 97, max: 98, reward: () => ({value: "3d6 500 gp gems", items: "1 I"})},
            {min: 99, max: 100, reward: () => ({calue: "3d6 1000 gp gems", items: "1 I"})},
          ],
          4: [
            {min: 1, max: 2, reward: () => ({value: "", items: ""})},
            {min: 3, max: 5, reward: () => ({value: "3d6 1000 gp gems", items: "1d8 C"})},
            {min: 6, max: 8, reward: () => ({value: "1d10 2500 gp art objects", items: "1d8 C"})},
            {min: 9, max: 11, reward: () => ({value: "1d4 7500 gp art objects", items: "1d8 C"})},
            {min: 12, max: 14, reward: () => ({value: "1d8 5000 gp gems", items: "1d8 C"})},
            {min: 15, max: 22, reward: () => ({value: "3d6 1000 gp gems", items: "1d6 D"})},
            {min: 23, max: 30, reward: () => ({value: "1d10 2500 gp art objects", items: "1d6 D"})},
            {min: 31, max: 38, reward: () => ({value: "1d4 7500 gp art objects", items: "1d6 D"})},
            {min: 39, max: 46, reward: () => ({value: "1d8 5000 gp gems", items: "1d6 D"})},
            {min: 47, max: 52, reward: () => ({value: "3d6 1000 gp gems", items: "1d6 E"})},
            {min: 53, max: 58, reward: () => ({value: "1d10 2500 gp art objects", items: "1d6 E"})},
            {min: 59, max: 63, reward: () => ({value: "1d4 7500 gp art objects", items: "1d6 E"})},
            {min: 64, max: 68, reward: () => ({value: "1d8 5000 gp gems", items: "1d6 E"})},
            {min: 69, max: 69, reward: () => ({value: "3d6 1000 gp gems", items: "1d4 G"})},
            {min: 70, max: 70, reward: () => ({value: "1d10 2500 gp art objects", items: "1d4 G"})},
            {min: 71, max: 71, reward: () => ({value: "1d4 7500 gp art objects", items: "1d4 G"})},
            {min: 72, max: 72, reward: () => ({value: "1d8 5000 gp gems", items: "1d4 G"})},
            {min: 73, max: 74, reward: () => ({value: "3d6 1000 gp gems", items: "1d4 H"})},
            {min: 75, max: 76, reward: () => ({value: "1d10 2500 gp art objects", items: "1d4 H"})},
            {min: 77, max: 78, reward: () => ({value: "1d4 7500 gp art objects", items: "1d4 H"})},
            {min: 79, max: 80, reward: () => ({value: "1d8 5000 gp gems", items: "1d4 H"})},
            {min: 81, max: 85, reward: () => ({value: "3d6 1000 gp gems", items: "1d4 I"})},
            {min: 86, max: 90, reward: () => ({value: "1d10 2500 gp art objects", items: "1d4 I"})},
            {min: 91, max: 95, reward: () => ({value: "1d4 7500 gp art objects", items: "1d4 I"})},
            {min: 96, max: 100, reward: () => ({value: "1d8 5000 gp art objects", items: "1d4 I"})},
          ],
        }

        const HoardMagicItem = {
          A: [
            { min: 1, max: 50, item: () => ({name: "Potion of Healing", keyword: ["basic"], attunement: ""})},
            { min: 51, max: 60, item: () => ({name: "Spell Scroll", keyword: ["scroll", "cantrip"], attunement: ""})},
            { min: 61, max: 70, item: () => ({name: "Potion of Climbing", keyword: ["potion"], attunement: ""})},
            { min: 71, max: 90, item: () => ({name: "Spell Scroll", keyword: ["scroll", "1st level"], attunement: ""})},
            { min: 91, max: 94, item: () => ({name: "Spell Scroll", keyword: ["scroll", "2nd level"], attunement: ""})},
            { min: 95, max: 98, item: () => ({name: "Potion of Healing", keyword: ["greater"], attunement: ""})},
            { min: 99, max: 99, item: () => ({name: "Bag of Holding", keyword: ["wondrous"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Driftglobe", keyword: ["wondrous"], attunement: ""})},
          ],
          B: [
            { min: 1, max: 15, item: () => ({name: "Potion of Healing", keyword: ["greater"], attunement: ""})},
            { min: 16, max: 22, item: () => ({name: "Potion of Fire Breath", keyword: ["potion"], attunement: ""})},
            { min: 23, max: 29, item: () => ({name: "Potion of Resistance", keyword: ["potion", "resistance"], attunement: ""})},
            { min: 30, max: 34, item: () => ({name: "Ammunition +1", keyword: ["weapon", "ammunition"], attunement: ""})},
            { min: 35, max: 39, item: () => ({name: "Potion of Animal Friendship", keyword: ["potion"], attunement: ""})},
            { min: 40, max: 44, item: () => ({name: "Potion of Hill Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 45, max: 49, item: () => ({name: "Potion of Growth", keyword: ["potion"], attunement: ""})},
            { min: 50, max: 54, item: () => ({name: "Potion of Water Breathing", keyword: ["potion"], attunement: ""})},
            { min: 55, max: 59, item: () => ({name: "Spell Scroll", keyword: ["scroll", "2nd level"], attunement: ""})},
            { min: 60, max: 64, item: () => ({name: "Spell Scroll", keyword: ["scroll", "3rd level"], attunement: ""})},
            { min: 65, max: 67, item: () => ({name: "Bag of Holding", keyword: ["wondrous"], attunement: ""})},
            { min: 68, max: 70, item: () => ({name: "Keoghtom's Ointment", keyword: ["dose","keoghtom's"], attunement: ""})},
            { min: 71, max: 73, item: () => ({name: "Oil of Slipperiness", keyword: ["potion"], attunement: ""})},
            { min: 74, max: 75, item: () => ({name: "Dust of Disappearance", keyword: ["wondrous"], attunement: ""})},
            { min: 76, max: 77, item: () => ({name: "Dust of Dryness", keyword: ["wondrous"], attunement: ""})},
            { min: 78, max: 79, item: () => ({name: "Dust of Sneezing and Choking", keyword: ["wondrous"], attunement: ""})},
            { min: 80, max: 81, item: () => ({name: "Elemental Gem", keyword: ["wondrous"], attunement: ""})},
            { min: 82, max: 83, item: () => ({name: "Philter of Love", keyword: ["potion"], attunement: ""})},
            { min: 84, max: 84, item: () => ({name: "Alchemy Jug", keyword: ["wondrous"], attunement: ""})},
            { min: 85, max: 85, item: () => ({name: "Cap of Water Breathing", keyword: ["wondrous"], attunement: ""})},
            { min: 86, max: 86, item: () => ({name: "Cloak of the Manta Ray", keyword: ["wondrous"], attunement: ""})},
            { min: 87, max: 87, item: () => ({name: "Driftglobe", keyword: ["wondrous"], attunement: ""})},
            { min: 88, max: 88, item: () => ({name: "Goggle of Night", keyword: ["wondrous"], attunement: ""})},
            { min: 89, max: 89, item: () => ({name: "Helm of Comprehending Languages", keyword: ["wondrous"], attunement: ""})},
            { min: 90, max: 90, item: () => ({name: "Immovable Rod", keyword: ["rod"], attunement: ""})},
            { min: 91, max: 91, item: () => ({name: "Lantern of Revealing", keyword: ["wondrous"], attunement: ""})},
            { min: 92, max: 92, item: () => ({name: "Mariner's Armor", keyword: ["armor"], attunement: ""})},
            { min: 93, max: 93, item: () => ({name: "Mithral Armor", keyword: ["armor", "medium", "heavy"], attunement: ""})},
            { min: 94, max: 94, item: () => ({name: "Potion of Poison", keyword: ["potion"], attunement: ""})},
            { min: 95, max: 95, item: () => ({name: "Ring of Swimming", keyword: ["ring"], attunement: ""})},
            { min: 96, max: 96, item: () => ({name: "Robe of Useful Items", keyword: ["wondrous"], attunement: ""})},
            { min: 97, max: 97, item: () => ({name: "Rope of Climbing", keyword: ["wondrous"], attunement: ""})},
            { min: 98, max: 98, item: () => ({name: "Saddle of the Cavalier", keyword: ["wondrous"], attunement: ""})},
            { min: 99, max: 99, item: () => ({name: "Wand of Magic Detection", keyword: ["wand"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Wand of Secrets", keyword: ["wand"], attunement: ""})},
          ],
          C: [
            { min: 1, max: 15, item: () => ({name: "Potion of Healing", keyword: ["superior"], attunement: ""})},
            { min: 16, max: 22, item: () => ({name: "Spell Scroll", keyword: ["scroll", "4th level"], attunement: ""})},
            { min: 23, max: 27, item: () => ({name: "Ammunition +2", keyword: ["ammunition"], attunement: ""})},
            { min: 28, max: 32, item: () => ({name: "Potion of Clairvoyance", keyword: ["potion"], attunement: ""})},
            { min: 33, max: 37, item: () => ({name: "Potion of Diminution", keyword: ["potion"], attunement: ""})},
            { min: 38, max: 42, item: () => ({name: "Potion of Gaseous Form", keyword: ["potion"], attunement: ""})},
            { min: 43, max: 47, item: () => ({name: "Potion of Frost Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 48, max: 52, item: () => ({name: "Potion of Stone Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 53, max: 57, item: () => ({name: "Potion of Heroism", keyword: ["potion"], attunement: ""})},
            { min: 58, max: 62, item: () => ({name: "Potion of Invulnerability", keyword: ["potion"], attunement: ""})},
            { min: 63, max: 67, item: () => ({name: "Potion of Mind Reading", keyword: ["potion"], attunement: ""})},
            { min: 68, max: 72, item: () => ({name: "Spell Scroll", keyword: ["scroll", "5th level"], attunement: ""})},
            { min: 73, max: 75, item: () => ({name: "Elixir of Health", keyword: ["potion"], attunement: ""})},
            { min: 76, max: 78, item: () => ({name: "Oil of Etherealness", keyword: ["potion"], attunement: ""})},
            { min: 79, max: 81, item: () => ({name: "Potion of Fire Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 82, max: 84, item: () => ({name: "Quaal's Feather Token", keyword: ["feather token"], attunement: ""})},
            { min: 85, max: 87, item: () => ({name: "Scroll of Protection", keyword: ["creature"], attunement: ""})}, 
            { min: 88, max: 89, item: () => ({name: "Bag of Beans", keyword: ["dose","bag of beans"], attunement: ""})},
            { min: 90, max: 91, item: () => ({name: "Bead of Force", keyword: ["wondrous"], attunement: ""})},
            { min: 92, max: 92, item: () => ({name: "Chime of Opening", keyword: ["wondrous"], attunement: ""})},
            { min: 93, max: 93, item: () => ({name: "Decanter of Endless Water", keyword: ["wondrous"], attunement: ""})},
            { min: 94, max: 94, item: () => ({name: "Eyes of Minute Seeing", keyword: ["wondrous"], attunement: ""})},
            { min: 95, max: 95, item: () => ({name: "Folding Boat", keyword: ["wondrous"], attunement: ""})},
            { min: 96, max: 96, item: () => ({name: "Heward's Handy Haversack", keyword: ["wondrous"], attunement: ""})},
            { min: 97, max: 97, item: () => ({name: "Horseshoes of Speed", keyword: ["wondrous"], attunement: ""})},
            { min: 98, max: 98, item: () => ({name: "Necklace of Fireballs", keyword: ["wondrous"], attunement: ""})},
            { min: 99, max: 99, item: () => ({name: "Periapt of Health", keyword: ["wondrous"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Sending Stones", keyword: ["wondrous"], attunement: ""})},
          ],
          D: [
            { min: 1, max: 20, item: () => ({name: "Potion of Healing", keyword: ["supreme"], attunement: ""})},
            { min: 21, max: 30, item: () => ({name: "Potion of Invisibility", keyword: ["potion"], attunement: ""})},
            { min: 31, max: 40, item: () => ({name: "Potion of Speed", keyword: ["potion"], attunement: ""})},
            { min: 41, max: 50, item: () => ({name: "Spell Scroll", keyword: ["scroll", "6th level"], attunement: ""})},
            { min: 51, max: 57, item: () => ({name: "Spell Scroll", keyword: ["scroll", "7th level"], attunement: ""})},
            { min: 58, max: 62, item: () => ({name: "Ammunition +3", keyword: ["ammunition"], attunement: ""})},
            { min: 63, max: 67, item: () => ({name: "Oil of Sharpness", keyword: ["potion"], attunement: ""})},
            { min: 68, max: 72, item: () => ({name: "Potion of Flying", keyword: ["potion"], attunement: ""})},
            { min: 73, max: 77, item: () => ({name: "Potion of Cloud Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 78, max: 82, item: () => ({name: "Potion of Longevity", keyword: ["potion"], attunement: ""})},
            { min: 83, max: 87, item: () => ({name: "Potion of Vitality", keyword: ["potion"], attunement: ""})},
            { min: 88, max: 92, item: () => ({name: "Spell Scroll", keyword: ["scroll", "8th level"], attunement: ""})},
            { min: 93, max: 95, item: () => ({name: "Horseshoes of a Zephyr", keyword: ["wondrous"], attunement: ""})},
            { min: 96, max: 98, item: () => ({name: "Nolzur's Marvelous Pigments", keyword: ["wondrous"], attunement: ""})},
            { min: 99, max: 99, item: () => ({name: "Bag of Devouring", keyword: ["wondrous"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Portable Hole", keyword: ["wondrous"], attunement: ""})},
          ],
          E: [
            { min: 1, max: 30, item: () => ({name: "Spell Scroll", keyword: ["scroll", "8th level"], attunement: ""})},
            { min: 31, max: 55, item: () => ({name: "Potion of Storm Giant Strength", keyword: ["potion"], attunement: ""})},
            { min: 56, max: 70, item: () => ({name: "Potion of Healing", keyword: ["Supreme"], attunement: ""})},
            { min: 71, max: 85, item: () => ({name: "Spell Scroll", keyword: ["scroll", "9th level"], attunement: ""})},
            { min: 86, max: 93, item: () => ({name: "Universal Solvent", keyword: ["wondrous"], attunement: ""})},
            { min: 94, max: 98, item: () => ({name: "Arrow of Slaying", keyword: ["arrow","scroll of protection"], attunement: ""})},
            { min: 99, max: 100, item: () => ({name: "Sovereign Glue", keyword: ["wondrous"], attunement: ""})},
          ],
          F: [
            { min: 1, max: 15, item: () => ({name: "Weapon +1", keyword: ["weapon","any"], attunement: ""})},
            { min: 16, max: 18, item: () => ({name: "Shield +1", keyword: ["shield"], attunement: ""})},
            { min: 19, max: 21, item: () => ({name: "Sentinel Shield", keyword: ["shield"], attunement: ""})},
            { min: 22, max: 23, item: () => ({name: "Amulet of Proof Against Detection and Location", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 24, max: 25, item: () => ({name: "Boots of Elvenkind", keyword: ["wondrous"], attunement: ""})},
            { min: 26, max: 27, item: () => ({name: "Boots of Striding and Springing", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 28, max: 29, item: () => ({name: "Bracers of Archery", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 30, max: 31, item: () => ({name: "Brooch of Shielding", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 32, max: 33, item: () => ({name: "Broom of Flying", keyword: ["wondrous"], attunement: ""})},
            { min: 34, max: 35, item: () => ({name: "Cloak of Elvenkind", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 36, max: 37, item: () => ({name: "Cloak of Protection", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 38, max: 39, item: () => ({name: "Gauntlets of Ogre Power", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 40, max: 41, item: () => ({name: "Hat of Disquise", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 42, max: 43, item: () => ({name: "Javelin of Lightning", keyword: ["javelin"], attunement: ""})},
            { min: 44, max: 45, item: () => ({name: "Pearl of Power", keyword: ["wondrous"], attunement: ". [requires attunement by a Spellcaster]"})},
            { min: 46, max: 47, item: () => ({name: "Rod of the Pact Keeper +1", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]"})},
            { min: 48, max: 49, item: () => ({name: "Slippers of Spider Climbing", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 50, max: 51, item: () => ({name: "Staff of the Adder", keyword: ["staff"], attunement: ", [requires attunement by a Cleric, Druid, or Warlock]"})},
            { min: 52, max: 53, item: () => ({name: "Staff of the Python", keyword: ["staff"], attunement: ", [requires attunement by a Cleric, Druid, or Warlock]"})},
            { min: 54, max: 55, item: () => ({name: "Sword of Vengeance", keyword: ["weapon","bladed"], attunement: ", [requires attunement]"})},
            { min: 56, max: 57, item: () => ({name: "Trident of Fish Command", keyword: ["trident"], attunement: ", [requires attunement]"})},
            { min: 58, max: 59, item: () => ({name: "Wand of Magic Missiles", keyword: ["wand"], attunement: ""})},
            { min: 60, max: 61, item: () => ({name: "Wand of the War Mage +1", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 62, max: 63, item: () => ({name: "Wand of Web", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 64, max: 65, item: () => ({name: "Weapon of Warning", keyword: ["weapon","any"], attunement: ", [requires attunement]"})},
            { min: 66, max: 66, item: () => ({name: "Adamantine Armor", keyword: ["chain mail"], attunement: ""})},
            { min: 67, max: 67, item: () => ({name: "Adamantine Armor", keyword: ["chain shirt"], attunement: ""})},
            { min: 68, max: 68, item: () => ({name: "Adamantine Armor", keyword: ["scale mail"], attunement: ""})},
            { min: 69, max: 69, item: () => ({name: "Back of Tricks", keyword: ["Gray"], attunement: ""})},
            { min: 70, max: 70, item: () => ({name: "Back of Tricks", keyword: ["Rust"], attunement: ""})},
            { min: 71, max: 71, item: () => ({name: "Back of Tricks", keyword: ["Tan"], attunement: ""})},
            { min: 72, max: 72, item: () => ({name: "Boots of the Winterland", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 73, max: 73, item: () => ({name: "Circlet of Blasting", keyword: ["wondrous"], attunement: ""})},
            { min: 74, max: 74, item: () => ({name: "Deck of Illusions", keyword: ["wondrous"], attunement: ""})},
            { min: 75, max: 75, item: () => ({name: "Eversmoking Bottle", keyword: ["wondrous"], attunement: ""})},
            { min: 76, max: 76, item: () => ({name: "Eyes of Charming", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 77, max: 77, item: () => ({name: "Eyes of the Eagle", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 78, max: 78, item: () => ({name: "Figurine of Wondrous Power", keyword: ["Silver Raven"], attunement: ""})},
            { min: 79, max: 79, item: () => ({name: "Gem of Brightness", keyword: ["wondrous"], attunement: ""})},
            { min: 80, max: 80, item: () => ({name: "Gloves of Missile Snaring", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 81, max: 81, item: () => ({name: "Gloves of Swimming and Climb", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 82, max: 82, item: () => ({name: "Gloves of Thievery", keyword: ["wondrous"], attunement: ""})},
            { min: 83, max: 83, item: () => ({name: "Headband of Intellect", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 84, max: 84, item: () => ({name: "Helm of Telepathy", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 85, max: 85, item: () => ({name: "Instrument of the Bards", keyword: ["Doss Lute"], attunement: ", [requires attunement by a Bard]"})},
            { min: 86, max: 86, item: () => ({name: "Instrument of the Bards", keyword: ["Fochlucan Bandore"], attunement: ", [requires attunement by a Bard]"})},
            { min: 87, max: 87, item: () => ({name: "Instrument of the Bards", keyword: ["Mac-Fuirmidh Cittern"], attunement: ", [requires attunement by a Bard]"})},
            { min: 88, max: 88, item: () => ({name: "Medallion of Thoughts", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 89, max: 89, item: () => ({name: "Necklace of Adaptation", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 90, max: 90, item: () => ({name: "Periapt of Wound Closure", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 91, max: 91, item: () => ({name: "Pipes of Haunting", keyword: ["wondrous"], attunement: ""})},
            { min: 92, max: 92, item: () => ({name: "Pipes of the Sewers", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 93, max: 93, item: () => ({name: "Ring of Jumping", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 94, max: 94, item: () => ({name: "Ring of Mind Shielding", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 95, max: 95, item: () => ({name: "Ring of Warmth", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 96, max: 96, item: () => ({name: "Ring of Water Walking", keyword: ["ring"], attunement: ""})},
            { min: 97, max: 97, item: () => ({name: "Quiver of Ehlonna", keyword: ["wondrous"], attunement: ""})},
            { min: 98, max: 98, item: () => ({name: "Stone of Good Luck", keyword: ["luckstone"], attunement: ", [requires attunement]"})},
            { min: 99, max: 99, item: () => ({name: "Wind Fan", keyword: ["wondrous"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Winged Boots", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
          ],
          G: [
            { min: 1, max: 11, item: () => ({name: "Weapon +2", keyword: ["weapon","any"], attunement: ""})},
            { min: 12, max: 14, item: () => ({name: "Figurine of Wondrous Power", keyword: ["figurine"], attunement: ""})}, 
            { min: 15, max: 15, item: () => ({name: "Adamantine Armor", keyword: ["breastplate"], attunement: ""})},
            { min: 16, max: 16, item: () => ({name: "Adamantine Armor", keyword: ["splint"], attunement: ""})},
            { min: 17, max: 17, item: () => ({name: "Amulet of Health", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 18, max: 18, item: () => ({name: "Armor of Vulnerability", keyword: ["armor","light","medium","heavy"], attunement: ", [requires attunement]"})},
            { min: 19, max: 19, item: () => ({name: "Arrow-catching Shield", keyword: ["shield"], attunement: ", [requires attunement]"})},
            { min: 20, max: 20, item: () => ({name: "Belt of Dwarvenkind", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 21, max: 21, item: () => ({name: "Belt of Hill Giant Strength", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 22, max: 22, item: () => ({name: "Berserker Axe", keyword: ["weapon","axe"], attunement: ", [requires attunement]"})}, 
            { min: 23, max: 23, item: () => ({name: "Boots of Levitation", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 24, max: 24, item: () => ({name: "Boots of Speed", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 25, max: 25, item: () => ({name: "Bowl of Commanding Water Elementals", keyword: ["wondrous"], attunement: ""})},
            { min: 26, max: 26, item: () => ({name: "Bracers of Defense", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 27, max: 27, item: () => ({name: "Brazier of Commanding Fire Elementals", keyword: ["wondrous"], attunement: ""})},
            { min: 28, max: 28, item: () => ({name: "Cape of the Mountebank", keyword: ["wondrous"], attunement: ""})},
            { min: 29, max: 29, item: () => ({name: "Censer of Controlling Air Elementals", keyword: ["wondrous"], attunement: ""})},
            { min: 30, max: 30, item: () => ({name: "Armor +1", keyword: ["chain mail"], attunement: ""})},
            { min: 31, max: 31, item: () => ({name: "Armor of Resistance", keyword: ["armor","chain mail","resistance"], attunement: ", [requires attunement]"})},
            { min: 32, max: 32, item: () => ({name: "Armor +1", keyword: ["chain shirt"], attunement: ""})},
            { min: 33, max: 33, item: () => ({name: "Armor of Resistance", keyword: ["armor","chain shirt","resistance"], attunement: ", [requires attunement]"})},
            { min: 34, max: 34, item: () => ({name: "Cloak of Displacement", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 35, max: 35, item: () => ({name: "Cloak of the Bat", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 36, max: 36, item: () => ({name: "Cube of Force", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 37, max: 37, item: () => ({name: "Daern's Instant Fortress", keyword: ["wondrous"], attunement: ""})},
            { min: 38, max: 38, item: () => ({name: "Dagger of Venom", keyword: ["Dagger"], attunement: ""})},
            { min: 39, max: 39, item: () => ({name: "Dimensional Shackles", keyword: ["wondrous"], attunement: ""})},
            { min: 40, max: 40, item: () => ({name: "Dragon Slayer", keyword: ["weapon","any sword"], attunement: ""})}, 
            { min: 41, max: 41, item: () => ({name: "Elven Chain", keyword: ["chain shirt"], attunement: ""})},
            { min: 42, max: 42, item: () => ({name: "Flame Tongue", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})},
            { min: 43, max: 43, item: () => ({name: "Gem of Seeing", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 44, max: 44, item: () => ({name: "Giant Slayer", keyword: ["weapon"], attunement: ""})},
            { min: 45, max: 45, item: () => ({name: "Glamoured Studded Leather", keyword: ["studded leather"], attunement: ""})},
            { min: 46, max: 46, item: () => ({name: "Helm of Teleportation", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 47, max: 47, item: () => ({name: "Horn of Blasting", keyword: ["wondrous"], attunement: ""})},
            { min: 48, max: 48, item: () => ({name: "Horn of Valhalla", keyword: ["horn of valhalla","rare"], attunement: ""})}, 
            { min: 49, max: 49, item: () => ({name: "Instrument of the Bards", keyword: ["Canaith Mandolin"], attunement: ", [requires attunement by a Bard]"})},
            { min: 50, max: 50, item: () => ({name: "Instrument of the Bards", keyword: ["Cli Lyre"], attunement: ", [requires attunement by a Bard]"})},
            { min: 51, max: 51, item: () => ({name: "Ioun Stone", keyword: ["awareness"], attunement: ", [requires attunement]"})},
            { min: 52, max: 52, item: () => ({name: "Ioun Stone", keyword: ["protection"], attunement: ", [requires attunement]"})},
            { min: 53, max: 53, item: () => ({name: "Ioun Stone", keyword: ["reserve"], attunement: ", [requires attunement]"})},
            { min: 54, max: 54, item: () => ({name: "Ioun Stone", keyword: ["sustenance"], attunement: ", [requires attunement]"})},
            { min: 55, max: 55, item: () => ({name: "Iron Bands of Bilarro", keyword: ["wondrous"], attunement: ""})},
            { min: 56, max: 56, item: () => ({name: "Armor +1", keyword: ["leather"], attunement: ""})},
            { min: 57, max: 57, item: () => ({name: "Armor of Resistance", keyword: ["armor","leather","resistance"], attunement: ", [requires attunement]"})},
            { min: 58, max: 58, item: () => ({name: "Mace of Disruption", keyword: ["mace"], attunement: ", [requires attunement]"})},
            { min: 59, max: 59, item: () => ({name: "Mace of Smiting", keyword: ["mace"], attunement: ""})},
            { min: 60, max: 60, item: () => ({name: "Mace of Terror", keyword: ["mace"], attunement: ", [requires attunement]"})},
            { min: 61, max: 61, item: () => ({name: "Mantle of Spell Resistance", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 62, max: 62, item: () => ({name: "Necklace of Prayer Beads", keyword: ["prayer beads"], attunement: ", [requires attunement by a Cleric, Druid, or Paladin]"})}, 
            { min: 63, max: 63, item: () => ({name: "Periapt of Proof Against Poison", keyword: ["wondrous"], attunement: ""})},
            { min: 64, max: 64, item: () => ({name: "Ring of Animal Influence", keyword: ["ring"], attunement: ""})},
            { min: 65, max: 65, item: () => ({name: "Ring of Evasion", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 66, max: 66, item: () => ({name: "Ring of Feather Falling", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 67, max: 67, item: () => ({name: "Ring of Free Action", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 68, max: 68, item: () => ({name: "Ring of Protection", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 69, max: 69, item: () => ({name: "Ring of Resistance", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 70, max: 70, item: () => ({name: "Ring of Spell Storing", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 71, max: 71, item: () => ({name: "Ring of the Ram", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 72, max: 72, item: () => ({name: "Ring of X-ray Vision", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 73, max: 73, item: () => ({name: "Robe of Eyes", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 74, max: 74, item: () => ({name: "Rod of Rulership", keyword: ["rod"], attunement: ", [requires attunement]"})},
            { min: 75, max: 75, item: () => ({name: "Rod of the Pact Keeper +2", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]"})},
            { min: 76, max: 76, item: () => ({name: "Rope of Entanglement", keyword: ["wondrous"], attunement: ""})},
            { min: 77, max: 77, item: () => ({name: "Armor +1", keyword: ["scale mail"], attunement: ""})},
            { min: 78, max: 78, item: () => ({name: "Armor of Resistance", keyword: ["armor","scale mail","resistance"], attunement: ", [requires attunement]"})},
            { min: 79, max: 79, item: () => ({name: "Shield +2", keyword: ["shield"], attunement: ""})},
            { min: 80, max: 80, item: () => ({name: "Shield of Missile Attraction", keyword: ["shield"], attunement: ", [requires attunement]"})},
            { min: 81, max: 81, item: () => ({name: "Staff of Charming", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]"})},
            { min: 82, max: 82, item: () => ({name: "Staff of Healing", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, or Druid]"})},
            { min: 83, max: 83, item: () => ({name: "Staff of Swarming Insects", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]"})},
            { min: 84, max: 84, item: () => ({name: "Staff of the Woodlands", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Druid]"})},
            { min: 85, max: 85, item: () => ({name: "Staff of Withering", keyword: ["quarterstaff"], attunement: ", [requires attunement] by a Cleric, Druid, or Warlock"})},
            { min: 86, max: 86, item: () => ({name: "Stone of Controlling Earth Elementals", keyword: ["wondrous"], attunement: ""})},
            { min: 87, max: 87, item: () => ({name: "Sun Blade", keyword: ["longsword"], attunement: ", [requires attunement]"})},
            { min: 88, max: 88, item: () => ({name: "Sword of Life Stealing", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 89, max: 89, item: () => ({name: "Sword of Wounding", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 90, max: 90, item: () => ({name: "Tentacle Rod", keyword: ["rod"], attunement: ", [requires attunement]"})},
            { min: 91, max: 91, item: () => ({name: "Vicious Weapon", keyword: ["weapon","any"], attunement: ""})},
            { min: 92, max: 92, item: () => ({name: "Wand of Binding", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 93, max: 93, item: () => ({name: "Wand of Enemy Detection", keyword: ["wand"], attunement: ", [requires attunement]"})},
            { min: 94, max: 94, item: () => ({name: "Wand of Fear", keyword: ["wand"], attunement: ", [requires attunement]"})},
            { min: 95, max: 95, item: () => ({name: "Wand of Fireballs", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 96, max: 96, item: () => ({name: "Wand of Lightning Bolts", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 97, max: 97, item: () => ({name: "Wand of Paralysis", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 98, max: 98, item: () => ({name: "Wand of the War Mage +2", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 99, max: 99, item: () => ({name: "Wand of Wonder", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 100, max: 100, item: () => ({name: "Wings of Flying", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
          ],
          H: [
            { min: 1, max: 10, item: () => ({name: "Weapon +3", keyword: ["weapon","any"], attunement: ""})},
            { min: 11, max: 12, item: () => ({name: "Amulet of the Planes", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 13, max: 14, item: () => ({name: "Carpet of Flying", keyword: ["carpet"], attunement: ""})}, 
            { min: 15, max: 23, item: () => ({name: "Crystal Ball", keyword: ["very rare"], attunement: ", [requires attunement]"})}, 
            { min: 17, max: 25, item: () => ({name: "Ring of Regeneration", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 19, max: 27, item: () => ({name: "Ring of Shooting Stars", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 21, max: 29, item: () => ({name: "Ring of Telekinesis", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 23, max: 31, item: () => ({name: "Robe of Scintillating Colors", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 25, max: 33, item: () => ({name: "Robe of Stars", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 27, max: 35, item: () => ({name: "Rod of Absorption", keyword: ["rod"], attunement: ", [requires attunement]"})},
            { min: 29, max: 37, item: () => ({name: "Rod of Alertness", keyword: ["rod"], attunement: ", [requires attunement]"})},
            { min: 31, max: 39, item: () => ({name: "Rod of Security", keyword: ["rod"], attunement: ""})},
            { min: 33, max: 41, item: () => ({name: "Rod of the Pact Keeper +3", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]"})},
            { min: 35, max: 43, item: () => ({name: "Scimitar of Speed", keyword: ["scimitar"], attunement: ", [requires attunement]"})},
            { min: 37, max: 45, item: () => ({name: "Shield +3", keyword: ["armor","shield"], attunement: ""})},
            { min: 39, max: 47, item: () => ({name: "Staff of Fire", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]"})},
            { min: 41, max: 49, item: () => ({name: "Staff of Frost", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]"})},
            { min: 43, max: 51, item: () => ({name: "Staff of Power", keyword: ["quarterstaff"], attunement: ", [requires attunement]"})},
            { min: 45, max: 53, item: () => ({name: "Staff of Striking", keyword: ["quarterstaff"], attunement: ", [requires attunement]"})},
            { min: 47, max: 55, item: () => ({name: "Staff of Thunder and Lightning", keyword: ["quarterstaff"], attunement: ", [requires attunement]"})},
            { min: 49, max: 57, item: () => ({name: "Sword of Sharpness", keyword: ["weapon", "any sword"], attunement: ", [requires attunement]"})}, 
            { min: 51, max: 59, item: () => ({name: "Wand of Polymorph", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 53, max: 61, item: () => ({name: "Wand of the War Mage +3", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]"})},
            { min: 55, max: 55, item: () => ({name: "Adamantine Armor", keyword: ["half plate"], attunement: ""})},
            { min: 56, max: 56, item: () => ({name: "Adamantine Armor", keyword: ["plate"], attunement: ""})},
            { min: 57, max: 57, item: () => ({name: "Animated Shield", keyword: ["shield"], attunement: ", [requires attunement]"})},
            { min: 58, max: 58, item: () => ({name: "Belt of Fire Giant Strength", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 59, max: 59, item: () => ({name: "Belt of Giant Strength", keyword: ["wondrous", "giant strength"], attunement: ", [requires attunement]"})}, 
            { min: 60, max: 60, item: () => ({name: "Armor +1", keyword: ["breastplate"], attunement: ""})},
            { min: 61, max: 61, item: () => ({name: "Armor of Resistance", keyword: ["breastplate"], attunement: ", [requires attunement]"})},
            { min: 62, max: 62, item: () => ({name: "Candle of Invocation", keyword: ["alignment"], attunement: ", [requires attunement]"})},
            { min: 63, max: 63, item: () => ({name: "Armor +2", keyword: ["chain mail"], attunement: ""})},
            { min: 64, max: 64, item: () => ({name: "Armor +2", keyword: ["chain shirt"], attunement: ""})},
            { min: 65, max: 65, item: () => ({name: "Cloak of Arachnida", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 66, max: 66, item: () => ({name: "Dancing Sword", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})},
            { min: 67, max: 67, item: () => ({name: "Demon Armor", keyword: ["plate"], attunement: ", [requires attunement]"})},
            { min: 68, max: 68, item: () => ({name: "Dragon Scale Mail", keyword: ["scale mail","dragon"], attunement: ", [requires attunement]"})},
            { min: 69, max: 69, item: () => ({name: "Dwarven Plate", keyword: ["plate"], attunement: ""})},
            { min: 70, max: 70, item: () => ({name: "Dwarven Thrower", keyword: ["warhammer"], attunement: ", [requires attunement by a Dwarf or a creature attuned to a Belt of Dwarvenkind]"})},
            { min: 71, max: 71, item: () => ({name: "Efreeti Bottle", keyword: ["wondrous"], attunement: ""})},
            { min: 72, max: 72, item: () => ({name: "Figurine of Wondrous Power", keyword: ["obsidian steed"], attunement: ""})},
            { min: 73, max: 73, item: () => ({name: "Frost Brand", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 74, max: 74, item: () => ({name: "Helm of Brilliance", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 75, max: 75, item: () => ({name: "Horn of Valhalla", keyword: ["bronze"], attunement: ""})},
            { min: 76, max: 76, item: () => ({name: "Instrument of the Bards", keyword: ["Anstruth Harp"], attunement: ", [requires attunement by a Bard]"})},
            { min: 77, max: 77, item: () => ({name: "Ioun Stone", keyword: ["absorption"], attunement: ", [requires attunement]"})},
            { min: 78, max: 78, item: () => ({name: "Ioun Stone", keyword: ["agility"], attunement: ", [requires attunement]"})},
            { min: 79, max: 79, item: () => ({name: "Ioun Stone", keyword: ["fortitude"], attunement: ", [requires attunement]"})},
            { min: 80, max: 80, item: () => ({name: "Ioun Stone", keyword: ["insight"], attunement: ", [requires attunement]"})},
            { min: 81, max: 81, item: () => ({name: "Ioun Stone", keyword: ["intellect"], attunement: ", [requires attunement]"})},
            { min: 82, max: 82, item: () => ({name: "Ioun Stone", keyword: ["leadership"], attunement: ", [requires attunement]"})},
            { min: 83, max: 83, item: () => ({name: "Ioun Stone", keyword: ["strength"], attunement: ", [requires attunement]"})},
            { min: 84, max: 84, item: () => ({name: "Armor +2", keyword: ["leather"], attunement: ""})},
            { min: 85, max: 85, item: () => ({name: "Manual of Bodily Health", keyword: ["wondrous"], attunement: ""})},
            { min: 86, max: 86, item: () => ({name: "Manual of Gainful Exercise", keyword: ["wondrous"], attunement: ""})},
            { min: 87, max: 87, item: () => ({name: "Manual of Golems", keyword: ["golem"], attunement: ""})}, 
            { min: 88, max: 88, item: () => ({name: "Manual of Quickness of Action", keyword: ["wondrous"], attunement: ""})},
            { min: 89, max: 89, item: () => ({name: "Mirror of Life Trapping", keyword: ["wondrous"], attunement: ""})},
            { min: 90, max: 90, item: () => ({name: "Nine Lives Stealer", keyword: ["weapon"], attunement: ", [requires attunement]"})},
            { min: 91, max: 91, item: () => ({name: "Oathbow", keyword: ["longbow"], attunement: ", [requires attunement]"})},
            { min: 92, max: 92, item: () => ({name: "Armor +2", keyword: ["scale mail"], attunement: ""})},
            { min: 93, max: 93, item: () => ({name: "Spellguard Shield", keyword: ["shield"], attunement: ", [requires attunement]"})},
            { min: 94, max: 94, item: () => ({name: "Armor +1", keyword: ["splint"], attunement: ""})},
            { min: 95, max: 95, item: () => ({name: "Armor of Resistance", keyword: ["armor","splint","resistance"], attunement: ", [requires attunement]"})},
            { min: 96, max: 96, item: () => ({name: "Armor +1", keyword: ["studded leather"], attunement: ""})},
            { min: 97, max: 97, item: () => ({name: "Armor of Resistance", keyword: ["armor","studded leather","resistance"], attunement: ", [requires attunement]"})},
            { min: 98, max: 98, item: () => ({name: "Tome of Clear Thought", keyword: ["wondrous"], attunement: ""})},
            { min: 99, max: 99, item: () => ({name: "Tome of Leadership and Influence", keyword: ["wondrous"], attunement: ""})},
            { min: 100, max: 100, item: () => ({name: "Tome of Understanding", keyword: ["wondrous"], attunement: ""})},
          ],
          I: [
            { min: 1, max: 5, item: () => ({name: "Defender", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 6, max: 10, item: () => ({name: "Hammer of Thunderbolts", keyword: ["maul"], attunement: ", [requires attunement]"})},
            { min: 11, max: 15, item: () => ({name: "Luck Blade", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 16, max: 20, item: () => ({name: "Sword of Answering", keyword: ["weapon","answering"], attunement: ", [requires attunement by a creature with the same alignment as the sword]"})}, 
            { min: 21, max: 23, item: () => ({name: "Holy Avenger", keyword: ["weapon","any sword"], attunement: ", [requires attunement by a Paladin]"})}, 
            { min: 24, max: 26, item: () => ({name: "Ring of Djinni Summoning", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 27, max: 29, item: () => ({name: "Ring of Invisibility", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 30, max: 32, item: () => ({name: "Ring of Spell Turning", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 33, max: 35, item: () => ({name: "Rod of Lordly Might", keyword: ["rod"], attunement: ", [requires attunement]"})},
            { min: 36, max: 38, item: () => ({name: "Staff of the Magi", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]"})},
            { min: 39, max: 41, item: () => ({name: "Vorpal Sword", keyword: ["weapon","any sword"], attunement: ", [requires attunement]"})}, 
            { min: 42, max: 43, item: () => ({name: "Belt of Cloud Giant Strength", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 44, max: 45, item: () => ({name: "Armor +2", keyword: ["breastplate"], attunement: ""})},
            { min: 46, max: 47, item: () => ({name: "Armor +3", keyword: ["chain mail"], attunement: ""})},
            { min: 48, max: 49, item: () => ({name: "Armor +3", keyword: ["chain shirt"], attunement: ""})},
            { min: 50, max: 51, item: () => ({name: "Cloak of Invisibility", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 52, max: 53, item: () => ({name: "Crystal Ball", keyword: ["legendary"], attunement: ", [requires attunement]"})},
            { min: 54, max: 55, item: () => ({name: "Armor +1", keyword: ["half plate"], attunement: ""})},
            { min: 56, max: 57, item: () => ({name: "Iron Flask", keyword: ["wondrous", "iron flask"], attunement: ""})}, 
            { min: 58, max: 59, item: () => ({name: "Armor +3", keyword: ["leather"], attunement: ""})},
            { min: 60, max: 61, item: () => ({name: "Armor +1", keyword: ["plate"], attunement: ""})},
            { min: 62, max: 63, item: () => ({name: "Robe off the Archmagi", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]"})},
            { min: 64, max: 65, item: () => ({name: "Rod of Resurrection", keyword: ["rod"], attunement: ", [requires attunement by a Cleric, Druid, or Paladin]"})},
            { min: 66, max: 67, item: () => ({name: "Armor +1", keyword: ["scale mail"], attunement: ""})},
            { min: 68, max: 69, item: () => ({name: "Scarab of Protection", keyword: ["wondrous"], attunement: ""})},
            { min: 70, max: 71, item: () => ({name: "Armor +2", keyword: ["splint"], attunement: ""})},
            { min: 72, max: 73, item: () => ({name: "Armor +2", keyword: ["studded leather"], attunement: ""})},
            { min: 74, max: 75, item: () => ({name: "Well of Many Worlds", keyword: ["wondrous"], attunement: ""})},
            { min: 76, max: 76, item: () => ({name: "Magic Armor", keyword: ["armor", "magic armor"], attunement: ""})},
            { min: 77, max: 77, item: () => ({name: "Apparatus of Kwalish", keyword: ["wondrous"], attunement: ""})},
            { min: 78, max: 78, item: () => ({name: "Armor of Invulnerability", keyword: ["plate"], attunement: ", [requires attunement]"})},
            { min: 79, max: 79, item: () => ({name: "Belt of Storm Giant Strength", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 80, max: 80, item: () => ({name: "Cubic Gate", keyword: ["wondrous"], attunement: ""})},
            { min: 81, max: 81, item: () => ({name: "Deck of Many Things", keyword: ["wondrous"], attunement: ""})},
            { min: 82, max: 82, item: () => ({name: "Efreeti Chain", keyword: ["armor"], attunement: ", [requires attunement]"})},
            { min: 83, max: 83, item: () => ({name: "Armor of Resistance", keyword: ["armor","half plate","resistance"], attunement: ", [requires attunement]"})},
            { min: 84, max: 84, item: () => ({name: "Horn of Valhalla", keyword: ["iron"], attunement: ""})},
            { min: 85, max: 85, item: () => ({name: "Instrument of the Bards", keyword: ["Ollamh Harp"], attunement: ", [requires attunement by a Bard]"})},
            { min: 86, max: 86, item: () => ({name: "Ioun Stone", keyword: ["greater absorption"], attunement: ", [requires attunement]"})},
            { min: 87, max: 87, item: () => ({name: "Ioun Stone", keyword: ["mastery"], attunement: ", [requires attunement]"})},
            { min: 88, max: 88, item: () => ({name: "Ioun Stone", keyword: ["regeneration"], attunement: ", [requires attunement]"})},
            { min: 89, max: 89, item: () => ({name: "Plate Armor of Etherealness", keyword: ["plate"], attunement: ", [requires attunement]"})},
            { min: 90, max: 90, item: () => ({name: "Armor of Resistance", keyword: ["armor","plate","resistance"], attunement: ", [requires attunement]"})},
            { min: 91, max: 91, item: () => ({name: "Ring of Air Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 92, max: 92, item: () => ({name: "Ring of Earth Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 93, max: 93, item: () => ({name: "Ring of Fire Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 94, max: 94, item: () => ({name: "Ring of Three Wishes", keyword: ["ring"], attunement: ""})},
            { min: 95, max: 95, item: () => ({name: "Ring of Water Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"})},
            { min: 96, max: 96, item: () => ({name: "Sphere of Annihilation", keyword: ["wondrous"], attunement: ""})},
            { min: 97, max: 97, item: () => ({name: "Talisman of Pure Good", keyword: ["wondrous"], attunement: ", [requires attunement by a creature of good alignment]"})},
            { min: 98, max: 98, item: () => ({name: "Talisman of the Sphere", keyword: ["wondrous"], attunement: ", [requires attunement]"})},
            { min: 99, max: 99, item: () => ({name: "Talisman of Ultimate Evil", keyword: ["wondrous"], attunement: ", [requires attunement by a creature of evil alignment]"})},
            { min: 100, max: 100, item: () => ({name: "Tome of the Stilled Tongue", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]"})},
          ],
        }

        // === MAGIC SHOP GENERATOR ===
        const MagicShopSettings = {
          veryLow: {
            common: [1, 4],
            uncommon: [0, 2],
            rare: [0, 0],
            veryRare: [0, 0],
            legendary: [0, 0]
          },
          low: {
            common: [1, 8],
            uncommon: [0, 3],
            rare: [0, 2],
            veryRare: [0, 0],
            legendary: [0, 0]
          },
          mid: {
            common: [1, 15],
            uncommon: [0, 6],
            rare: [0, 4],
            veryRare: [0, 3],
            legendary: [0, 1]
          },
          high: {
            common: [1, 20],
            uncommon: [0, 12],
            rare: [0, 6],
            veryRare: [0, 4],
            legendary: [0, 2]
          },
          extreme: {
            common: [1, 30],
            uncommon: [0, 15],
            rare: [0, 10],
            veryRare: [0, 8],
            legendary: [0, 4]
          }
        };

        const MagicShopChances = {
          veryLow: {
            common: { cost: [(50*1.8), (100*1.8)] }, // 90 GP and 180 GP
            uncommon: { cost: [(101*1.45), (500*1.45)] }, // 146.45 GP and 725 GP
            rare: { cost: [(501*1.3), (5000*1.3)] }, // 651.3 GP and 6500 GP
            veryRare: { cost: [(5001*1.15), (50000*1.15)] }, // 5751.15 GP and 57500 GP
            legendary: { cost: [(50001*1.1), (150000*1.1)] }, // 55001.1 GP and 165000 GP
          },
          low: {
            common: { cost: [(50*1.4), (100*1.4)] }, // 70 GP and 140 GP
            uncommon: { cost: [(101*1.25), (500*1.25)] }, // 126.25 GP and 625 GP
            rare: { cost: [(501*1.15), (5000*1.15)] }, // 576.15 GP and 5750 GP
            veryRare: { cost: [(5001*1.1), (50000*1.1)] }, // 5501.1 GP and 55000 GP
            legendary: { cost: [(50001*1.05), (150000*1.05)] }, // 52501.05 GP and 157500 GP
          },
          mid: {
            common: { cost: [50, 100] },
            uncommon: { cost: [101, 500] },
            rare: { cost: [501, 5000] },
            veryRare: { cost: [5001, 50000] },
            legendary: { cost: [50001, 150000] },
          },
          high: {
            common: { cost: [(50*0.6), (100*0.6)] }, // 30 GP and 60 GP
            uncommon: { cost: [(101*0.75), (500*0.75)] }, // 75.75 GP and 375 GP
            rare: { cost: [(501*0.85), (5000*0.85)] }, // 425.85 GP and 4250 GP
            veryRare: { cost: [(5001*0.90), (50000*0.90)] }, // 4500.9 GP and 45000 GP
            legendary: { cost: [(50001*0.95), (150000*0.95)] }, // 47500.95 GP and 142500 GP
          },
          extreme: {
            common: { cost: [(50*0.2), (100*0.2)] }, // 10 GP and 20 GP
            uncommon: { cost: [(101*0.55), (500*0.55)] }, // 55.55 GP and 275 GP
            rare: { cost: [(501*0.7), (5000*0.7)] }, // 350.7 GP and 3500 GP
            veryRare: { cost: [(5001*0.85), (50000*0.85)] }, // 4250.85 GP and 42500 GP
            legendary: { cost: [(50001*0.9), (150000*0.9)] }, // 45000.9 GP and 135000 GP
          }
        };

        const MagicItems = {
          magicSeller: {
            common: [
              { name: "Armblade", keyword: ["weapon","one-handed melee"], attunement: ", [requires attunement by a Warforged]" },
              { name: "Armor of Gleaming", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Band of Loyalty", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Bead of Nourishment", keyword: ["wondrous"], attunement: "" },
              { name: "Boots of False Tracks", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Candle of the Deep", keyword: ["wondrous"], attunement: "" },
              { name: "Cast Off Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Charlatan's Die", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cleansing Stone", keyword: ["wondrous"], attunement: "" },
              { name: "Cloak of Billowing", keyword: ["wondrous"], attunement: "" },
              { name: "Cloak of Many Fashions", keyword: ["wondrous"], attunement: "" },
              { name: "Clockwork Amulet", keyword: ["wondrous"], attunement: "" },
              { name: "Clothes of Mending", keyword: ["wondrous"], attunement: "" },
              { name: "Dark Shard Amulet", keyword: ["wondrous"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Dread Helm", keyword: ["wondrous"], attunement: "" },
              { name: "Ear Horn of Hearing", keyword: ["wondrous"], attunement: "" },
              { name: "Enduring Spellbook", keyword: ["wondrous"], attunement: "" },
              { name: "Ersatz Eye", keyword: ["wondrous"], attunement: "" },
              { name: "Everybright Lantern", keyword: ["wondrous"], attunement: "" },
              { name: "Feather Token", keyword: ["Feather Fall"], attunement: "" },
              { name: "Hat of Vermin", keyword: ["wondrous"], attunement: "" },
              { name: "Hat of Wizardry", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Heward's Handy Spice Pouch", keyword: ["wondrous"], attunement: "" },
              { name: "Horn of Silent Alarm", keyword: ["wondrous"], attunement: "" },
              { name: "Illuminator's Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Imbued Wood Focus", keyword: ["wand","wood focus"], attunement: ", [requires attunement]" },
              { name: "Instrument of Illusions", keyword: ["instrument"], attunement: ", [requires attunement]" },
              { name: "Instrument of Scribing", keyword: ["instrument"], attunement: ", [requires attunement]" },
              { name: "Lock of Trickery", keyword: ["wondrous"], attunement: "" },
              { name: "Masquerade Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Mind Crystal", keyword: ["mind crystal","common"], attunement: "" },
              { name: "Moodmark Paint", keyword: ["wondrous"], attunement: "" },
              { name: "Moontouched Sword", keyword: ["weapon","bladed"], attunement: "" },
              { name: "Mystery Key", keyword: ["wondrous"], attunement: "" },
              { name: "Orb of Direction", keyword: ["wondrous"], attunement: "" },
              { name: "Orb of Shielding", keyword: ["orb shield"], attunement: ", [requires attunement]" },
              { name: "Orb of Time", keyword: ["wondrous"], attunement: "" },
              { name: "Perfume of Bewitching", keyword: ["wondrous"], attunement: "" },
              { name: "Pipe of Remembrance", keyword: ["wondrous"], attunement: "" },
              { name: "Pipe of Smoke Monsters", keyword: ["wondrous"], attunement: "" },
              { name: "Pole of Angling", keyword: ["wondrous"], attunement: "" },
              { name: "Pole of Collapsing", keyword: ["wondrous"], attunement: "" },
              { name: "Pot of Awakening", keyword: ["wondrous"], attunement: "" },
              { name: "Potion of Climbing", keyword: ["potion"], attunement: "" },
              { name: "Potion of Comprehension", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["basic"], attunement: "" },
              { name: "Pressure Capsule", keyword: ["wondrous"], attunement: "" },
              { name: "Prothetic Limb", keyword: ["wondrous"], attunement: "" },
              { name: "Rival Coin", keyword: ["wondrous"], attunement: "" },
              { name: "Rope of Mending", keyword: ["wondrous"], attunement: "" },
              { name: "Ruby of the War Mage", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Sekolahian Worshiping Statuette", keyword: ["wondrous"], attunement: "" },
              { name: "Shield of Expression", keyword: ["armor","shield"], attunement: "" },
              { name: "Shift Weave", keyword: ["wondrous"], attunement: "" },
              { name: "Silvered Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Smoldering Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","cantrip","1st level"], attunement: "" },
              { name: "Spell Shard", keyword: ["wondrous"], attunement: "" },
              { name: "Spellwrought Tattoo", keyword: ["scroll","cantrip","1st level"], attunement: "" },
              { name: "Spyglass of Clairvoyance", keyword: ["wondrous"], attunement: "" },
              { name: "Staff of Adornment", keyword: ["staff"], attunement: "" },
              { name: "Staff of Birdcalls", keyword: ["staff"], attunement: "" },
              { name: "Staff of Flowers", keyword: ["staff"], attunement: "" },
              { name: "Sylvan Talon", keyword: ["weapon","pointed"], attunement: ", [requires attunement]" },
              { name: "Talking Doll", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Tankard of Plenty", keyword: ["wondrous"], attunement: "" },
              { name: "Tankard of Sobriety", keyword: ["wondrous"], attunement: "" },
              { name: "Unbreakable Arrow", keyword: ["arrow"], attunement: "" },
              { name: "Veteran's Cane", keyword: ["wondrous"], attunement: "" },
              { name: "Walloping Ammunition", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Wand of Conducting", keyword: ["wand"], attunement: "" },
              { name: "Wand of Pyrotechnics", keyword: ["wand"], attunement: "" },
              { name: "Wand of Scowls", keyword: ["wand"], attunement: "" },
              { name: "Wand of Smiles", keyword: ["wand"], attunement: "" },
              { name: "Wand Sheath", keyword: ["wondrous"], attunement: ", [requires attunement by a Warforged]" },
            ],
            uncommon: [
              { name: "Adamantine Armor", keyword: ["armor","MH not hide"], attunement: "" },
              { name: "Adamantine Weapon", keyword: ["weapon","ammunition","melee"], attunement: "" },
              { name: "Alchemy Jug", keyword: ["wondrous"], attunement: "" },
              { name: "All Purpose Tool +1", keyword: ["wondrous"], attunement: ", [requires attunement by an Artificer]" },
              { name: "Ammunition +1", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Amulet of Protection Against Detection and Location", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Amulet of the Devout +1", keyword: ["wondrous"], attunement: "" },
              { name: "Arcane Grimoire +1", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Baba Yaga's Dancing Broom", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Bag of Bounty", keyword: ["wondrous"], attunement: "" },
              { name: "Bag of Holding", keyword: ["woundrous"], attunement: "" },
              { name: "Bag of Tricks", keyword: ["trick bag"], attunement: "" },
              { name: "Ballon Pack", keyword: ["wondrous"], attunement: "" },
              { name: "Barrier Tattoo", keyword: ["tattoo) (AC = 12 + Dexterity Modifier"], attunement: ", [requires attunement]" },
              { name: "Blood Spear", keyword: ["spear"], attunement: ", [requires attunement]" },
              { name: "Bloodwell Vial +1", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Boomerang +1", keyword: ["wondrous"], attunement: "" },
              { name: "Boots of Elvenkind", keyword: ["wondrous"], attunement: "" },
              { name: "Boots of Striding and Springing", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Boots of the Winterland", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Bottled Breath", keyword: ["potion"], attunement: "" },
              { name: "Bracers of Archery", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Brooch of Shielding", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Broom of Flying", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cap of Waterbreathing", keyword: ["wondrous"], attunement: "" },
              { name: "Circlet of Blasting", keyword: ["wondrous"], attunement: "" },
              { name: "Cloak of Elvenkind", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cloak of Protection", keyword: ["wondrous"], attunement: "" },
              { name: "Cloak of the Manta Ray", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Coiling Grasp Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Crusader's Shortsword", keyword: ["shortsword"], attunement: ", [requires attunement]" },
              { name: "Cursed Luckstone", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Decanter of Endless Water", keyword: ["wondrous"], attunement: "" },
              { name: "Deck of Illusions", keyword: ["deck","illusion"], attunement: "" },
              { name: "Dragon Vessel", keyword: ["Slumbering"], attunement: ", [requires attunement]" },
              { name: "Dragonhide Belt +1", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Dragon Wrath Weapon (Slumbering)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dragon-Touched Focus (Slumbering)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Driftglobe", keyword: ["wondrous"], attunement: "" },
              { name: "Dust of Disappearance", keyword: ["wondrous"], attunement: "" },
              { name: "Dust of Dryness", keyword: ["dust","dryness"], attunement: "" },
              { name: "Earworm", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Efficient Quiver", keyword: ["wondrous"], attunement: "" },
              { name: "Eldritch Claw Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Elemental Gem", keyword: ["elemental"], attunement: "" },
              { name: "Emerald Pen", keyword: ["wondrous"], attunement: "" },
              { name: "Eversmoking Bottle", keyword: ["wondrous"], attunement: "" },
              { name: "Eyes of Charming", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Eyes of Minute Seeing", keyword: ["wondrous"], attunement: "" },
              { name: "Eyes of the Eagle", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Feywild Shard", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Figurine of Woundrous Power", keyword: ["Silver Raven"], attunement: "" },
              { name: "Guantlets of Ogre Power", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Gem of Brightness", keyword: ["wondrous"], attunement: "" },
              { name: "Gloves of Missile Snaring", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Gloves of Swimming and Climbing", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Gloves of Theivery", keyword: ["wondrous"], attunement: "" },
              { name: "Goggles of Night", keyword: ["wondrous"], attunement: "" },
              { name: "Guardian Emblem", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Hag Eye", keyword: ["wondrous"], attunement: "" },
              { name: "Harkon's Bite", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Hat of Disguise", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Headband of Intellect", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Hellfire Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Helm of Comprehend Languages", keyword: ["wondrous"], attunement: "" },
              { name: "Helm of Telepathy", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Helm of Underwater Action", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Hew", keyword: ["battleaxe"], attunement: "" },
              { name: "Immovable Rod", keyword: ["rod"], attunement: "" },
              { name: "Infernal Puzzle Box", keyword: ["wondrous"], attunement: "" },
              { name: "Inquisative's Goggles", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Insignia of Claws", keyword: ["wondrous"], attunement: "" },
              { name: "Instrument of the Bards", keyword: ["instrument of bards","uncommon"], attunement: ", [requires attunement by a Bard]" },
              { name: "Javelin of Lightning", keyword: ["javelin"], attunement: "" },
              { name: "Keoghtom's Ointment", keyword: ["dose","keoghtom's"], attunement: "" },
              { name: "Lantern of Revealing", keyword: ["wondrous"], attunement: "" },
              { name: "Lightbringer", keyword: ["mace"], attunement: "" },
              { name: "Living Gloves", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mariner's Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Mask of the Beast", keyword: ["wondrous"], attunement: "" },
              { name: "Medallion of Thought", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mind Carapace Armor", keyword: ["armor","heavy"], attunement: ", [requires attunement by a specific individual]" },
              { name: "Mind Crystal", keyword: ["mind crystal","uncommon"], attunement: ""},
              { name: "Mithiral Armor", keyword: ["MH not hide"], attunement: "" },
              { name: "Mizzium Apparatus", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Moon Sickle +1", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Nature's Mantle", keyword: ["wondrous"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Necklace of Adaptation", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Oil of Slipperiness", keyword: ["potion"], attunement: "" },
              { name: "Pearl of Power", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Periapt of Health", keyword: ["wondrous"], attunement: ", [requires attunemnet]" },
              { name: "Periapt of Wound Closure", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Philter of Love", keyword: ["potion"], attunement: "" },
              { name: "Pipes of Haunting", keyword: ["wondrous"], attunement: "" },
              { name: "Pipes of the Sewers", keyword: ["wondrous"], attunement: ", [requires attunemnet]" },
              { name: "Potion of Animal Friendship", keyword: ["potion"], attunement: "" },
              { name: "Potion of Fire Breath", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","uncommon"], attunement: "" },
              { name: "Potion of Growth", keyword: ["potion"], attunement: "" },
              { name: "Potion of Poison", keyword: ["potion"], attunement: "" },
              { name: "Potion of Polychromy", keyword: ["potion"], attunement: "" },
              { name: "Potion of Psionic Fortitude", keyword: ["potion"], attunement: "" },
              { name: "Potion of Pugilism", keyword: ["potion"], attunement: "" },
              { name: "Potion of Resistance", keyword: ["potion","resistance"], attunement: "" },
              { name: "Potion of Water Breathing", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["greater"], attunement: "" },
              { name: "Pyroconverger", keyword: ["wondrous"], attunement: ", [requires attument]" },
              { name: "Quaal's Feather Token", keyword: ["feather token", "uncommon"], attunement: "" },
              { name: "Quiver of Ehlonna", keyword: ["wondrous"], attunement: "" },
              { name: "Restorative Ointment", keyword: ["dose","keoghtom's"], attunement: "" },
              { name: "Rhythm-Maker's Drum +1", keyword: ["wondrous"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ring of Jumping", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Mind Shielding", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Swimming", keyword: ["ring"], attunement: "" },
              { name: "Ring of the Orator", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Warmth", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Water Walking", keyword: ["ring"], attunement: "" },
              { name: "Ring of Shared Suffering", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Robe of Useful Items", keyword: ["useful items"], attunement: "" },
              { name: "Rod of the Pact Keeper +1", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Rope of Climbing", keyword: ["wondrous"], attunement: "" },
              { name: "Saddle of the Cavalier", keyword: ["wondrous"], attunement: "" },
              { name: "Scaled Ornament (Slumbering)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Seeker Dart", keyword: ["dart"], attunement: "" },
              { name: "Sending Stones", keyword: ["wondrous"], attunement: "" },
              { name: "Sentinel Shield", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield +1", keyword: ["armor","shield"], attunement: "" },
              { name: "Skyblinder Staff", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Slippers of Spider Climbing", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Smokepowder", keyword: ["wondrous"], attunement: "" },
              { name: "Soul Coin", keyword: ["wondrous"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","2nd level","3rd level"], attunement: "" },
              { name: "Spell Wrought Tattoo", keyword: ["scroll","2nd level","3rd level"], attunement: "" },
              { name: "Spies' Murmur", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Staff of the Adder", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Staff of the Python", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Stone of Good Luck", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Storm Boomerang", keyword: ["boomerang"], attunement: "" },
              { name: "Sword of Vengeance", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Trident of Fish Command", keyword: ["trident"], attunement: ", [requires attunement]" },
              { name: "Uncommon Glamerweave", keyword: ["wondrous"], attunement: "" },
              { name: "Wand of Magic Detection", keyword: ["wand"], attunement: "" },
              { name: "Wand of Magic Missiles", keyword: ["wand"], attunement: "" },
              { name: "Wand of Secrets", keyword: ["wand"], attunement: "" },
              { name: "Wand of the War Mage +1", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Web", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Weapon of Warning", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Weapon +1", keyword: ["weapon","any"], attunement: "" },
              { name: "Wheel of Wind and Water", keyword: ["wondrous"], attunement: "" },
              { name: "Wildspace Orrery", keyword: ["wondrous"], attunement: "" },
              { name: "Wind Fan", keyword: ["wondrous"], attunement: "" },
              { name: "Winged Boots", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Wingwear", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Wraps of Unarmed Power +1", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa", keyword: ["Yklwa"], attunement: "" },
            ],
            rare: [
              { name: "Alchemical Compendium", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "All-Purpose Tool", keyword: ["wondrous"], attunement: ", [requires attunement by a Artificer]" },
              { name: "Ammunition +2", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Amulet of Health", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Amulet of the Devout", keyword: ["wondrous"], attunement: ", [requires attunement by a Cleric or Paladin]" },
              { name: "Arcane Grimoire", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Armor of Resistance", keyword: ["armor","light","medium","heavy","resistance"], attunement: ", [requires attunement]" },
              { name: "Armor of Vulnerability", keyword: ["armor","light","medium","heavy","bps resistance"], attunement: ", [requires attunement]" },
              { name: "Armor +1", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Arrow-Catching Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Astral Shard", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Astromancy Archive", keyword: ["wondrous"], attunement: ", [requires attunement by a wizard]" },
              { name: "Atlas of Endless Horizons", keyword: ["wondrous"], attunement: ", [requires attunement by a wizard]" },
              { name: "Bag of Beans", keyword: ["dose","bag of beans"], attunement: "" },
              { name: "Barrier Tattoo", keyword: ["tattoo) (15 + Dexterity Modifier [max +2]"], attunement: ", [requires attunement]" },
              { name: "Bead of Force", keyword: ["dose","bead of force"], attunement: "" },
              { name: "Bell Branch", keyword: ["wondrous"], attunement: ", [requires attunement by a Druid or Warlock]" },
              { name: "Belt of Dwarvenkind", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Belt of Hill Giant Strength", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Berserker Axe", keyword: ["weapon","axe"], attunement: ", [requires attunement]" },
              { name: "Bloodwell Vial +2", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Boomerang +2", keyword: ["boomerang"], attunement: "" },
              { name: "Boots of Levitation", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Boots of Speed", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Bowl of Commanding Water Elementals", keyword: ["wondrous"], attunement: "" },
              { name: "Bracers of Celerity", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Bracers of Defense", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Brazier of Commanding Fire Elementals", keyword: ["wondrous"], attunement: "" },
              { name: "Cape of the Mountebank", keyword: ["wondrous"], attunement: "" },
              { name: "Censor of Controlling Air Elementals", keyword: ["wondrous"], attunement: "" },
              { name: "Charm of Plant Command", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Chime of Opening", keyword: ["wondrous"], attunement: "" },
              { name: "Claws of the Umber Hulk", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cloak of Displacement", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cloak of the Bat", keyword: ["wondrous"], attunement: ", requires attunement" },
              { name: "Crystal Blade", keyword: ["weapon","any sword"], attunement: ", [requires attunement]" },
              { name: "Cube of Force", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cube of Summoning", keyword: ["wondrous"], attunement: "" },
              { name: "Daern's Instant Fortress", keyword: ["wondrous"], attunement: "" },
              { name: "Dagger of Venom", keyword: ["dagger"], attunement: "" },
              { name: "Demon Skin", keyword: ["armor","heavy"], attunement: ", [requires attunement]" },
              { name: "Devotee's Censer", keyword: ["flail"], attunement: ", [requires attunement by a Cleric or Paladin]" },
              { name: "Dimensional Shackles", keyword: ["wondrous"], attunement: "" },
              { name: "Docent", keyword: ["wondrous"], attunement: ", [requires attunement by a Warforged]" },
              { name: "Dragon Slayer", keyword: ["weapon","any"], attunement: "" },
              { name: "Dragon Vessel (Stirring)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Dragonguard", keyword: ["breastplate"], attunement: "" },
              { name: "Dragonhide Belt", keyword: ["wondrous"], attunement: ", [requires attunement by a Monk]" },
              { name: "Dragon's Wrath Weapon (Stirring)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dragontooth Dagger", keyword: ["dagger"], attunement: "" },
              { name: "Dragon-Touched Focus", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Dragon Wing Bow", keyword: ["weapon","any bow"], attunement: ", [requires attunement]" },
              { name: "Duplicitous Manuscript", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Elemental Essence Shard", keyword: ["elemental"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Elixir of Health", keyword: ["potion"], attunement: "" },
              { name: "Elven Chain", keyword: ["armor","elven chain"], attunement: "" },
              { name: "Failed Experiment Wand", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Far Realm Shard", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Figurine of Wondrous Power", keyword: ["figurine"], attunement: "" },
              { name: "Flame Tongue", keyword: ["weapon","melee"], attunement: ", [requires attunement]" },
              { name: "Flayer Slayer", keyword: ["greataxe"], attunement: ", [requires attunement]" },
              { name: "Flying Chariot", keyword: ["wondrous"], attunement: "" },
              { name: "Folding Boat", keyword: ["wondrous"], attunement: "" },
              { name: "Fulminating Treatise", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Guantlets of Flaming Fury", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Gem of Seeing", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Ghost Lantern", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Giant Slayer", keyword: ["weapon","any"], attunement: "" },
              { name: "Glamoured Studded Leather", keyword: ["studded leather"], attunement: "" },
              { name: "Gulthias Staff", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Handy Haversack", keyword: ["wondrous"], attunement: "" },
              { name: "Heart Weaver's Primer", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Helm of Teleportation", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Helm of the Gods", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Horn of Blasting", keyword: ["wondrous"], attunement: "" },
              { name: "Horn of Valhalla", keyword: ["horn of valhalla","rare"], attunement: "" },
              { name: "Horseshoes of Speed", keyword: ["wondrous"], attunement: "" },
              { name: "Iggwilv's Horn", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Instrument of the Bards", keyword: ["instrument of bards","rare"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ioun Stone", keyword: ["ioun","rare"], attunement: ", [requires attunement]" },
              { name: "Iron Bands of Billaro", keyword: ["wondrous"], attunement: "" },
              { name: "Kagonesti Forest Shroud", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Libram of Souls and Flesh", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Luminious War Pick", keyword: ["war pick"], attunement: ", [requires attunement]" },
              { name: "Lyre of Building", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mace of Disruption", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Mace of Smiting", keyword: ["mace"], attunement: "" },
              { name: "Mace of Terror", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Mantle of Spell Resistance", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Master's Amulet", keyword: ["wondrous"], attunement: "" },
              { name: "Mind Blade", keyword: ["weapon","any sword"], attunement: ", [requires attunement by a specific mind or one of its thralls]" },
              { name: "Mind Crystal", keyword: ["mind crystal","rare"], attunement: "" },
              { name: "Mind Lash", keyword: ["whip"], attunement: ", [requires attunemnet by a Mind Flayer]" },
              { name: "Mithral Half Plate", keyword: ["wondrous"], attunement: "" },
              { name: "Mizzium Armor", keyword: ["armor","MH not hide"], attunement: "" },
              { name: "Mizzium Mortar", keyword: ["wondrous"], attunement: "" },
              { name: "Molten Bronze Skin", keyword: ["armor","plates"], attunement: ", [requires attunement]" },
              { name: "Moon Sickles", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Necklace of Fireballs", keyword: ["dose","necklace of fireball"], attunement: "" },
              { name: "Necklace of Prayer Beads", keyword: ["prayer beads"], attunement: ", [requires attunement by a Cleric, Druid, or Paladin]" },
              { name: "Netherese Ring of Protection", keyword: ["ring"], attunement: "" },
              { name: "Oil of Etherealness", keyword: ["potion"], attunement: "" },
              { name: "Outer Essence Shard", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Pariah's Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Periapt of Proof Against Poison", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Piercer", keyword: ["shortsword"], attunement: ", [requires attunement]" },
              { name: "Planecaller's Codex", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Portable Hole", keyword: ["wondrous"], attunement: "" },
              { name: "Potion of Aqueous Form", keyword: ["potion"], attunement: "" },
              { name: "Potion of Clairvoyance", keyword: ["potion"], attunement: "" },
              { name: "Potion of Diminution", keyword: ["potion"], attunement: "" },
              { name: "Potion of Gaseous Form", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","rare"], attunement: "" },
              { name: "Potion of Heroism", keyword: ["potion"], attunement: "" },
              { name: "Potion of Invisibility", keyword: ["potion"], attunement: "" },
              { name: "Potion of Invulnerability", keyword: ["potion"], attunement: "" },
              { name: "Potion of Mind Reading", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["superior"], attunement: "" },
              { name: "Protective Verses", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Quaal's Feather Token", keyword: ["feather token", "rare"], attunement: "" },
              { name: "Reveler's Concertina", keyword: ["wondrous"], attunement: ", [requires attunement by a Bard]" },
              { name: "Rhythm-Maker's Drum +2", keyword: ["wondrous"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ring of Animal Influence", keyword: ["ring"], attunement: "" },
              { name: "Ring of Evasion", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Feather Falling", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Free Action", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Protection +1", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Resistance", keyword: ["ring","resistance"], attunement: "" },
              { name: "Ring of Spell Storing", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of the Ram", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of X-Ray Visions", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Robe of Eyes", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Rod of Rulership", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of the Pact Keeper +2", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Rope of Entanglement", keyword: ["wondrous"], attunement: "" },
              { name: "Scaled Ornament (Stirring)", keyword: ["wondrous"], attunement: ",[requires attunement]" },
              { name: "Scorpion Armor", keyword: ["plate"], attunement: ", [requires attunement]" },
              { name: "Scroll of Protection", keyword: ["scroll of protection"], attunement: "" },
              { name: "Sadowfell Brand Tatto", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Shadowfell Shard", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Shield of Far Sight", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield of Missile Attraction", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield +2", keyword: ["armor","shield"], attunement: "" },
              { name: "Siren Song Lyre", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Spell Scroll", keyword: ["scroll","4th level","5th level"], attunement: "" },
              { name: "Spelljamming Helm", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Spellwrought Tattoo", keyword: ["tattoo","scroll","4th level","5th level"], attunement: "" },
              { name: "Spider Staff", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Bard, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Charming", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Defense", keyword: ["staff"], attunement: ", [requires attunemnet by a Bard, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Healing", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, or Druid]" },
              { name: "Staff of Swarming Insects", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of the Woodlands", keyword: ["quarterstaff"], attunement: ",  [requires attunement by a Druid]" },
              { name: "Staff of Withering", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Cleric, Druid, or Warlock]" },
              { name: "Stone of Controlling Earth Elemenetals", keyword: ["wondrous"], attunement: "" },
              { name: "Sunblade", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Sunforger", keyword: ["warhammer"], attunement: ", [requires attunement]" },
              { name: "Sword of Life Stealing", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Sword of Wounding", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Tentacle Rod", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Two-Birds Sling", keyword: ["sling"], attunement: "" },
              { name: "Ventilating Lungs", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Vicious Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Wand of Binding", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Enemy Detection", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Fear", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Fireballs", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Lightning Bolts", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Paralysis", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of the War Mage +2", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Winter", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Wonder", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Weapon +2", keyword: ["weapon","any"], attunement: "" },
              { name: "Weird Tank", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Wings of Flying", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Wraps of Unarmed Power +2", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa +2", keyword: ["yklwa"], attunement: "" },
            ],
            veryRare: [
              { name: "Absorbing Tattoo", keyword: ["potion","resistance"], attunement: ", [requires attunement]" },
              { name: "All-Purpose Tool +3", keyword: ["wondrous"], attunement: ", [requires attunement by an Artificer]" },
              { name: "Amethyst Lodestone", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Ammunition of Slaying", keyword: ["weapon","ammunition","slaying"], attunement: "" },
              { name: "Ammunition +3", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Amulet of the Black Skull", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Amulet of the Devout +3", keyword: ["wondrous"], attunement: ", [requires attunement by a Cleric or Paladin]" },
              { name: "Amulet of the Planes", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Animated Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Arcane Grimoire +3", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Arcane Propulsion Arm", keyword: ["wondrous"], attunement: ", [requires attunement by a creature missing a hand or an arm]" },
              { name: "Armor +2", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Bag of Devouring", keyword: ["wondrous"], attunement: "" },
              { name: "Barrier Tattoo", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Battle Standard of Infernal Power", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Belt of Giant Strength", keyword: ["belt of giant strength","very rare"], attunement: ", [requires attunement]" },
              { name: "Bloodwell Vial +3", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer]" },
              { name: "Boomerang +3", keyword: ["boomerang"], attunement: "" },
              { name: "Candle of Invocation", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cape of Enlargement", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Carpet of Flying", keyword: ["carpet"], attunement: "" },
              { name: "Cauldron of Rebirth", keyword: ["wondrous"], attunement: ", [requires attunement by a Druid or Warlock]" },
              { name: "Chronolometer", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cloak of Arachnida", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Crystal Ball", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Crystalline Chronicle", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Dancing Sword", keyword: ["weapon","any sword"], attunement: ", [requires attunement]" },
              { name: "Demon Armor", keyword: ["armor","light","medium","heavy"], attunement: ", [requires attunement]" },
              { name: "Devastation Orb", keyword: ["wondrous"], attunement: "" },
              { name: "Dimensional Loop", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Dragon Scale Mail", keyword: ["scale mail","dragon"], attunement: ", requires attunement" },
              { name: "Dragon Vessel (Wakened)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Dragonhide Belt +3", keyword: ["wondrous"], attunement: ", [requires attunement by a Monk]" },
              { name: "Dragon's Wrath Weapon (Wakened)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dragon Touched Focus (Wakened)", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Dwarven Plate", keyword: ["armor","heavy plate"], attunement: "" },
              { name: "Dwarven Thrower", keyword: ["warhammer"], attunement: ", [requires attunement by a Dwarf or a Creature attuned to a Belt of Dwarvenkind]" },
              { name: "Dyrrn's Tentacle Whip", keyword: ["whip"], attunement: ", [requires attunement]" },
              { name: "Efreeti Bottle", keyword: ["wondrous"], attunement: "" },
              { name: "Energy Bow", keyword: ["weapon","string"], attunement: ", requires attunement" },
              { name: "Executioner's Axe", keyword: ["weapon","all axe"], attunement: "" },
              { name: "Far Gear", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Figurine of Wondrous Power", keyword: ["obsidian steed"], attunement: "" },
              { name: "Fish Suit", keyword: ["wondrous"], attunement: "" },
              { name: "Flying Citadel Helm", keyword: ["wondrous"], attunement: ", [requires attunemet by a Spellcaster]" },
              { name: "Frost Brand", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Ghost Step Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Hat of Many Spells", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Helm of Brilliance", keyword: ["brilliance"], attunement: ", [requires attunement]" },
              { name: "Helm of Devil Command", keyword: ["wondrous"], attunement: ", [requires attunement by a creature that can speak Infernal]" },
              { name: "Horn of Valhalla", keyword: ["horn of valhalla","very rare"], attunement: "" },
              { name: "Horseshoes of a Zephyr", keyword: ["wondrous"], attunement: "" },
              { name: "Illusionist's Bracers", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Instrument of the Bards", keyword: ["instrument of the bard","very rare"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ioun Stone", keyword: ["ioun","very rare"], attunement: ", [requires attunement]" },
              { name: "Kyrzin's Ooze", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Lifewell Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Living Armor", keyword: ["armor","light","medium","heavy"], attunement: ", [requires attunement]" },
              { name: "Lute of Thunderous Thumping", keyword: ["wondrous"], attunement: "" },
              { name: "Manual of Bodily Health", keyword: ["wondrous"], attunement: "" },
              { name: "Manual of Gainful Excercise", keyword: ["wondrous"], attunement: "" },
              { name: "Manual of Golems", keyword: ["golem"], attunement: "" },
              { name: "Manual of Quickness of Action", keyword: ["wondrous"], attunement: "" },
              { name: "Marvelous Pigments", keyword: ["wondrous"], attunement: "" },
              { name: "Mindvlasting Cap", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mindguard Crown", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mirror of Life Trapping", keyword: ["wondrous"], attunement: "" },
              { name: "Mirror of Reflected Pasts", keyword: ["wondrous"], attunement: "" },
              { name: "Moon Sickle", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Mudslick Tower", keyword: ["wondrous"], attunement: "" },
              { name: "Niko's Mace", keyword: ["mace"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Nine Lives Stealer", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Oathbow", keyword: ["weapon","string"], attunement: ", [requires attunement]" },
              { name: "Oil of Sharpness", keyword: ["potion"], attunement: "" },
              { name: "Peregrine Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Potion of Flying", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","very rare"], attunement: "" },
              { name: "Potion of Greater Invisibility", keyword: ["potion"], attunement: "" },
              { name: "Potion of Longevity", keyword: ["potion"], attunement: "" },
              { name: "Potion of Speed", keyword: ["potion"], attunement: "" },
              { name: "Potion of Vitality", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["supreme"], attunement: "" },
              { name: "Quarterstaff of the Acrobat", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Rhythm-Maker's Drum +3", keyword: ["wondrous"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ring of Protection +2", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Regeneration", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Shooting Stars", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Telekinesis", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Robe of Scintillating Colors", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Robe of Stars", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Rod of Absorption", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Alertness", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Security", keyword: ["rod"], attunement: "" },
              { name: "Rod of the Pact Keeper +3", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Rotor of Return", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Sapphire Buckler", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Scaled Ornament (Wakened)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Scimiat of Speed", keyword: ["scimitar"], attunement: ", [requires attunement]" },
              { name: "Shield of the Cavalier", keyword: ["armor","shield"], attunement: ", {requires attunement}" },
              { name: "Shield +3", keyword: ["armor","shield"], attunement: "" },
              { name: "Sling Bullets of Althemone", keyword: ["sling bullets"], attunement: "" },
              { name: "Speaking Stone", keyword: ["wondrous"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","6th level","7th level","8th level"], attunement: "" },
              { name: "Spellguard Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Spirit Board", keyword: ["wondrous"], attunement: "" },
              { name: "Staff of Fire", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Frost", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Power", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Striking", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Staff of Thunder and Lightning", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Sword of Sharpness", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Sword of Paruns", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Tasha's Creeping Keelboat", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Thunderous Greatclub", keyword: ["greatclub"], attunement: ", [requires attunement]" },
              { name: "Timepiece of Travel", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Tome of Clear Thought", keyword: ["wondrous"], attunement: "" },
              { name: "Tome of Leadership and Influence", keyword: ["wondrous"], attunement: "" },
              { name: "Tome of Understanding", keyword: ["wondrous"], attunement: "" },
              { name: "Voyager Staff", keyword: ["staff"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Polymorph", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of the War Mage +3", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Weapon +3", keyword: ["weapon","any"], attunement: "" },
              { name: "Wheel of Stars", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Wraps of Unarmed Power +3", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa +3", keyword: ["yklwa"], attunement: "" },
            ],
            legendary: [
              { name: "Apparatus of Kwalish", keyword: ["wondrous"], attunement: "" },
              { name: "Armor of Invulnerability", keyword: ["plate"], attunement: ", [requires attunement]" },
              { name: "Armor +3", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Belashyrra's Beholder Crown", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Belt of Giant Strength", keyword: ["belt of giant strength","legendary"], attunement: ", [requires attunement]" },
              { name: "Black Dragon Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Blackrazor", keyword: ["greatsword"], attunement: ", [requires attunement by a Creature of a Non-Lwaful Alignment]" },
              { name: "Blood Fury Tattoo", keyword: ["tattoo"], attunement: ", [requires attunement]" },
              { name: "Blue Dragon Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Bookmark", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Cloak of Invisibility", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Crystal Ball of Mind Reading", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Crystal Ball of Telepathy", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Crystal Ball of True Seeing", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Cubic Gate", keyword: ["wondrous"], attunement: "" },
              { name: "Deck of Many Things", keyword: ["wondrous"], attunement: "" },
              { name: "Defender", keyword: ["weapon","melee"], attunement: ", [requires attunement]" },
              { name: "Dragon Vessel (Ascendant)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Dragon Lance", keyword: ["weapon","long"], attunement: ", [requires attunement]" },
              { name: "Dragon's Wrath Weapon (Ascendant)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dragon-Touched Focus (Ascendant)", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Drown", keyword: ["trident"], attunement: ", [requires attunement]" },
              { name: "Efreeti Chain", keyword: ["armor","elven chain"], attunement: ", [requires attunement]" },
              { name: "Fane-Eater", keyword: ["battleaxe"], attunement: ", [requires attunement by a Evil Cleric or Paladin]" },
              { name: "Flail of Tiamat", keyword: ["flail"], attunement: ", [requires attunement]" },
              { name: "Gold Canary Figurine of Wondrous Power", keyword: ["wondrous"], attunement: "" },
              { name: "Greater Silver Sword", keyword: ["greatsword"], attunement: ", [requires attunement by a creature that has psionic ability]" },
              { name: "Green Dragon Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Hammer of Thunderbolts", keyword: ["weapon","hammer"], attunement: ", [requires attunement]" },
              { name: "Hazirawn", keyword: ["greatsword"], attunement: ", [requires attunement]" },
              { name: "Helm of Disjunction", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Hither-Thither Staff", keyword: ["staff"], attunement: "" },
              { name: "Holy Avenger", keyword: ["weapon","any"], attunement: ", [requires attunement by a Paladin]" },
              { name: "Holy Symbol of Ravenkind", keyword: ["wondrous"], attunement: ", [requires attunement by a Cleric or Paladin of Good Alignment]" },
              { name: "Horn of Beckoning Death", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Horn of Valhalla", keyword: ["horn of valhalla","legendary"], attunement: "" },
              { name: "Icon of Ravenloft", keyword: ["wondrous"], attunement: ", [requires attunement by a Creature of Good Alignment]" },
              { name: "Infernal Tack", keyword: ["wondrous"], attunement: ", [requires attunement by a Creature of Evil Alignment]" },
              { name: "Instrument of the Bards", keyword: ["instrument of the bards","legendary"], attunement: ", [requires attunement by a Bard]" },
              { name: "Ioun Stone", keyword: ["ioun","legendary"], attunement: ", [requires attunement]" },
              { name: "Iron Flask", keyword: ["iron flask"], attunement: "" },
              { name: "Ironfang", keyword: ["warpick"], attunement: ", [requires attunement]" },
              { name: "Lost Crown of Besilmer", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Luck Blade", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Matalotok", keyword: ["warhammer"], attunement: ", [requires attunement]" },
              { name: "Moonblade", keyword: ["weapon","any sword"], attunement: ", [requires attunement by a Creature of the Weapon's choice]" },
              { name: "Nepenthe", keyword: ["longsword"], attunement: ", [requires attunement by a Paladin]" },
              { name: "Nightbringer", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Obsidian Flint Dragon Plate", keyword: ["plate"], attunement: "" },
              { name: "Orcsplitter", keyword: ["greataxe"], attunement: ", [requires attunement by a Good-Aligned Dwarf, Fighter, or Paladin]" },
              { name: "Plate Armor of Etherealness", keyword: ["armor","plates"], attunement: ", [requires attunement]" },
              { name: "Platinum Scarf", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Potion of Dragon's Majesty", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","legendary"], attunement: "" },
              { name: "Pyxis of Pandemonium", keyword: ["wondrous"], attunement: "" },
              { name: "Rakdos Riteknife", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Red Dragon Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Red Wizard Blade", keyword: ["dagger"], attunement: "" },
              { name: "Ring of Air Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Djinni Summoning", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Earth Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Fire Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"},
              { name: "Ring of Invisibility", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Protection +3", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Spell Turning", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Three Wishes", keyword: ["ring"], attunement: "" },
              { name: "Ring of Water Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Robe of the Archmagi", keyword: ["wondrous"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Rod of Lordly Might", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Resurrection", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Ruby Weave Gem", keyword: ["wondrous"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Scaled Ornament (Ascendant)", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Scarab of Protection", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Scroll of Titan Summoning", keyword: ["scroll"], attunement: "" },
              { name: "Shield of the Hidden Lord", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Sovereign Glue", keyword: ["wondrous"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","9th level"], attunement: "" },
              { name: "Sphere of Annihilation", keyword: ["wondrous"], attunement: "" },
              { name: "Staff of the Magi", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Sunsword", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Sword of Answering", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Tablet of Reawakening", keyword: ["wondrous"], attunement: "" },
              { name: "Talisman of Pure Good", keyword: ["wondrous"], attunement: ", [requires attunement by a Cleric or Paladin]" },
              { name: "Talisman of the Sphere", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Talisman of Ultimate Evil", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Tinderstrike", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Tome of the Stilled Tongue", keyword: ["wondrous"], attunement: ", [requires attunement by a Wizard]" },
              { name: "Topaz Annihilator", keyword: ["firearm"], attunement: ", [requires attunement]" },
              { name: "Universal Solvent", keyword: ["wondrous"], attunement: "" },
              { name: "Vorpal Sword", keyword: ["weapon","vorpal"], attunement: ", [requires attunement]" },
              { name: "Wave", keyword: ["trident"], attunement: ", [requires attunement by a Creature that worships a god of the sea]" },
              { name: "Well of Many Worlds", keyword: ["wondrous"], attunement: "" },
              { name: "Whelm", keyword: ["warhammer"], attunement: ", [requires attunement by a dwarf]" },
              { name: "White Dragon Mask", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Windvane", keyword: ["spear"], attunement: ", [requires attunement]" },
            ],
          },
          armorSeller: {
            common: [
              { name: "Armor of Gleaming", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Cast Off Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Shield of Expression", keyword: ["armor","shield"], attunement: "" },
              { name: "Smoldering Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
            ],
            uncommon: [
              { name: "Adamantine Armor", keyword: ["armor","MH not hide"], attunement: "" },
              { name: "Barrier Tattoo", keyword: ["tattoo) (AC = 12 + Dexterity Modifier"], attunement: ", [requires attunement]" },
              { name: "Dragonhide Belt +1", keyword: ["wondrous"], attunement: ", [requires attunement]" },
              { name: "Mariner's Armor", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Mind Carapace Armor", keyword: ["armor","heavy"], attunement: ", [requires attunement by a specific individual]" },
              { name: "Mithiral Armor", keyword: ["MH not hide"], attunement: "" },
              { name: "Sentinel Shield", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield +1", keyword: ["armor","shield"], attunement: "" },
            ],
            rare: [
              { name: "Armor of Resistance", keyword: ["armor","light","medium","heavy","resistance"], attunement: ", [requires attunement]" },
              { name: "Armor of Vulnerability", keyword: ["armor","light","medium","heavy","bps resistance"], attunement: ", [requires attunement]" },
              { name: "Armor +1", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Arrow-Catching Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Barrier Tattoo", keyword: ["tattoo) (15 + Dexterity Modifier [max +2]"], attunement: ", [requires attunement]" },
              { name: "Demon Skin", keyword: ["armor","heavy"], attunement: ", [requires attunement]" },
              { name: "Dragonguard", keyword: ["breastplate"], attunement: "" },
              { name: "Elven Chain", keyword: ["armor","elven chain"], attunement: "" },
              { name: "Glamoured Studded Leather", keyword: ["studded leather"], attunement: "" },
              { name: "Mizzium Armor", keyword: ["armor","MH not hide"], attunement: "" },
              { name: "Molten Bronze Skin", keyword: ["armor","plates"], attunement: ", [requires attunement]" },
              { name: "Pariah's Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Scorpion Armor", keyword: ["plate"], attunement: ", [requires attunement]" },
              { name: "Shield of Far Sight", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield of Missile Attraction", keyword: ["armor","shield"], attunement: "" },
              { name: "Shield +2", keyword: ["armor","shield"], attunement: "" },
            ],
            veryRare: [
              { name: "Animated Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Armor +2", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Demon Armor", keyword: ["armor","light","medium","heavy"], attunement: ", [requires attunement]" },
              { name: "Dragon Scale Mail", keyword: ["scale mail","dragon"], attunement: ", requires attunement" },
              { name: "Dwarven Plate", keyword: ["armor","heavy plate"], attunement: "" },
              { name: "Living Armor", keyword: ["armor","light","medium","heavy"], attunement: ", [requires attunement]" },
              { name: "Sapphire Buckler", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
              { name: "Shield of the Cavalier", keyword: ["armor","shield"], attunement: ", {requires attunement}" },
              { name: "Shield +3", keyword: ["armor","shield"], attunement: "" },
              { name: "Spellguard Shield", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
            ],
            legendary: [
              { name: "Armor of Invulnerability", keyword: ["plate"], attunement: ", [requires attunement]" },
              { name: "Armor +3", keyword: ["armor","light","medium","heavy"], attunement: "" },
              { name: "Efreeti Chain", keyword: ["armor","elven chain"], attunement: ", [requires attunement]" },
              { name: "Obsidian Flint Dragon Plate", keyword: ["plate"], attunement: "" },
              { name: "Plate Armor of Etherealness", keyword: ["armor","plates"], attunement: ", [requires attunement]" },
              { name: "Shield of the Hidden Lord", keyword: ["armor","shield"], attunement: ", [requires attunement]" },
            ],
          },
          potionSeller: {
            common: [
              { name: "Potion of Climbing", keyword: ["potion"], attunement: "" },
              { name: "Potion of Comprehension", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["basic"], attunement: "" },
            ],
            uncommon: [
              { name: "Bottled Breath", keyword: ["potion"], attunement: "" },
              { name: "Oil of Slipperiness", keyword: ["potion"], attunement: "" },
              { name: "Philter of Love", keyword: ["potion"], attunement: "" },
              { name: "Potion of Animal Friendship", keyword: ["potion"], attunement: "" },
              { name: "Potion of Fire Breath", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","uncommon"], attunement: "" },
              { name: "Potion of Growth", keyword: ["potion"], attunement: "" },
              { name: "Potion of Poison", keyword: ["potion"], attunement: "" },
              { name: "Potion of Polychromy", keyword: ["potion"], attunement: "" },
              { name: "Potion of Psionic Fortitude", keyword: ["potion"], attunement: "" },
              { name: "Potion of Pugilism", keyword: ["potion"], attunement: "" },
              { name: "Potion of Resistance", keyword: ["potion","resistance"], attunement: "" },
              { name: "Potion of Water Breathing", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["greater"], attunement: "" },
            ],
            rare: [
              { name: "Elixir of Health", keyword: ["potion"], attunement: "" },
              { name: "Oil of Etherealness", keyword: ["potion"], attunement: "" },
              { name: "Potion of Aqueous Form", keyword: ["potion"], attunement: "" },
              { name: "Potion of Clairvoyance", keyword: ["potion"], attunement: "" },
              { name: "Potion of Diminution", keyword: ["potion"], attunement: "" },
              { name: "Potion of Gaseous Form", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","rare"], attunement: "" },
              { name: "Potion of Heroism", keyword: ["potion"], attunement: "" },
              { name: "Potion of Invisibility", keyword: ["potion"], attunement: "" },
              { name: "Potion of Invulnerability", keyword: ["potion"], attunement: "" },
              { name: "Potion of Mind Reading", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["superior"], attunement: "" },
            ],
            veryRare: [
              { name: "Absorbing Tattoo", keyword: ["potion","resistance"], attunement: ", [requires attunement]" },
              { name: "Oil of Sharpness", keyword: ["potion"], attunement: "" },
              { name: "Potion of Flying", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","very rare"], attunement: "" },
              { name: "Potion of Greater Invisibility", keyword: ["potion"], attunement: "" },
              { name: "Potion of Longevity", keyword: ["potion"], attunement: "" },
              { name: "Potion of Speed", keyword: ["potion"], attunement: "" },
              { name: "Potion of Vitality", keyword: ["potion"], attunement: "" },
              { name: "Potion of Healing", keyword: ["supreme"], attunement: "" },
            ],
            legendary: [
              { name: "Potion of Dragon's Majesty", keyword: ["potion"], attunement: "" },
              { name: "Potion of Giant Strength", keyword: ["potion","giant strength","legendary"], attunement: "" },
            ],
          },
          ringSeller: {
            common: [
              { name: "Band of Loyalty", keyword: ["ring"], attunement: ", [requires attunement]" },
            ],
            uncommon: [
              { name: "Ring of Jumping", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Mind Shielding", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Swimming", keyword: ["ring"], attunement: "" },
              { name: "Ring of the Orator", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Warmth", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Water Walking", keyword: ["ring"], attunement: "" },
              { name: "Ring of Shared Suffering", keyword: ["ring"], attunement: ", [requires attunement]" },
            ],
            rare: [
              { name: "Netherese Ring of Protection", keyword: ["ring"], attunement: "" },
              { name: "Ring of Animal Influence", keyword: ["ring"], attunement: "" },
              { name: "Ring of Evasion", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Feather Falling", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Free Action", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Protection +1", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Resistance", keyword: ["ring","resistance"], attunement: "" },
              { name: "Ring of Spell Storing", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of the Ram", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of X-Ray Visions", keyword: ["ring"], attunement: ", [requires attunement]" },
            ],
            veryRare: [
              { name: "Ring of Protection +2", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Regeneration", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Shooting Stars", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Telekinesis", keyword: ["ring"], attunement: ", [requires attunement]" },
            ],
            legendary: [
              { name: "Ring of Air Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Djinni Summoning", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Earth Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Fire Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]"},
              { name: "Ring of Invisibility", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Protection +3", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Spell Turning", keyword: ["ring"], attunement: ", [requires attunement]" },
              { name: "Ring of Three Wishes", keyword: ["ring"], attunement: "" },
              { name: "Ring of Water Elemental Command", keyword: ["ring"], attunement: ", [requires attunement]" },
            ],
          },
          scrollSeller: {
            common: [
              { name: "Spell Scroll", keyword: ["scroll","cantrip","1st level"], attunement: "" },
              { name: "Spellwrought Tattoo", keyword: ["scroll","cantrip","1st level"], attunement: "" },
            ],
            uncommon: [
              { name: "Spell Scroll", keyword: ["scroll","2nd level","3rd level"], attunement: "" },
              { name: "Spell Wrought Tattoo", keyword: ["scroll","2nd level","3rd level"], attunement: "" },
            ],
            rare: [
              { name: "Scroll of Protection", keyword: ["scroll of protection"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","4th level","5th level"], attunement: "" },
              { name: "Spellwrought Tattoo", keyword: ["tattoo","scroll","4th level","5th level"], attunement: "" },
            ],
            veryRare: [
              { name: "Spell Scroll", keyword: ["scroll","6th level","7th level","8th level"], attunement: "" },
            ],
            legendary: [
              { name: "Scroll of Titan Summoning", keyword: ["scroll"], attunement: "" },
              { name: "Spell Scroll", keyword: ["scroll","9th level"], attunement: "" },
            ],
          },
          wandSeller: {
            common: [
              { name: "Imbued Wood Focus", keyword: ["wand","wood focus"], attunement: ", [requires attunement]" },
              { name: "Wand of Conducting", keyword: ["wand"], attunement: "" },
              { name: "Wand of Pyrotechnics", keyword: ["wand"], attunement: "" },
              { name: "Wand of Scowls", keyword: ["wand"], attunement: "" },
              { name: "Wand of Smiles", keyword: ["wand"], attunement: "" },
              { name: "Wand Sheath", keyword: ["wondrous"], attunement: ", [requires attunement by a Warforged]" },
            ],
            uncommon: [
              { name: "Wand of Magic Detection", keyword: ["wand"], attunement: "" },
              { name: "Wand of Magic Missiles", keyword: ["wand"], attunement: "" },
              { name: "Wand of Secrets", keyword: ["wand"], attunement: "" },
              { name: "Wand of the War Mage +1", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Web", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
            ],
            rare: [
              { name: "Failed Experiment Wand", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Binding", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Enemy Detection", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Fear", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Fireballs", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Lightning Bolts", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Paralysis", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of the War Mage +2", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of Winter", keyword: ["wand"], attunement: ", [requires attunement]" },
              { name: "Wand of Wonder", keyword: ["wand"], attunement: ", [requires attunement]" },
            ],
            veryRare: [
              { name: "Wand of Polymorph", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Wand of the War Mage +3", keyword: ["wand"], attunement: ", [requires attunement by a Spellcaster]" },
            ],
            legendary: [
              // { name: "", keyword: [], attunement: ""},
            ],
          },
          weaponSeller: {
            common: [
              { name: "Armblade", keyword: ["weapon","one-handed melee"], attunement: ", [requires attunement by a Warforged]" },
              { name: "Moontouched Sword", keyword: ["weapon","bladed"], attunement: "" },
              { name: "Silvered Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Staff of Adornment", keyword: ["staff"], attunement: "" },
              { name: "Staff of Birdcalls", keyword: ["staff"], attunement: "" },
              { name: "Staff of Flowers", keyword: ["staff"], attunement: "" },
              { name: "Sylvan Talon", keyword: ["weapon","pointed"], attunement: ", [requires attunement]" },
              { name: "Unbreakable Arrow", keyword: ["arrow"], attunement: "" },
              { name: "Walloping Ammunition", keyword: ["weapon","ammunition"], attunement: "" },
            ],
            uncommon: [
              { name: "Adamantine Weapon", keyword: ["weapon","ammunition","melee"], attunement: "" },
              { name: "Ammunition +1", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Blood Spear", keyword: ["spear"], attunement: ", [requires attunement]" },
              { name: "Crusader's Shortsword", keyword: ["shortsword"], attunement: ", [requires attunement]" },
              { name: "Dragon Wrath Weapon (Slumbering)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Hellfire Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Hew", keyword: ["battleaxe"], attunement: "" },
              { name: "Immovable Rod", keyword: ["rod"], attunement: "" },
              { name: "Javelin of Lightning", keyword: ["javelin"], attunement: "" },
              { name: "Lightbringer", keyword: ["mace"], attunement: "" },
              { name: "Moon Sickle +1", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Rod of the Pact Keeper +1", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Seeker Dart", keyword: ["dart"], attunement: "" },
              { name: "Skyblinder Staff", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Staff of the Adder", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Staff of the Python", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Storm Boomerang", keyword: ["boomerang"], attunement: "" },
              { name: "Sword of Vengeance", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Trident of Fish Command", keyword: ["trident"], attunement: ", [requires attunement]" },
              { name: "Weapon of Warning", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Weapon +1", keyword: ["weapon","any"], attunement: "" },
              { name: "Wraps of Unarmed Power +1", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa", keyword: ["Yklwa"], attunement: "" },
            ],
            rare: [
              { name: "Ammunition +2", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Berserker Axe", keyword: ["weapon","axe"], attunement: ", [requires attunement]" },
              { name: "Boomerang +2", keyword: ["boomerang"], attunement: "" },
              { name: "Crystal Blade", keyword: ["weapon","any sword"], attunement: ", [requires attunement]" },
              { name: "Dagger of Venom", keyword: ["dagger"], attunement: "" },
              { name: "Devotee's Censer", keyword: ["flail"], attunement: ", [requires attunement by a Cleric or Paladin]" },
              { name: "Dragon Slayer", keyword: ["weapon","any"], attunement: "" },
              { name: "Dragon's Wrath Weapon (Stirring)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dragontooth Dagger", keyword: ["dagger"], attunement: "" },
              { name: "Dragon Wing Bow", keyword: ["weapon","any bow"], attunement: ", [requires attunement]" },
              { name: "Flame Tongue", keyword: ["weapon","melee"], attunement: ", [requires attunement]" },
              { name: "Flayer Slayer", keyword: ["greataxe"], attunement: ", [requires attunement]" },
              { name: "Giant Slayer", keyword: ["weapon","any"], attunement: "" },
              { name: "Gulthias Staff", keyword: ["staff"], attunement: ", [requires attunement]" },
              { name: "Luminious War Pick", keyword: ["war pick"], attunement: ", [requires attunement]" },
              { name: "Mace of Disruption", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Mace of Smiting", keyword: ["mace"], attunement: "" },
              { name: "Mace of Terror", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Mind Blade", keyword: ["weapon","any sword"], attunement: ", [requires attunement by a specific mind or one of its thralls]" },
              { name: "Mind Lash", keyword: ["whip"], attunement: ", [requires attunemnet by a Mind Flayer]" },
              { name: "Moon Sickles", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Piercer", keyword: ["shortsword"], attunement: ", [requires attunement]" },
              { name: "Rod of Rulership", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of the Pact Keeper +2", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Spider Staff", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Bard, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Charming", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Defense", keyword: ["staff"], attunement: ", [requires attunemnet by a Bard, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Healing", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, or Druid]" },
              { name: "Staff of Swarming Insects", keyword: ["staff"], attunement: ", [requires attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of the Woodlands", keyword: ["quarterstaff"], attunement: ",  [requires attunement by a Druid]" },
              { name: "Staff of Withering", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Cleric, Druid, or Warlock]" },
              { name: "Sunblade", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Sunforger", keyword: ["warhammer"], attunement: ", [requires attunement]" },
              { name: "Sword of Life Stealing", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Sword of Wounding", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Tentacle Rod", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Two-Birds Sling", keyword: ["sling"], attunement: "" },
              { name: "Vicious Weapon", keyword: ["weapon","any"], attunement: "" },
              { name: "Weapon +2", keyword: ["weapon","any"], attunement: "" },
              { name: "Wraps of Unarmed Power +2", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa +2", keyword: ["yklwa"], attunement: "" },
            ],
            veryRare: [
              { name: "Ammunition of Slaying", keyword: ["weapon","ammunition","slaying"], attunement: "" },
              { name: "Ammunition +3", keyword: ["weapon","ammunition"], attunement: "" },
              { name: "Boomerang +3", keyword: ["boomerang"], attunement: "" },
              { name: "Dancing Sword", keyword: ["weapon","any sword"], attunement: ", [requires attunement]" },
              { name: "Dragon's Wrath Weapon (Wakened)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Dwarven Thrower", keyword: ["warhammer"], attunement: ", [requires attunement by a Dwarf or a Creature attuned to a Belt of Dwarvenkind]" },
              { name: "Dyrrn's Tentacle Whip", keyword: ["whip"], attunement: ", [requires attunement]" },
              { name: "Energy Bow", keyword: ["weapon","string"], attunement: ", requires attunement" },
              { name: "Executioner's Axe", keyword: ["weapon","all axe"], attunement: "" },
              { name: "Frost Brand", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Moon Sickle", keyword: ["sickle"], attunement: ", [requires attunement by a Druid or Ranger]" },
              { name: "Niko's Mace", keyword: ["mace"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Nine Lives Stealer", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Oathbow", keyword: ["weapon","string"], attunement: ", [requires attunement]" },
              { name: "Quarterstaff of the Acrobat", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Rod of Absorption", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Alertness", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Security", keyword: ["rod"], attunement: "" },
              { name: "Rod of the Pact Keeper +3", keyword: ["rod"], attunement: ", [requires attunement by a Warlock]" },
              { name: "Scimiat of Speed", keyword: ["scimitar"], attunement: ", [requires attunement]" },
              { name: "Sling Bullets of Althemone", keyword: ["sling bullets"], attunement: "" },
              { name: "Staff of Fire", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Frost", keyword: ["staff"], attunement: ", [requires attunement by a Druid, Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Power", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Staff of Striking", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Staff of Thunder and Lightning", keyword: ["quarterstaff"], attunement: ", [requires attunement]" },
              { name: "Sword of Sharpness", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Sword of Paruns", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Thunderous Greatclub", keyword: ["greatclub"], attunement: ", [requires attunement]" },
              { name: "Voyager Staff", keyword: ["staff"], attunement: ", [requires attunement by a Spellcaster]" },
              { name: "Weapon +3", keyword: ["weapon","any"], attunement: "" },
              { name: "Wraps of Unarmed Power +3", keyword: ["wondrous"], attunement: "" },
              { name: "Yklwa +3", keyword: ["yklwa"], attunement: "" },
            ],
            legendary: [
              { name: "Blackrazor", keyword: ["greatsword"], attunement: ", [requires attunement by a Creature of a Non-Lwaful Alignment]" },
              { name: "Bookmark", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Defender", keyword: ["weapon","melee"], attunement: ", [requires attunement]" },
              { name: "Dragon Lance", keyword: ["weapon","long"], attunement: ", [requires attunement]" },
              { name: "Dragon's Wrath Weapon (Ascendant)", keyword: ["weapon","any"], attunement: ", [requires attunement]" },
              { name: "Drown", keyword: ["trident"], attunement: ", [requires attunement]" },
              { name: "Fane-Eater", keyword: ["battleaxe"], attunement: ", [requires attunement by a Evil Cleric or Paladin]" },
              { name: "Flail of Tiamat", keyword: ["flail"], attunement: ", [requires attunement]" },
              { name: "Greater Silver Sword", keyword: ["greatsword"], attunement: ", [requires attunement by a creature that has psionic ability]" },
              { name: "Hammer of Thunderbolts", keyword: ["weapon","hammer"], attunement: ", [requires attunement]" },
              { name: "Hazirawn", keyword: ["greatsword"], attunement: ", [requires attunement]" },
              { name: "Hither-Thither Staff", keyword: ["staff"], attunement: "" },
              { name: "Holy Avenger", keyword: ["weapon","any"], attunement: ", [requires attunement by a Paladin]" },
              { name: "Ironfang", keyword: ["warpick"], attunement: ", [requires attunement]" },
              { name: "Luck Blade", keyword: ["weapon","bladed"], attunement: ", [requires attunement]" },
              { name: "Matalotok", keyword: ["warhammer"], attunement: ", [requires attunement]" },
              { name: "Moonblade", keyword: ["weapon","any sword"], attunement: ", [requires attunement by a Creature of the Weapon's choice]" },
              { name: "Nepenthe", keyword: ["longsword"], attunement: ", [requires attunement by a Paladin]" },
              { name: "Nightbringer", keyword: ["mace"], attunement: ", [requires attunement]" },
              { name: "Orcsplitter", keyword: ["greataxe"], attunement: ", [requires attunement by a Good-Aligned Dwarf, Fighter, or Paladin]" },
              { name: "Rakdos Riteknife", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Red Wizard Blade", keyword: ["dagger"], attunement: "" },
              { name: "Rod of Lordly Might", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Rod of Resurrection", keyword: ["rod"], attunement: ", [requires attunement]" },
              { name: "Staff of the Magi", keyword: ["quarterstaff"], attunement: ", [requires attunement by a Sorcerer, Warlock, or Wizard]" },
              { name: "Sunsword", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Sword of Answering", keyword: ["longsword"], attunement: ", [requires attunement]" },
              { name: "Tinderstrike", keyword: ["dagger"], attunement: ", [requires attunement]" },
              { name: "Topaz Annihilator", keyword: ["firearm"], attunement: ", [requires attunement]" },
              { name: "Vorpal Sword", keyword: ["weapon","vorpal"], attunement: ", [requires attunement]" },
              { name: "Wave", keyword: ["trident"], attunement: ", [requires attunement by a Creature that worships a god of the sea]" },
              { name: "Whelm", keyword: ["warhammer"], attunement: ", [requires attunement by a dwarf]" },
              { name: "Windvane", keyword: ["spear"], attunement: ", [requires attunement]" },
            ],
          }
        };

        const HealingPotions = {
          common: [
            { name: "Potion of Healing", keyword: ["basic"], attunement: "" }
          ],
          uncommon: [
            { name: "Potion of Healing", keyword: ["greater"], attunement: "" }
          ],
          rare: [
            { name: "Potion of Healing", keyword: ["superior"], attunement: "" }
          ],
          veryRare: [
            { name: "Potion of Healing", keyword: ["supreme"], attunement: "" }
          ],
          legendary: [
            { name: "", keyword: ["extra"], attunement: "" }
          ]
        }

        const SubtypePools = {
          weapon: {
            any: ["club", "dagger", "greatclub", "handaxe", "javelin", "lighthammer", "mace", "quarterstaff", "sickle", "spear", "flail", "glaive", "greataxe", "halberd", "lance", "morningstar", "pike", "scimitar", "trident", "warpick", "whip", "maul", "shortsword", "longsword", "greatsword", "warhammer", "battleaxe", "rapier", "dart", "sling", "shortbow", "longbow", "light crossbow", "heavy crossbow", "blowgun", "hand crossbow", "net"],
            melee: ["club", "dagger", "greatclub", "handaxe", "javelin", "lighthammer", "mace", "quarterstaff", "sickle", "spear", "flail", "glaive", "greataxe", "halberd", "lance", "morningstar", "pike", "scimitar", "trident", "warpick", "whip", "maul", "shortsword", "longsword", "greatsword", "warhammer", "battleaxe", "rapier"],
            ranged: ["dart", "sling", "shortbow", "longbow", "light crossbow", "heavy crossbow", "blowgun", "hand crossbow", "net"],
            anySword: ["sickle","scimitar","shortsword","longsword","greatsword","rapier"],
            anyBow: ["shortbow","longbow","light crossbow","heavy crossbow","hand crossbow"],
            bladed: ["glaive","greatsword","longsword","rapier","scimitar","shortsword"],
            vorpal: ["glaive","greatsword","longsword","scimitar"],
            pointed: ["dagger","rapier","scimitar","shortsword","sickle","spear"],
            long: ["lance","pike"],
            hammer: ["maul","warhammer"],
            axe: ["battleaxe","greataxe","halberd"],
            allAxe: ["battleaxe","greataxe","halberd","handaxe"],
            strungBow: ["longbow","shortbow"],
            onehandedMelee: ["club","dagger","handaxe","javelin","lighthammer","mace","sickle","flail","morningstar","scimitar","trident","warpick","whip","shortsword","rapier"],
            ammunition: ["arrow", "bolt", "blowgun needles", "sling bullets"],
            answering: ["longsword) (Answerer - Chaotic Good - Emerald","longsword) (Back Talker - Chaotic Evil - Jet","longsword) (Concluder - Lawful Neutral - Amythyst","longsword) (Last Quip - Chaotic Neutral - Tourmaline","longsword) (Rebutter - Neutral Good - Topaz","longsword) (Replier - Neutral - Peridot","longsword) (Retorter - Lawful Good - Aquamarine","longsword) (Scather - Lawful Evil - Garnet","longsword) (Squelcher - Neutral Evil - Spinel"]
          },
          armor: {
            light: ["padded", "leather", "studded leather"],
            medium: ["hide", "chain shirt", "scale mail", "breastplate", "half plate"],
            heavy: ["ring mail", "chain mail", "splint", "plate"],
            shield: ["light shield", "medium shield", "heavy shield", "tower shield"],
            MHNotHide: ["chain shirt","scale mail","breastplate","half plate","ring mail","chain mail","splint","plate"],
            magicArmor: ["Half Plate +2","Half Plate +2","Plate +2","Plate +2","Studded Leather +3","Studded Leather +3","Breast Plate +3","Breast Plate +3","Splint +3","Splint +3","Half Plate +3","Plate +3"],
            elvenChain: ["chain mail","chain shirt"],
            plates: ["breastplate","half plate","plate"],
            heavyPlate: ["half plate","plate"],
          },
          potion: {
            bpsresistance: ["bludgeoning","piercing","slashing"],
            resistance: ["acid", "cold", "fire", "force", "lightning", "necrotic", "poison", "psychic", "radiant", "thunder"],
            giantStrength: {
              uncommon: ["Hill Giant"],
              rare: ["Frost Giant","Stone Giant","Fire Giant"],
              veryRare: ["Cloud Giant"],
              legendary: ["Storm Giant"],
            },
            healing: {
              common: ["basic"],
              uncommon: ["greater"],
              rare: ["superior"],
              veryRare: ["supreme"]
            }
          },
          ring: {
            resistance: ["acid - pearl","cold tourmaline","fire -garnet","force -sapphire","lightning - citrine","necrotic - jet","poison - amethyst","psychic - jade","radiant - topaz","thunder -spinel"],
          },
          scroll: {
            zero: ["Acid Splash","Blade Ward","Booming Blade","Chill Touch","Control Flames","Create Bonfire","Dancing Lights","Druidcraft","Eldritch Blast","Elementalism","Encode Thoughts","Fire Bolt","Friends","Frostbite","Green-Flame Blade","Guidance","Gust","Infestation","Light","Lightning lure","Mage Hand","Magic Stone","Mending","Message","Mind Sliver","Minor Illusion","Mold Earth","Poison Spray","Prestidigitation","Primal Savagery","Produce Flame","Ray of Frost","Resistance","Sacred Flame","Shape Water","Shillelagh","Shocking Grasp","Sorcerous Burst","Spare the Dying","Starry Wisp","Sword Burst","Thaumaturgy","Thorn Whip","Thunderclap","Toll the Dead","True Strike","Vicious Mockery","Word of Radiance"],
            one: ["Absorb Elements","Alarm","Animal Friendship","Armor of Agathys","Arms of Hadar","Bane","Beast Bond","Bless","Burning Hands","Catapult","Cause Fear","Ceremony","Chaos Bolt","Charm Person","Chromatic Orb","Color Spray","Command","Compelled Duel","Comprehend Languages","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Poison and Disease","Disquise Self","Dissonant Whispers","Distort Value","Divine Favor","Divine Smite","Earth Tremor","Ensaring Strike","Entangle","Expeditious Retreat","Faerie Fire","False Life","Feather Fall","Find Familiar","Floating Disk","Fog Cloud","Frost Fingers","Goodberry","Grease","Guiding Bolt","Hail of Thorns","Healing Word","Hellish Rebuke","Heroism","Hex","Hideous Laughter","Hunter's Mark","Ice Knife","Identify","Illusory Script","Inflict Wounds","Jim's Magic Missile","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Purify Food and Drink","Ray of Sickness","Sanctuary","Searing Smite","Shield","Shield of Faith","Silent Image","Silvery Barbs","Sleep","Snare","Speak with Animals","Spellfire Flare","Tasha's Caustic Brew","Tenser's Floating Disk","Thunderous Smite","Thunderwave","Unseen Servant","Witch Bolt","Wrathful Smite","Zephyr Smite"],
            two: ["Acid Arrow","Aganazzar's Scorcher","Aid","Air Bubble","Alter Self","Animal Messenger","Arcane Lock","Arcane Vigor","Arcanist's Magic Aura","Augury","Barkskin","Beast Sense","Blindness/Deafness","Blur","Borrowed Knowledge","Branding Smite","Calm Emotions","Cloud of Daggers","Continual Flame","Cordon of Arrows","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Dragon's Breath","Dust Devil","Earthbind","Enhance Ability","Enlarge/Reduce","Enthrall","Find Steed","Find Traps","Flame Blade","Flaming Sphere","Flock of Familiars","Gentle Repose","Gift of Gab","Gust of Wind","HEaling Spirit","Heat Metal","Hold Person","Invisibility","Jim's Glowing Coin","Kinetic Juant","Knock","Lesser Restoration","Levitate","Locate Animals or Plants","Locate Object","Magic Mouth","Magic Weapon","Maximilian's Earthen Grasp","Melf's Acid Arrow","Mind Spike","Mirror Image","Misty Step","Moonbeam","Nathair's Mischief","Pass without Trace","Phantasmal Force","Prayer of Healing","Protection from Poison","Pyrotechnics","Ray of Enfeeblement","Rime's Binding Ice","Rope Trick","Scorching Ray","See Inbvisibility","Shadow Blade","Shatter","Shining Smite","Silence","Skywrite","Snilloc's Snowball Swarm","Spider Climb","Spike Growth","Spiritual Weapon","Spray of Cards","Suggestion","Summon Beast","Tasha's Mind Whip","Vortex Warp","Warding Bond","Warding Wind","Warp Sense","Web","Wither and Bloom","Zone of Truth"],
            three: ["Animate Dead","Antagonize","Ashardalon's Stride","Aura of Vitality","Beacon of Hope","Bestow Curse","Blinding Smite","Blink","Call Lightning","Catnap","Clairvoyance","Conjure Animals","Conjure Barrage","Conjure Constructs","Counterspell","Create Food and Water","Crusader's Mantle","Daylight","Dispel Magic","Elemental Weapon","Enemies Abound","Erupting Earth","Fast Friends","Fear","Feign Death","Fireball","Flame Arrows","Fly","Galder's Tower","Gaseous Form","Glyph of Warding","Haste","Hunger of Hadar","Hypnotic Pattern","Incite Greed","Intellect Fortress","Leomund's Tiny Hut","Life Transference","Lightning Arrow","Lightning Bolt","Magic Circle","Major Image","Mass Healing Word","Meld into Stone","Melf's Minute Meteors","Motivational Speed","Nondetection","Phantom Steed","Plant Growth","Protection from Energy","Remove Curse","Revivify","Sending","Sleet Storm","Slow","Speak with Dead","Speak with Plants","Spirit Guardians","Spirit Shroud","Stinking Cloud","Summon Fey","Summon Lesser Demon","Summon Shadowspawn","Summon Undead","Thunder Step","Tidal Wave","Tiny Servant","Tongues","Vampiric Touch","Wall of Sand","Wall of Watter","Water Breathing","Water Walk","Wind Wall"],
            four: ["Arcane Eye","Aura of Life","Aura of Purity","Banishment","Black Tentacles","Blight","Charm Monster","Compulsion","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Death Ward","Dimension Door","Divination","Dominate Beast","Elemental Bane","Fabricate","Faithful Hound","Find Greater Steed","Fire Shield","Freedom of Movement","Galder's Speedy Courier","Giant Insect","Grasping Vine","Greater Invisibility","Guardian of Faith","Guardian of Nature","Hallucinatory Terrain","Ice Storm","Leomund's Secret Chest","Locate Creature","Mordenkainen's Private Sanctum","Otiluke's Resilient Sphere","Phantasmal Killer","Polymorph","Raulothim's Psychic Lance","Shadow of Moil","Sickening Radiance","Spirit of Death","Staggering Smite","Stone Shape","Stoneskin","Storm Sphere","Summon Aberration","Summon Construct","Summon Elemental","Summon Greater Demon","Vitriolic Sphere","Wall of Fire","Watery Sphere"],
            five: ["Animate Objects","Antilife Shell","Arcane Hand","Awaken","Banishing Smite","Circle of Power","Cloudkill","Commune","Commune with Nature","Cone of Cold","Conjure Elemental","Conjure Volley","Contact Other Plane","Contagion","Control Winds","Create Spelljamming Helm","Creation","Danse Macabre","Dawn","Dawn","Destructive Wave","Dispel Evil and Good","Dominate Person","Dream","Enervation","Far Step","Flame Strike","Geas","Greater Restoration","Hollow","Hold Monster","Holy Weapon","Immolation","Infernal Calling","Insect Plague","Jallarzi's Storm of Radiance","Legend Lore","Maelstrom","Mass Cure Wounds","Mislead","Modify Memory","Negative Energy Flood","Passwall","Planar Binding","Raise Dead","Rary's Telepathic Bond","Reincarnate","Scrying","Seeming","Skill Empowerment","Steel Wind Strike","Summon Celestial","Summon Draconic Spirit","Swift Quiver","Synaptic Static","Telekinesis","Teleportation Circle","Transmute Rock","Tree Stride","Wall of Force","Wall of Light","Wall of Stone","Wrath of Nature","Yolande's Regal Presence"],
            six: ["Arcane Gate","Blade Barrier","Bones of the Earth","Chain Lightning","Circle of Death","Conjure Fey","Contingency","Create Homunculus","Create Undead","Disintegrate","Drawmij's Instant Summons","Druid Grove","Eyebite","Find the Path","Fizban's Platinum Shield","Flesh to Stone","Forbiddance","Freezing Sphere","Globe of Invulnerability","Guards and Wards","Harm","Heal","Heroes' Feast","Investiture of Flame","Investiture of Ice","Investiture of Stone","Investiture of Wind","Magic Jar","Mass Suggestion","Mental Prison","Move Earth","Otto's Irresistable Dance","Planar Ally","Primordial Ward","Programmed Illusion","Scatter","Soul Cage","Summon Fiend","Sunbeam","Tasha's Bubbling Cauldron","Tenser's Transformation","Transport Via Plants","True Seeing","Wall of Ice","Wall of Thorns","Wind Walk","Word of Recall"],
            seven: ["Conjure Celestial","Crown of Stars","Delayed Blast Firball","Divine Word","Draconic Transformation","Dream of the Blue Veil","Etherealness","Finger of Death","Fire Storm","Forcecage","Magnificent Mansion","Mirage Arcane","Mordenkainen's Sword","Plane Shift","Power Word ortify","Power Word Pain","Primatic Spray","Project Image","Regenerate","Resurrection","Reverse Gravity","Sequester","Simulacrum","Symbol","Teleport","Temple of the Gods","Whirlwind"],
            eight: ["Abi-Dalzim's Horrid Wilting","Animal Shapes","Antimagic Field","Antipathy/Sympathy","Befuddlement","Clone","Control Weather","Demiplane","Dominate Monster","Earthquake","Feeblemind","Glibness","Holy Aura","Illusory Dragon","Incendiary Cloud","Maddening Darkness","Maze","Mighty Fortress","Mind Blank","Power Word Stun","Sunburst","Telepathy","Tsunami"],
            nine: ["Astral Projection","Blade of Disaster","Foresight","Gate","Imprisonment","Invulnerability","Mass Heal","Mass Polymorph","Meteor Swarm","Power Word Heal","Power Word Kill","Primatic Wall","Psychic Scream","Shapechange","Storm of Vengeance","Time Stop","True Polymorph","True Resurrection","Weird","Wish"],
          },
          golem: [
            { min: 1, max: 5, item: () => ({name: "Clay"})},
            { min: 6, max: 17, item: () => ({name: "Flesh"})},
            { min: 18, max: 18, item: () => ({name: "Iron"})},
            { min: 19, max: 20, item: () => ({name: "Stone"})},
          ],
          beltOfGiantStrength: {
            rare: ["Hill"],
            veryRare: ["Frost","Stone","Fire"],
            legendary: ["Cloud","Storm"],
          },
          giantStrength: ["Belt of Frost Giant Strength","Belt of Stone Giant Strength"],
          carpet: ["3 ft. x 5 ft.","4 ft. x 6 ft.","5 ft. x 7 ft.","6 ft. x 9 ft.",],
          ironFlask: [
            { min: 1, max: 50, item: () => ({name: "Empty"})},
            { min: 51, max: 51, item: () => ({name: "Arcanaloth"})},
            { min: 52, max: 52, item: () => ({name: "Cambion"})},
            { min: 51, max: 54, item: () => ({name: "Dao"})},
            { min: 55, max: 57, item: () => ({name: ["Barlgura","Shadow Demon","Vrock"]})},
            { min: 59, max: 60, item: () => ({name: ["Chasme","Hezou"]})},
            { min: 61, max: 62, item: () => ({name: ["Glabrezu","Yochlol"]})},
            { min: 63, max: 64, item: () => ({name: "Nalfeshnee"})},
            { min: 65, max: 65, item: () => ({name: "Marilith"})},
            { min: 66, max: 66, item: () => ({name: ["Balor","Goristro"]})},
            { min: 67, max: 67, item: () => ({name: "Deva"})},
            { min: 68, max: 69, item: () => ({name: ["Horned Devil","Erinyes","Ice Devil","Pit Fiend"]})},
            { min: 70, max: 72, item: () => ({name: ["Imp","Spined Devil","Bearded Devil","Barbed Devil","Chain Devil","Bone Devil"]})},
            { min: 73, max: 74, item: () => ({name: "Djinni"})},
            { min: 75, max: 76, item: () => ({name: "Efreeti"})},
            { min: 77, max: 78, item: () => ({name: ["Air Elemental","Earth Elemental","Fire Elemental","Water Elemental"]})},
            { min: 79, max: 79, item: () => ({name: "Githyanki Knight"})},
            { min: 80, max: 80, item: () => ({name: "Githzerai Zerth"})},
            { min: 81, max: 82, item: () => ({name: "Invisible Stalker"})},
            { min: 83, max: 84, item: () => ({name: "Marid"})},
            { min: 85, max: 86, item: () => ({name: "Mezzoloth"})},
            { min: 87, max: 88, item: () => ({name: "Night Hag"})},
            { min: 89, max: 90, item: () => ({name: "Nycaloth"})},
            { min: 91, max: 91, item: () => ({name: "Planetar"})},
            { min: 92, max: 93, item: () => ({name: "Salamander"})},
            { min: 94, max: 95, item: () => ({name: ["Red Slaad","Blue Slaad","Green Slaad","Gray Slaad","Death Slaad"]})},
            { min: 96, max: 96, item: () => ({name: "Solar"})},
            { min: 97, max: 98, item: () => ({name: ["Succubus/Incubus"]})},
            { min: 99, max: 99, item: () => ({name: "Ultroloth"})},
            { min: 100, max: 100, item: () => ({name: "Xorn"})},
          ],
          prayerBeads: [
            { min: 1, max: 6, item: () => ({name: "Bless"})},
            { min: 7, max: 12, item: () => ({name: ["Cure Wounds (2nd level)", "Lesser Restoration"]})},
            { min: 13, max: 16, item: () => ({name: "Greater Restoration"})},
            { min: 17, max: 18, item: () => ({name: "Branding Smite"})},
            { min: 19, max: 19, item: () => ({name: "Planar Ally"})},
            { min: 20, max: 20, item: () => ({name: "Wind Walk"})},
          ],
          hornOfValhalla: {
            rare: ["silver","brass"],
            veryRare: ["bronze"],
            legendary: ["iron"]
          },
          figurine: ["bronze griffon","ebony fly","golden lions","ivory goats","marbled elephant","onyx dog","onyx dog","serpentine owl"],
          wand: {
            woodFocus: ["Fernian Ash - Fire","Irian Rosewood - Radiant","Kythrian Manchineel - Acid or Poison","Lamannian Oak - Lightning or Thunder","Mabaran Ebony - Necrotic","Risian Pine - Cold","Shavarran Birch - Force","Xorian Wenge - Psychic"],
          },
          instruments: ["Bagpipes","Drums","Dulcimer","Flute","Lute","Lyre","Horn","Pan Flute","Shawm","Viol"],
          instrumentOfBards:{
            uncommon: ["Doss Lute","Fochlucan Bandore","Mac-Fuirmidh Cittern"],
            rare: ["Canaith Mandolin","Cli Lyre"],
            veryRare: ["Anstruth Harp"],
            legendary: ["Ollamh Harp"],
          },
          ioun: {
            rare: ["Awareness","Protection","Reserve","Sustenance"],
            veryRare: ["Absorption","Agility","Fortitude","Insight","Intellect","Leadership","Strength"],
            legendary: ["Greater Absorption","Mastery","Regeneration"],
          },
          orbShield: ["Fernian Basalt - Fire", "Irian Quartz - Radiant","Kythrian Skarn - Acid and Poison","Lamannian Flint - Lightning and Thunder","Mabaran Obsidian - Necrotic","Risian Shale - Cold","Shavarran Chert - Force","Xorian Marble - Psychic"],
          trickBag: ["gray","rust","tan"],
          deck: {
            illusion: ["FAILED"],
          },
          dust: {
            dryness: ["FAILED"],
          },
          elemental: ["Blue Saphhire - Air Elemental","Yellow Diamond - Earth Elemental","Red Corundum - Fire Elemental","Emerald - Water Elemental"],
          dose: {
            keoghtom: ["FAILED"],
            bagOfBeans: ["FAILED"],
            beadOfForce: ["FAILED"],
            necklaceOfFireball: ["FAILED"],
          },
          mindCrystal: {
            common: ["subtle"],
            uncommon: ["careful","distant","empowered","extended"],
            rare: ["heightened","quickened"],
          },
          creature: [
            { min: 1, max: 10, item: () => ({name: "aberration"})},
            { min: 11, max: 20, item: () => ({name: "beast"})},
            { min: 21, max: 30, item: () => ({name: "celestial"})},
            { min: 31, max: 40, item: () => ({name: "elemental"})},
            { min: 41, max: 50, item: () => ({name: "fey"})},
            { min: 51, max: 75, item: () => ({name: "fiend"})},
            { min: 76, max: 80, item: () => ({name: "plants"})},
            { min: 81, max: 100, item: () => ({name: "undead"})},
          ],
          scrollOfProtection: [
            { min: 1, max: 10, item: () => ({name: "aberrations"})},
            { min: 11, max: 15, item: () => ({name: "beasts"})},
            { min: 16, max: 20, item: () => ({name: "celestials"})},
            { min: 21, max: 25, item: () => ({name: "constructs"})},
            { min: 26, max: 35, item: () => ({name: "dragons"})},
            { min: 36, max: 45, item: () => ({name: "elementals"})},
            { min: 46, max: 50, item: () => ({name: "humanoids"})},
            { min: 51, max: 60, item: () => ({name: "fey"})},
            { min: 61, max: 70, item: () => ({name: "fiends"})},
            { min: 71, max: 75, item: () => ({name: "giants"})},
            { min: 76, max: 80, item: () => ({name: "monstrosities"})},
            { min: 81, max: 85, item: () => ({name: "oozes"})},
            { min: 86, max: 90, item: () => ({name: "plants"})},
            { min: 91, max: 100, item: () => ({name: "undead"})},
          ],
          alignment: [
            { min: 1, max: 2, item: () => ({name: "chaotic evil"})},
            { min: 3, max: 4, item: () => ({name: "chaotic neutral"})},
            { min: 5, max: 7, item: () => ({name: "chaotic good"})},
            { min: 8, max: 9, item: () => ({name: "neutral evil"})},
            { min: 10, max: 11, item: () => ({name: "neutral"})},
            { min: 12, max: 13, item: () => ({name: "neutral good"})},
            { min: 14, max: 15, item: () => ({name: "lawful evil"})},
            { min: 16, max: 17, item: () => ({name: "lawful neutral"})},
            { min: 18, max: 20, item: () => ({name: "lawful good"})},
          ],
          dragonScale: ["scale mail) (Black	- Acid", "scale mail) (Blue - Lightning","scale mail) (Brass - Fire","scale mail) (Bronze - Lightning","scale mail) (Copper - Acid","scale mail) (Gold - Fire","scale mail) (Green - Poison","scale mail) (Red - Fire","scale mail) (Silver - Cold","scale mail) (White - Cold"],
          featherTokenByRarity: {
            uncommon: ["Anchor","Fan","Tree"],
            rare: ["Bird","Swan Boat","Whip"]
          },
          usefulItems: [
            { min: 1, max: 2, item: () => ({name: "chaotic evil"})},
            { min: 3, max: 4, item: () => ({name: "chaotic neutral"})},
            { min: 5, max: 7, item: () => ({name: "chaotic good"})},
            { min: 8, max: 9, item: () => ({name: "neutral evil"})},
            { min: 10, max: 11, item: () => ({name: "neutral"})},
            { min: 12, max: 13, item: () => ({name: "neutral good"})},
            { min: 14, max: 15, item: () => ({name: "lawful evil"})},
            { min: 16, max: 17, item: () => ({name: "lawful neutral"})},
            { min: 18, max: 20, item: () => ({name: "lawful good"})},
          ],
          slingBullets: [
            {min: 1, max: 1, item: () => ({name: "Banishment"})},
            {min: 2, max: 2, item: () => ({name: "Fulguration"})},
            {min: 3, max: 3, item: () => ({name: "Stunning"})},
            {min: 4, max: 4, item: () => ({name: "Tracking"})},
          ],
        };

        // === HOARD GENERATION LOGIC ===
        function generateHoard(tier) {
          const percent = rollPercent();
          const GemArtTable = HoardGemsArtItemTable[tier];
          const row = GemArtTable.find(r => percent >= r.min && percent <= r.max);
          if (!row) return "No hoard result found.";

          const reward = row.reward();
          let output = "";

          // --- Coins ---
          const coins = HoardBaseCoins[tier]();
          output += `<h3>Coins:</h3>${formatCoins(coins)}`;

          // --- Valuables ---
          if (reward.value) {
            output += `<h3>Valuables:</h3>${resolveValueString(reward.value)}`;
          }

          // --- Magic Items ---
          let generatedItems = [];

          if (reward.items) {
            const itemEntries = Array.isArray(reward.items) ? reward.items : [reward.items];

            for (const itemStr of itemEntries) {
              const [qtyExpr, tableKey] = itemStr.trim().split(" ");
              const count = qtyExpr && /\d+d\d+/.test(qtyExpr) ? rollDice(qtyExpr) : parseInt(qtyExpr, 10) || 1;

              const letter = tableKey.toUpperCase();
              const table = HoardMagicItem[letter];
              if (!table) continue;

              for (let i = 0; i < count; i++) {
                const roll = rollPercent();
                const match = table.find(r => roll >= r.min && roll <= r.max);
                if (match && typeof match.item === "function") {
                  const item = match.item(); // { name, keywords, etc. }
                  const detailed = resolveItemDetails(item);
                  generatedItems.push(detailed);
                }
              }
            }
          }

          // --- Combine and Display ---
          if (generatedItems.length > 0) {
            const combined = {};
            for (const item of generatedItems) {
              combined[item] = (combined[item] || 0) + 1;
            }

            const sortedItems = Object.entries(combined).sort((a, b) =>
                                                              a[0].localeCompare(b[0], "en", { sensitivity: "base" })
                                                             );

            output += `<h3>Magic Items</h3>`;
            for (const [item, count] of sortedItems) {
              const qty = count > 1 ? `(${count}) ` : "";
              output += `${qty}${item}<br>`;
            }
          } else {
            output += `<h3>Magic Items</h3>None<br>`;
          }

          return output;
        }

        // === VALUE STRING HANDLER ===
        function resolveValueString(str) {
          // Example: "2d4 25 gp art objects"
          const diceMatch = str.match(/(\d+d\d+)/);
          if (!diceMatch) return str;

          const rolled = rollDice(diceMatch[1]);
          return str.replace(diceMatch[1], rolled);
        }

        // === ITEM STRING HANDLER (returns array of names) ===
        function resolveItemString(str) {
          // Examples: "1d4 A" or "1 G"
          const diceMatch = str.match(/(\d+d\d+)/);
          const [countStr, tableKey] = str.trim().split(" ").filter(Boolean);

          let count;
          if (diceMatch) {
            count = rollDice(diceMatch[1]);
          } else {
            count = parseInt(countStr, 10);
          }


          const letter = tableKey.toUpperCase();
          const results = [];

          for (let i = 0; i < count; i++) {
            const roll = rollPercent();
            const magicRow = HoardMagicItem[letter].find(r => roll >= r.min && roll <= r.max);
            if (magicRow) {
              const item = magicRow.item();
              results.push(item.name || "Unknown Item");
            } else {
              results.push(`(No item found on table ${letter})`);
            }
          }

          return results;
        }

        function generateMagicShop(level = "mid", type = "magicSeller") {
          const settings = MagicShopSettings[level];
          let output = "";

          for (const rarity of Object.keys(MagicItems[type])) {
            const countRange = settings[rarity];

            if (!Array.isArray(countRange) || countRange.length < 2) {
              console.warn(`Missing countRange for rarity: ${rarity}`);
              continue;
            }

            const healingPotions = Math.floor(Math.random() * (countRange[1] - countRange[0] + 1)) + countRange[0];
            const amount = Math.floor(Math.random() * (countRange[1] - countRange[0] + 1)) + countRange[0];

            // FOR TESTING
            // const amount = 1;
            if (amount <= 0) continue;

            let chance = level;
            let option = rarity;

            const shopTier = MagicShopChances[chance] || {};
            const tierOption = shopTier[option] || { cost: [0, 0] };

            const cost = tierOption.cost;

            // --- Collect items first ---
            const generatedItems = [];
            for (let i = 0; i < amount; i++) {
              const item = MagicItems[type][rarity][Math.floor(Math.random() * MagicItems[type][rarity].length)];
              if (!item) continue;
              const fullItem = resolveItemDetails(item);
              generatedItems.push(fullItem);
            }

            if(type === "potionSeller" || type === "magicSeller") {
              for (let i = 0; i < healingPotions; i++) {
                if (rarity != "legendary") {
                  let item = HealingPotions[rarity][Math.floor(Math.random() * HealingPotions[rarity].length)];
                  let fullItem = resolveItemDetails(item);
                  generatedItems.push(fullItem);
                }}}

            if (generatedItems.length === 0) {
              continue; 
            }

            // --- Combine duplicates ---
            const combined = {};
            for (const item of generatedItems) {
              if (!combined[item]) {
                const price = Math.floor(Math.random() * (cost[1] - cost[0])) + cost[0];
                combined[item] = { count: 1, price };
              } else {
                combined[item].count++;
              }
            }

            // --- Sort alphabetically by item name ---
            const sortedItems = Object.entries(combined).sort((a, b) =>
                                                              a[0].localeCompare(b[0], "en", { sensitivity: "base" })
                                                             );

            // --- Output display ---
            output += `<h3>${rarity.toUpperCase()} ITEMS ${amount}</h3> `;
            for (const [item, data] of sortedItems) {
              const qty = data.count > 1 ? `(${data.count}) ` : "";
              output += `${qty}${item} — Price: ${data.price.toFixed(2)} gp<br>`;
            }
          }

          return output;
        }

        // === MAGIC ITEM SUBTYPE GENERATOR ===
        function resolveItemDetails(item) {
          const { name, keyword, attunement } = item;

          // === Handle Armor of Resistance ===
          if (keyword.includes("armor") && (keyword.includes("resistance") || keyword.includes("bps resistance"))) {
            // --- Pick resistance type ---
            let type = [];
            if (keyword.includes("resistance")) {
              type = SubtypePools.potion.resistance;
            }
            else {
              type = SubtypePools.potion.bpsresistance;
            }
            const resistPool = type
            const chosenResist = resistPool[Math.floor(Math.random() * resistPool.length)];

            // --- Determine armor type ---
            // Check for a specific armor keyword like "chain mail", "plate", etc.
            const specificArmor = Object.values(SubtypePools.armor)
            .flat()
            .find(a => keyword.includes(a.toLowerCase()));

            let chosenArmor;
            if (specificArmor) {
              // Use explicitly defined armor type
              chosenArmor = specificArmor;
            } else {
              // Otherwise pick randomly from available armor subtype pools
              let armorPool = [];
              if (keyword.includes("light")) armorPool.push(...SubtypePools.armor.light);
              if (keyword.includes("medium")) armorPool.push(...SubtypePools.armor.medium);
              if (keyword.includes("heavy")) armorPool.push(...SubtypePools.armor.heavy);
              if (armorPool.length === 0) {
                // fallback to medium armor
                armorPool.push(...SubtypePools.armor.medium);
              }
              chosenArmor = armorPool[Math.floor(Math.random() * armorPool.length)];
            }

            // --- Return formatted output ---
            // Example: "Armor of Resistance (chain mail, fire)"
            return `${name} (${chosenArmor}, ${chosenResist})${attunement}`;
          }

          if (keyword.includes("potion")) {
            let typePool = [];

            // === Handle Potions of Resistance ===
            if (keyword.includes("resistance")) {
              const typePool = SubtypePools.potion.resistance;
              const chosen = typePool[Math.floor(Math.random() * typePool.length)];
              return `${name} (${chosen})${attunement}`;
            }

            if (keyword.includes("giant strength")) {
              let subtypePool = [];
              if (keyword.includes("uncommon")) subtypePool.push(...SubtypePools.potion.giantStrength.uncommon);
              if (keyword.includes("rare")) subtypePool.push(...SubtypePools.potion.giantStrength.rare);
              if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.potion.giantStrength.veryRare);
              if (keyword.includes("legendary")) subtypePool.push(...SubtypePools.potion.giantStrength.legendary);

              if (subtypePool.length > 0) {
                const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
                return `${name} (${chosen})${attunement}`;
              }
            }

            if (keyword.includes("healing")) {
              let subtypePool = [];
              if (keyword.includes("common")) subtypePool.push(...SubtypePools.potion.healing.common);
              if (keyword.includes("uncommon")) subtypePool.push(...SubtypePools.potion.healing.uncommon);
              if (keyword.includes("rare")) subtypePool.push(...SubtypePools.potion.healing.rare);
              if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.potion.healing.veryRare);

              if (subtypePool.length > 0) {
                const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
                return `${name} (${chosen})${attunement}`;
              }
            }
          }

          // === Handle Armor ===
          if (keyword.includes("armor")) {
            let subtypePool = [];
            if (keyword.includes("light")) subtypePool.push(...SubtypePools.armor.light);
            if (keyword.includes("medium")) subtypePool.push(...SubtypePools.armor.medium);
            if (keyword.includes("heavy")) subtypePool.push(...SubtypePools.armor.heavy);
            if (keyword.includes("shield")) subtypePool.push(...SubtypePools.armor.shield);
            if (keyword.includes("MH not hide")) subtypePool.push(...SubtypePools.armor.MHNotHide);
            if (keyword.includes("magic armor")) subtypePool.push(...SubtypePools.armor.magicArmor);
            if (keyword.includes("elven chain")) subtypePool.push(...SubtypePools.armor.elvenChain);
            if (keyword.includes("plates")) subtypePool.push(...SubtypePools.armor.plates);
            if (keyword.includes("heavy plate")) subtypePool.push(...SubtypePools.armor.heavyPlate);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              if (keyword.includes("magic armor")) {
                return `${chosen}`;
              }
              else {
                return `${name} (${chosen})${attunement}`;
              }
            }
          }

          // === Handle Weapons ===
          if (keyword.includes("weapon")) {
            let subtypePool = [];
            if (keyword.includes("any")) subtypePool.push(...SubtypePools.weapon.any);
            if (keyword.includes("melee")) subtypePool.push(...SubtypePools.weapon.melee);
            if (keyword.includes("ranged")) subtypePool.push(...SubtypePools.weapon.ranged);
            if (keyword.includes("ammunition")) subtypePool.push(...SubtypePools.weapon.ammunition);
            if (keyword.includes("any sword")) subtypePool.push(...SubtypePools.weapon.anySword);
            if (keyword.includes("any bow")) subtypePool.push(...SubtypePools.weapon.anyBow);
            if (keyword.includes("string")) subtypePool.push(...SubtypePools.weapon.strungBow);
            if (keyword.includes("bladed")) subtypePool.push(...SubtypePools.weapon.bladed);
            if (keyword.includes("vorpal")) subtypePool.push(...SubtypePools.weapon.vorpal);
            if (keyword.includes("pointed")) subtypePool.push(...SubtypePools.weapon.pointed);
            if (keyword.includes("long")) subtypePool.push(...SubtypePools.weapon.long);
            if (keyword.includes("one-handed melee")) subtypePool.push(...SubtypePools.weapon.onehandedMelee);
            if (keyword.includes("hammer")) subtypePool.push(...SubtypePools.weapon.hammer);
            if (keyword.includes("axe")) subtypePool.push(...SubtypePools.weapon.axe);
            if (keyword.includes("all axe")) subtypePool.push(...SubtypePools.weapon.allAxe);
            if (keyword.includes("answering")) subtypePool.push(...SubtypePools.weapon.answering);

            if (keyword.includes("slaying")) {
              const roll = Math.floor(Math.random() * 100) +1;
              const pool = SubtypePools.scrollOfProtection;
              const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

              if (match) {
                const chosen1 = subtypePool[Math.floor(Math.random() * subtypePool.length)];
                const chosen2 = match.item();
                return `${name} (${chosen1}) (${chosen2.name})${attunement}`;
              }}

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("ring")) {
            let subtypePool = [];
            if (keyword.includes("resistance")) subtypePool.push(...SubtypePools.ring.resistance);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("scroll")) {
            let subtypePool = [];
            if (keyword.includes("cantrip")) subtypePool.push(...SubtypePools.scroll.zero);
            if (keyword.includes("1st level")) subtypePool.push(...SubtypePools.scroll.one);
            if (keyword.includes("2nd level")) subtypePool.push(...SubtypePools.scroll.two);
            if (keyword.includes("3rd level")) subtypePool.push(...SubtypePools.scroll.three);
            if (keyword.includes("4th level")) subtypePool.push(...SubtypePools.scroll.four);
            if (keyword.includes("5th level")) subtypePool.push(...SubtypePools.scroll.five);
            if (keyword.includes("6th level")) subtypePool.push(...SubtypePools.scroll.six);
            if (keyword.includes("7th level")) subtypePool.push(...SubtypePools.scroll.seven);
            if (keyword.includes("8th level")) subtypePool.push(...SubtypePools.scroll.eight);
            if (keyword.includes("9th level")) subtypePool.push(...SubtypePools.scroll.nine);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("wand")) {
            let subtypePool = [];
            if (keyword.includes("wood focus")) subtypePool.push(...SubtypePools.wand.woodFocus);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("golem")) {
            const roll = Math.floor(Math.random() * 20) +1;
            const pool = SubtypePools.golem;
            const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

            if (match) {
              const chosen = match.item();
              return `${name} (${chosen.name})${attunement}`;
            }
          }

          if (keyword.includes("giant strength")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.giantStrength);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${chosen}${attunement}`;
            }
          }

          if (keyword.includes("carpet")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.carpet);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("iron flask")) {
            const roll = Math.floor(Math.random() * 100) + 1;
            const pool = SubtypePools.ironFlask;
            const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

            if (match) {
              const chosen = match.item();

              // Handle if the entry’s name is an array (e.g. multiple possible creatures)
              if (Array.isArray(chosen.name)) {
                const randomPick = chosen.name[Math.floor(Math.random() * chosen.name.length)];
                return `${name} (${randomPick})${attunement}`;
              } else {
                return `${name} (${chosen.name})${attunement}`;
              }
            }
          }

          if (keyword.includes("prayer beads")) {
            const num = Math.floor(Math.random() * 4) + 2; // 2–5 beads
            const beadResults = [];

            // Roll each bead
            for (let i = 0; i < num; i++) {
              const roll = Math.floor(Math.random() * 20) + 1;
              const pool = SubtypePools.prayerBeads;
              const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

              if (match) {
                const chosen = match.item();

                if (Array.isArray(chosen.name)) {
                  const randomPick = chosen.name[Math.floor(Math.random() * chosen.name.length)];
                  beadResults.push(randomPick);
                } else {
                  beadResults.push(chosen.name);
                }
              }
            }

            // --- Combine duplicates ---
            const combined = {};
            for (const bead of beadResults) {
              combined[bead] = (combined[bead] || 0) + 1;
            }

            // --- Sort alphabetically ---
            const sorted = Object.keys(combined).sort((a, b) =>
                                                      a.localeCompare(b, "en", { sensitivity: "base" })
                                                     );

            // --- Format output ---
            const formatted = sorted
            .map(name => (combined[name] > 1 ? `(${combined[name]}) ${name}` : name))
            .join(", ");

            return `${name} (${num} Beads: ${formatted})${attunement}`;
          }

          if (keyword.includes("sling bullets")) {
            const num = Math.floor(Math.random() * 5) + 4; // 2–5 beads
            const bulletResults = [];

            // Roll each bead
            for (let i = 0; i < num; i++) {
              const roll = Math.floor(Math.random() * 4) + 1;
              const pool = SubtypePools.slingBullets;
              const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

              if (match) {
                const chosen = match.item();

                if (Array.isArray(chosen.name)) {
                  const randomPick = chosen.name[Math.floor(Math.random() * chosen.name.length)];
                  bulletResults.push(randomPick);
                } else {
                  bulletResults.push(chosen.name);
                }
              }
            }

            // --- Combine duplicates ---
            const combined = {};
            for (const bead of bulletResults) {
              combined[bead] = (combined[bead] || 0) + 1;
            }

            // --- Sort alphabetically ---
            const sorted = Object.keys(combined).sort((a, b) =>
                                                      a.localeCompare(b, "en", { sensitivity: "base" })
                                                     );

            // --- Format output ---
            const formatted = sorted
            .map(name => (combined[name] > 1 ? `(${combined[name]}) ${name}` : name))
            .join(", ");

            return `${name} (${num} Bullets: ${formatted})${attunement}`;
          }

          if (keyword.includes("figurine")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.figurine);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("instrument")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.instruments);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("instrument of bards")) {
            let subtypePool = [];
            if (keyword.includes("uncommon")) subtypePool.push(...SubtypePools.instrumentOfBards.uncommon);
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.instrumentOfBards.rare);
            if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.instrumentOfBards.veryRare);
            if (keyword.includes("legendary")) subtypePool.push(...SubtypePools.instrumentOfBards.legendary);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("orb shield")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.orbShield);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("trick bag")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.trickBag);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("deck")) {
            let subtypePool = [];
            if (keyword.includes("illusion")) {
              const roll = (35 - (Math.floor(Math.random() * 20)));
              subtypePool.push(`${roll} Cards`);}

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("dust")) {
            let subtypePool = [];
            if (keyword.includes("dryness")) {
              const roll = (Math.floor(Math.random() * 6) + 5);
              subtypePool.push(`${roll} Cards`);}

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("elemental")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.elemental);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("dose")) {
            let subtypePool = [];
            if (keyword.includes("keoghtom's")) {
              const roll = ((Math.floor(Math.random() * 4)) +1);
              subtypePool.push(`${roll} doses`);}
            if (keyword.includes("bag of beans")) {
              const roll = ((Math.floor(Math.random() * 10)) +3);
              subtypePool.push(`${roll} beans`);}
            if (keyword.includes("bead of force")) {
              const roll = ((Math.floor(Math.random() * 4)) +5);
              subtypePool.push(`${roll} beads`);}
            if (keyword.includes("necklace of fireball")) {
              const roll = ((Math.floor(Math.random() * 6)) +4);
              subtypePool.push(`${roll} beads`);}

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("mind crystal")) {
            let subtypePool = [];
            if (keyword.includes("common")) subtypePool.push(...SubtypePools.mindCrystal.common);
            if (keyword.includes("uncommon")) subtypePool.push(...SubtypePools.mindCrystal.uncommon);
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.mindCrystal.rare);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("creature")) {
            const roll = Math.floor(Math.random() * 100) + 1;
            const pool = SubtypePools.creature;
            const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

            if (match) {
              const chosen = match.item();

              if (Array.isArray(chosen.name)) {
                const randomPick = chosen.name[Math.floor(Math.random() * chosen.name.length)];
                return `${name} (${randomPick})${attunement}`;
              } else {
                return `${name} (${chosen.name})${attunement}`;
              }
            }
          }

          if (keyword.includes("scroll of protection")) {
            const roll = Math.floor(Math.random() * 100) +1;
            const pool = SubtypePools.scrollOfProtection;
            const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

            if (match) {
              const chosen = match.item();
              return `${name} (${chosen.name})${attunement}`;
            }
          }

          if (keyword.includes("alignment")) {
            const roll = Math.floor(Math.random() * 20) + 1;
            const pool = SubtypePools.alignment;
            const match = pool.find(entry => roll >= entry.min && roll <= entry.max);

            if (match) {
              const chosen = match.item();

              if (Array.isArray(chosen.name)) {
                const randomPick = chosen.name[Math.floor(Math.random() * chosen.name.length)];
                return `${name} (${randomPick})${attunement}`;
              } else {
                return `${name} (${chosen.name})${attunement}`;
              }
            }
          }

          if (keyword.includes("dragon")) {
            let subtypePool = [];
            subtypePool.push(...SubtypePools.dragonScale);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("feather token")) {
            let subtypePool = [];
            if (keyword.includes("uncommon")) subtypePool.push(...SubtypePools.featherTokenByRarity.uncommon);
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.featherTokenByRarity.rare);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("useful items")) {
            const totalPatches = rollDice("4d4");
            const patches = [
              "2 daggers",
              "Bullseye lantern (filled and lit)",
              "Steel mirror",
              "10-foot pole",
              "Hempen rope (50 feet, coiled)",
              "Sack"
            ];

            // === Determine extra patches (4d4 rolls) ===
            const extraPatches = rollDice("4d4");

            // === d100 Table for Additional Patches ===
            const robeTable = [
              { min: 1, max: 8, item: "Bag of 100 gp" },
              { min: 9, max: 15, item: "Silver coffer (500 gp)" },
              { min: 16, max: 22, item: "Iron door (up to 10 ft by 10 ft)" },
              { min: 23, max: 30, item: "10 gems worth 100 GP each" },
              { min: 31, max: 44, item: "Ladder (24 ft)" },
              { min: 45, max: 51, item: "Riding Horse with a Riding Saddle" },
              { min: 52, max: 59, item: "Open pit (10-foot cube)" },
              { min: 60, max: 68, item: "4 Potion of Healing" },
              { min: 76, max: 75, item: "Rowboat (12 feet long)" },
              { min: 76, max: 83, item: "Spell Scroll" },
              { min: 84, max: 83, item: "2 Mastiffs" },
              { min: 91, max: 96, item: "Window (2 feet by 4 feet, up to 2 feet deep)" },
              { min: 97, max: 100, item: "Portable Ram" }
            ];

            // === Roll for each additional patch ===
            for (let i = 0; i < extraPatches; i++) {
              const roll = Math.floor(Math.random() * 100) + 1;
              const match = robeTable.find(r => roll >= r.min && roll <= r.max);
              if (!match) continue;

              const item = match.item;

              // === Handle spell scroll generation ===
              if (item.startsWith("Spell Scroll")) {
                const level = Math.floor(Math.random() * 3) + 1;

                // Pick a random spell from the proper scroll pool
                let subtypePool = [];
                if (level === 1) subtypePool = SubtypePools.scroll.one;
                if (level === 2) subtypePool = SubtypePools.scroll.two;
                if (level === 3) subtypePool = SubtypePools.scroll.three;

                if (subtypePool.length > 0) {
                  const chosenSpell = subtypePool[Math.floor(Math.random() * subtypePool.length)];
                  patches.push(`Spell Scroll (${chosenSpell})`);
                } else {
                  patches.push(item);
                }
              } else {
                patches.push(item);
              }
            }

            // === Combine duplicates ===
            const combined = {};
            for (const patch of patches) {
              combined[patch] = (combined[patch] || 0) + 1;
            }

            // === Sort and format output ===
            const sorted = Object.keys(combined).sort((a, b) =>
                                                      a.localeCompare(b, "en", { sensitivity: "base" })
                                                     );

            const formatted = sorted
            .map(name => (combined[name] > 1 ? `(${combined[name]}) ${name}` : name))
            .join(", ");

            return `${name} (${patches.length} Patches: ${formatted})${attunement}`;
          }

          if (keyword.includes("belt of giant strength")) {
            let subtypePool = [];
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.beltOfGiantStrength.rare);
            if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.beltOfGiantStrength.veryRare);
            if (keyword.includes("legendary")) subtypePool.push(...SubtypePools.beltOfGiantStrength.legendary);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `Belt of ${chosen} Giant Strength${attunement}`;
            }
          }

          if (keyword.includes("horn of valhalla")) {
            let subtypePool = [];
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.hornOfValhalla.rare);
            if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.hornOfValhalla.veryRare);
            if (keyword.includes("legendary")) subtypePool.push(...SubtypePools.hornOfValhalla.legendary);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("ioun")) {
            let subtypePool = [];
            if (keyword.includes("rare")) subtypePool.push(...SubtypePools.ioun.rare);
            if (keyword.includes("very rare")) subtypePool.push(...SubtypePools.ioun.veryRare);
            if (keyword.includes("legendary")) subtypePool.push(...SubtypePools.ioun.legendary);

            if (subtypePool.length > 0) {
              const chosen = subtypePool[Math.floor(Math.random() * subtypePool.length)];
              return `${name} (${chosen})${attunement}`;
            }
          }

          if (keyword.includes("brilliance")) {
            const roll1 = Math.floor(Math.random() * 10) + 1;
            const roll2 = Math.floor(Math.random() * 19) + 2;
            const roll3 = Math.floor(Math.random() * 28) + 3;
            const roll4 = Math.floor(Math.random() * 37) + 4;

            return `${name}, (${roll1} diamonds, ${roll2} rubies, ${roll3} fire opals, ${roll4} opals)${attunement}`;
          }

          // === Default ===
          return `${name}, (${keyword.at(0)})${attunement}`;
        }

        // === MAIN GENERATION ===

        function generateTreasure(type, tier) {
          if (type === "individual") {
            const roll = rollPercent();
            const table = IndividualTreasureTables[tier];
            const entry = table.find(e => roll >= e.min && roll <= e.max);
            return formatCoins(entry.coins());
          }

          if (type === "hoard") {
            const coins = HoardBaseCoins[tier]();
            // (expand later: gems/art/magic items)
            return generateHoard(tier);
          }

          if (type === "shop") {
            let output = "";
            for (const [rarity, { count, cost }] of Object.entries(MagicShopChances)) {
              const amount = Math.floor(Math.random() * (count[1] - count[0] + 1)) + count[0];
              if (amount === 0) continue;
              output += `<h3>${rarity.toUpperCase()} ITEMS (${amount})</h3>`;
              for (let i = 0; i < amount; i++) {
                const item = resolveItemDetails(MagicItems[type][rarity][Math.floor(Math.random() * MagicItems[type][rarity].length)]);
                const price = Math.floor(Math.random() * (cost[1] - cost[0])) + cost[0];
                output += `${item} — ${rarity} — ${price} gp<br>`;
              }
            }
            return output;
          }
        }

        document.addEventListener("DOMContentLoaded", () => {
        document.addEventListener("DOMContentLoaded", () => {
            // === UI HOOKUP ===
        document.getElementById("generateBtn").addEventListener("click", () => {
          const type = document.getElementById("generatorType").value;
          const tier = parseInt(document.getElementById("tier").value);
          const magicLevel = document.getElementById("magicLevel").value;
          const shopTypes = document.getElementById("types").value;

          let result = "";
          if (type === "shop") {
            result = generateMagicShop(magicLevel, shopTypes);
          } else {
            result = generateTreasure(type, tier);
          }

          document.getElementById("output").innerHTML = result;
        });

        // Toggle magic level visibility
        const generatorSelect = document.getElementById("generatorType");
        const magicLevelContainer = document.getElementById("magicLevelContainer");
        const tierSelect = document.getElementById("tierSelector");

        // Toggle magic level visibility
        generatorSelect.addEventListener("change", e => {
          const value = e.target.value;
          shopTypes.style.display = value === "shop" ? "block" : "none";
          magicLevelContainer.style.display = value === "shop" ? "block" : "none";
          tierSelect.style.display = value === "shop" ? "none" : "block";

        });

        // Hide initially if not shop
        if (generatorSelect.value === "shop") {
          magicLevelContainer.style.display = "block";
          shopTypes.style.display = "block";
          tierSelect.style.display = "none";
        } else {
          magicLevelContainer.style.display = "none";
          shopTypes.style.display = "none";
          tierSelect.style.display = "block";
        }
        })
      });
        