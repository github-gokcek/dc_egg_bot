const fs = require('fs');
const path = require('path');

// Veri dosya yolları
const LEAGUE_DATA_FILE = path.join(__dirname, '../data/league_data.json');
const MATCHES_DATA_FILE = path.join(__dirname, '../data/matches_data.json');
const TFT_LEAGUE_DATA_FILE = path.join(__dirname, '../data/tft_league_data.json');
const TFT_MATCHES_DATA_FILE = path.join(__dirname, '../data/tft_matches_data.json');

// Veri yapıları
let leagueData = {}; // { userId: { username, wins, losses, totalMatches } }
let matchesData = {}; // { matchId: { id, gameMode, blueTeam, redTeam, winner, timestamp, completed } }
let tftLeagueData = {}; // { userId: { username, matches: [{ matchId, placement }] } }
let tftMatchesData = {}; // { matchId: { id, players: [], placements: [], timestamp, completed } }

// Veri yükleme fonksiyonları
function loadLeagueData() {
    try {
        if (fs.existsSync(LEAGUE_DATA_FILE)) {
            leagueData = JSON.parse(fs.readFileSync(LEAGUE_DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Lig verileri yüklenirken hata:', error);
        leagueData = {};
    }
}

function loadMatchesData() {
    try {
        if (fs.existsSync(MATCHES_DATA_FILE)) {
            matchesData = JSON.parse(fs.readFileSync(MATCHES_DATA_FILE, 'utf8'));
        }
        if (fs.existsSync(TFT_MATCHES_DATA_FILE)) {
            tftMatchesData = JSON.parse(fs.readFileSync(TFT_MATCHES_DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Maç verileri yüklenirken hata:', error);
        matchesData = {};
        tftMatchesData = {};
    }
}

function loadTftLeagueData() {
    try {
        if (fs.existsSync(TFT_LEAGUE_DATA_FILE)) {
            tftLeagueData = JSON.parse(fs.readFileSync(TFT_LEAGUE_DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('TFT lig verileri yüklenirken hata:', error);
        tftLeagueData = {};
    }
}

function saveLeagueData() {
    try {
        // Data klasörünü oluştur
        const dataDir = path.dirname(LEAGUE_DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(LEAGUE_DATA_FILE, JSON.stringify(leagueData, null, 2));
    } catch (error) {
        console.error('Lig verileri kaydedilirken hata:', error);
    }
}

function saveMatchesData() {
    try {
        const dataDir = path.dirname(MATCHES_DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(MATCHES_DATA_FILE, JSON.stringify(matchesData, null, 2));
        fs.writeFileSync(TFT_MATCHES_DATA_FILE, JSON.stringify(tftMatchesData, null, 2));
    } catch (error) {
        console.error('Maç verileri kaydedilirken hata:', error);
    }
}

function saveTftLeagueData() {
    try {
        const dataDir = path.dirname(TFT_LEAGUE_DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(TFT_LEAGUE_DATA_FILE, JSON.stringify(tftLeagueData, null, 2));
    } catch (error) {
        console.error('TFT lig verileri kaydedilirken hata:', error);
    }
}

function generateMatchId() {
    return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Veri erişim fonksiyonları
function getLeagueData() {
    return leagueData;
}

function getMatchesData() {
    return matchesData;
}

function setLeagueData(data) {
    leagueData = data;
}

function setMatchesData(data) {
    matchesData = data;
}

function getTftLeagueData() {
    return tftLeagueData;
}

function getTftMatchesData() {
    return tftMatchesData;
}

function setTftLeagueData(data) {
    tftLeagueData = data;
}

function setTftMatchesData(data) {
    tftMatchesData = data;
}

module.exports = {
    loadLeagueData,
    loadMatchesData,
    loadTftLeagueData,
    saveLeagueData,
    saveMatchesData,
    saveTftLeagueData,
    generateMatchId,
    getLeagueData,
    getMatchesData,
    getTftLeagueData,
    getTftMatchesData,
    setLeagueData,
    setMatchesData,
    setTftLeagueData,
    setTftMatchesData
};