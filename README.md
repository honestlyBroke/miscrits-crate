# Miscrits Pack Opener - Stats Edition

A web-based simulator that recreates the excitement of opening packs from the game *Miscrits: World of Creatures*. This project features accurate crate animations, a reward reveal system, and a persistent statistics dashboard to track your collection progress.

## 🌟 Features

* **Four Pack Types**: Open Common, Gold, Silver, and Bronze crates, each with specific rarity weights.
* **Dynamic Animations**: Includes custom CSS animations for crate idle states, opening explosions, and reward reveals.
* **Statistics Dashboard**:
* Tracks the total number of crates opened by type.
* Counts total Miscrits collected, including S+ and A+ ratings.
* Displays unique collection progress categorized by rarity (Legendary, Exotic, Epic, Rare, Common).


* **Persistent Data**: Uses browser `localStorage` so your stats and collection are saved even if you refresh or close the page.
* **Responsive UI**: Game-accurate fonts, colors, and layout styles.

## 📂 Project Structure

Ensure your folders are organized as follows for the application to work correctly:

```text
/Miscrits_Crates
│
├── index.html        # Main application structure
├── style.css         # Game styling and animations
├── script.js         # Logic for probabilities, stats, and DOM manipulation
│
└── assets/           # Image and Font resources
    ├── common_pack.png
    ├── gold_pack.png
    ├── silver_pack.png
    ├── bronze_pack.png
    ├── sunfall_kingdom_background.png
    └── closebuttonlarge.png

```

## 🚀 How to Run

1. **Download/Clone** the project files.
2. **Verify the `assets` folder**: Make sure all images and the font file are placed inside a folder named `assets` in the same directory as your HTML file.
3. **Launch**: Double-click `index.html` to open it in your web browser.

## 🛠️ Customization

* **Rarity Weights**: You can adjust the drop rates in `script.js` by modifying the `RARITY_CHART` constant.
* **Pack Logic**: The `startPack` function in `script.js` controls which rarities are allowed in specific crates (e.g., preventing Commons in Gold Crates).

## 📜 Credits

* **Assets**: Crate images and backgrounds are properties of the original *Miscrits* game.
* **Font**: Uses "BorisBlackBloxx" for the authentic in-game UI look.
* **Data Source**: Fetches Miscrit data dynamically from `worldofmiscrits.com`.