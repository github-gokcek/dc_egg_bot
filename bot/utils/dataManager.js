const fs = require('fs');
const path = require('path');

// Veri dosya yolları
const LEAGUE_DATA_FILE = path.join(__dirname, '../data/league_data.json');
const MATCHES_DATA_FILE = path.join(__dirname, '../data/matches_data.json');

// Veri yapıları
let leagueData = {}; // { userId: { username, wins, losses, totalMatches } }
let matchesData = {}; // { matchId: { id, gameMode, blueTeam, redTeam, winner, timestamp, completed } }

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
    } catch (error) {
        console.error('Maç verileri yüklenirken hata:', error);
        matchesData = {};
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
        // Data klasörünü oluştur
        const dataDir = path.dirname(MATCHES_DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(MATCHES_DATA_FILE, JSON.stringify(matchesData, null, 2));
    } catch (error) {
        console.error('Maç verileri kaydedilirken hata:', error);
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

module.exports = {
    loadLeagueData,
    loadMatchesData,
    saveLeagueData,
    saveMatchesData,
    generateMatchId,
    getLeagueData,
    getMatchesData,
    setLeagueData,
    setMatchesData
};