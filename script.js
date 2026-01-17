let globalMiscritData = [];

let userStats = {
    crates: {
        "Common Pack": 0,
        "Gold Crate": 0,
        "Silver Crate": 0,
        "Bronze Crate": 0
    },
    uniqueCollection: {}, 
    totalOverall: 0,
    totalSPlus: 0,
    totalAPlus: 0
};

const RARITY_CHART = [
    { id: "legendary", label: "Legendary",   keys: ["legendary"],            weight: 0.175, color: "#ffae00" },
    { id: "exotic",    label: "Exotic",      keys: ["exotic"],               weight: 1.0,   color: "#ff00d4" },
    { id: "epic",      label: "Epic",        keys: ["epic"],                 weight: 2.0,   color: "#44ff00" },
    { id: "rare",      label: "Rare",        keys: ["rare"],                 weight: 6.0,   color: "#00ccff" },
    { id: "common",    label: "Common",      keys: ["common"],               weight: 90.825, color: "#333333" }
];

async function initData() {
    try {
        loadStats();
        updateStatsUI();
        
        const workerUrl = 'https://miscrits-proxy.yatosquare.workers.dev/'; 
        
        const response = await fetch(workerUrl);
        
        if (!response.ok) {
            throw new Error(`Worker failed with status: ${response.status}`);
        }

        globalMiscritData = await response.json();
        document.getElementById('loading-msg').style.display = 'none';
        document.querySelectorAll('.open-btn').forEach(btn => btn.disabled = false);
        
        updateStatsUI();
    } catch (err) { 
        console.error("Failed to load Miscrit data:", err);
        document.getElementById('loading-msg').innerText = "Error loading data. Check console.";
    }
}
const stage = document.getElementById('animation-stage');
const crateView = document.getElementById('crate-view');
const crateImg = document.getElementById('stage-crate-img');
const resultsContainer = document.getElementById('results-container');
const resultsTitle = document.getElementById('results-title');
const closeBtn = document.querySelector('.close-stage-btn');
let currentPackType = "";

function getSpriteUrl(name) {
    if (!name) return 'https://via.placeholder.com/150';
    const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'_');
    // Direct CDN Link
    return `https://cdn.worldofmiscrits.com/miscrits/${cleanName}_back.png`;
}

function getRarityColor(rarity) {
    if(!rarity) return "#333";
    const lower = rarity.toLowerCase();
    const found = RARITY_CHART.find(r => r.keys.includes(lower));
    return found ? found.color : "#333";
}

function pickRarityFromChart(allowedRarities) {
    let pool = RARITY_CHART;
    if (allowedRarities) {
        pool = RARITY_CHART.filter(r => allowedRarities.includes(r.id));
    }

    const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const tier of pool) {
        if (random < tier.weight) {
            return tier;
        }
        random -= tier.weight;
    }
    return pool[pool.length - 1]; 
}

function getRandomMiscritByRarity(rarityObj) {
    const candidates = globalMiscritData.filter(m => {
        const r = m.rarity ? m.rarity.toLowerCase() : "common";
        return rarityObj.keys.includes(r);
    });

    if (candidates.length === 0) {
        return globalMiscritData.length > 0 ? globalMiscritData[Math.floor(Math.random() * globalMiscritData.length)] : null;
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function startPack(type, imgSrc) {
    currentPackType = type;
    
    if(!userStats.crates[type]) userStats.crates[type] = 0;
    userStats.crates[type]++;
    saveStats();
    updateStatsUI();

    stage.style.display = 'flex';
    crateImg.style.display = 'block';
    crateImg.style.opacity = 1;
    crateImg.src = imgSrc;
    crateImg.className = 'crate-img anim-idle';
    crateImg.onclick = playExplosion;

    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    resultsTitle.style.display = 'none';
    closeBtn.style.display = 'none';
}

function playExplosion() {
    crateImg.onclick = null;
    crateImg.className = 'crate-img anim-explode';
    
    setTimeout(() => {
        crateImg.style.display = 'none';
        generateAndShowRewards();
    }, 750);
}

function generateAndShowRewards() {
    resultsContainer.style.display = 'block'; 
    resultsTitle.style.display = 'block';
    
    let allowed = null; 
    
    if(currentPackType === "Silver Crate") {
        allowed = ["legendary", "exotic", "epic", "rare"];
    }
    if(currentPackType === "Gold Crate") {
        allowed = ["legendary", "exotic", "epic"];
    }

    const rewards = [];
    const currentCrateIds = new Set(); // Prevent duplicates in single pack

    for (let i = 0; i < 5; i++) {
        let miscrit = null;
        let attempts = 0;

        // Try up to 10 times to find a unique Miscrit for this pack
        do {
            const rarityTier = pickRarityFromChart(allowed);
            const candidate = getRandomMiscritByRarity(rarityTier);
            
            if (candidate && !currentCrateIds.has(candidate.id)) {
                miscrit = candidate;
            }
            attempts++;
        } while (!miscrit && attempts < 10);

        if (miscrit) {
            rewards.push(miscrit);
            currentCrateIds.add(miscrit.id);
        }
    }

    rewards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `reward-card pos-${index}`;
        card.style.animationDelay = `${index * 0.15}s`;
        card.classList.add('anim-reveal');
        
        if (!item) return;

        const miscritName = item.name || (item.names && item.names[0]) || 'Unknown';
        const rarity = item.rarity || 'Common';
        const spriteUrl = getSpriteUrl(miscritName);
        
        const ratingRoll = Math.random();
        let ratingVal = "S+";
        if(ratingRoll > 0.5) ratingVal = "A+";

        const nameColor = getRarityColor(rarity);

        userStats.totalOverall++;
        
        if (ratingVal === "S+") userStats.totalSPlus++;
        if (ratingVal === "A+") userStats.totalAPlus++;

        if(!userStats.uniqueCollection[miscritName]) {
            userStats.uniqueCollection[miscritName] = { count: 0, rarity: rarity };
        }
        userStats.uniqueCollection[miscritName].count++;

        card.innerHTML = `
            <img src="${spriteUrl}" class="reward-sprite" onerror="this.src='https://via.placeholder.com/150'"/>
            <div class="reward-name">${miscritName}</div>
            <div class="reward-rarity" style="color:${nameColor}">${rarity}</div>
            <div class="reward-rating">Rating: <span class="rating-val">${ratingVal}</span></div>
        `;
        resultsContainer.appendChild(card);
    });
    
    saveStats();
    updateStatsUI();

    setTimeout(() => { closeBtn.style.display = 'block'; }, 1000);
}

function closeStage() {
    stage.style.display = 'none';
}

function loadStats() {
    const saved = localStorage.getItem('miscrits_stats_v3');
    if (saved) {
        const parsed = JSON.parse(saved);
        userStats = { ...userStats, ...parsed };
        if(parsed.crates) userStats.crates = { ...userStats.crates, ...parsed.crates };
    }
}

function saveStats() {
    localStorage.setItem('miscrits_stats_v3', JSON.stringify(userStats));
}

function resetStats() {
    if(confirm("Reset all statistics? This cannot be undone.")) {
        localStorage.removeItem('miscrits_stats_v3');
        userStats = {
            crates: { "Common Pack": 0, "Gold Crate": 0, "Silver Crate": 0, "Bronze Crate": 0 },
            uniqueCollection: {},
            totalOverall: 0,
            totalSPlus: 0,
            totalAPlus: 0
        };
        updateStatsUI();
    }
}

function updateStatsUI() {
    const crateDiv = document.getElementById('stats-crates');
    crateDiv.innerHTML = '';
    for (const [key, val] of Object.entries(userStats.crates)) {
        crateDiv.innerHTML += `
            <div class="stat-row"><span>${key}:</span> <span class="stat-val">${val}</span></div>
        `;
    }

    document.getElementById('stat-total-overall').innerText = userStats.totalOverall;
    document.getElementById('stat-total-s').innerText = userStats.totalSPlus;
    document.getElementById('stat-total-a').innerText = userStats.totalAPlus;

    // 1. Calculate global totals per rarity
    const globalRarityTotals = { "legendary": 0, "exotic": 0, "epic": 0, "rare": 0, "common": 0 };
    globalMiscritData.forEach(m => {
        const r = m.rarity ? m.rarity.toLowerCase() : "common";
        if (globalRarityTotals.hasOwnProperty(r)) globalRarityTotals[r]++;
    });

    // 2. Count user's unique collection
    const userRarityCounts = { "Legendary": 0, "Exotic": 0, "Epic": 0, "Rare": 0, "Common": 0 };
    let totalUnique = 0;

    Object.values(userStats.uniqueCollection).forEach(entry => {
        totalUnique++;
        const r = entry.rarity.toLowerCase();
        let label = "Common";
        if(RARITY_CHART[0].keys.includes(r)) label = "Legendary";
        else if(RARITY_CHART[1].keys.includes(r)) label = "Exotic";
        else if(RARITY_CHART[2].keys.includes(r)) label = "Epic";
        else if(RARITY_CHART[3].keys.includes(r)) label = "Rare";
        
        userRarityCounts[label]++;
    });

    // --- UPDATED: Shows X / Total Fetched ---
    const totalFetched = globalMiscritData.length;
    document.getElementById('stat-total-unique').innerText = `${totalUnique} / ${totalFetched}`;
    // ----------------------------------------

    // 3. Render rarity rows showing "Found / Global Total"
    const rarDiv = document.getElementById('stats-rarities');
    rarDiv.innerHTML = '';
    RARITY_CHART.forEach(tier => {
        const countFound = userRarityCounts[tier.label] || 0;
        const countTotal = globalRarityTotals[tier.id] || 0;
        
        rarDiv.innerHTML += `
            <div class="stat-row" style="color:${tier.color}; text-shadow:0.5px 0.5px 0 rgba(0,0,0,0.5);">
                <span>${tier.label}:</span> 
                <span class="stat-val">${countFound}/${countTotal}</span>
            </div>
        `;
    });
}

// Start loading
initData();