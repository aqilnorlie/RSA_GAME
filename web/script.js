let startTime, timeLimit, primesRange, currentStage, p, q, e, d, n, ciphertext, remaining, finishTime, chosenMode;

let leaderboard = window.localStorage.getItem("leaderboard");

if (leaderboard === null) {
    leaderboard = [];
    window.localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
} else {
    leaderboard = JSON.parse(leaderboard);
    displayLeaderboard(leaderboard);
}

function startGame(mode, limit, min, max) {
    let playerName = document.getElementById("player-name-text").value;
    if (playerName == null || playerName == "") {
        alert("Please enter player name");
        return;
    }

    chosenMode = mode;
    timeLimit = limit;
    primesRange = { min, max };
    startTime = Date.now();
    currentStage = 1;
    showStage1();
    document.getElementById("level-selection").style.display = "none";
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("game-stage").style.display = "block";
    updateTimer();
}

function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    remaining = timeLimit - elapsed;

    if (remaining <= 0) {
        alert("Time's up! Game over!");
        resetGame();
    } else {
        document.getElementById("timer").innerText = `Time left: ${remaining.toFixed(2)} seconds`;
        setTimeout(updateTimer, 100);
    }
}

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function showStage1() {
    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 1: Prime Number Selection</h2>
        <p>Enter two prime numbers between ${primesRange.min} and ${primesRange.max}:</p>
        <input id="prime-p" type="number" placeholder="Enter prime p">
        <input id="prime-q" type="number" placeholder="Enter prime q">
        <button class="game-btn" onclick="validateStage1()">Submit</button>
    `;
}

function validateStage1() {
    p = parseInt(document.getElementById("prime-p").value);
    q = parseInt(document.getElementById("prime-q").value);

    if (isPrime(p) && isPrime(q) && p >= primesRange.min && q <= primesRange.max) {
        showStage2();
        console.log("p: " + p);
        console.log("q: " + q);
    } else {
        alert("Invalid input! Please ensure both numbers are prime and within the range.");
    }
}

function showStage2() {
    n = p * q;
    console.log("n: " + n);
    const phi = (p - 1) * (q - 1);
    console.log("phi: " + phi);

    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 2: Key Generation</h2>
        <p>n = ${n}, ϕ(n) = ${phi}</p>
        <p>Select a public key exponent (e) such that 1 < e < ϕ(n) and gcd(e, ϕ(n)) = 1:</p>
        <input id="public-e" type="number" placeholder="Enter public key exponent e">
        <button class="game-btn" onclick="validateStage2(${phi})">Submit</button>
    `;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function validateStage2(phi) {
    e = parseInt(document.getElementById("public-e").value);

    if (gcd(e, phi) === 1) {
        d = modInverse(e, phi);
        console.log("d: " + d);
        showStage3();
    } else {
        alert("Invalid input! Ensure gcd(e, ϕ(n)) = 1.");
    }
}

function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return -1;
}

function showStage3() {
    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 3: Encryption</h2>
        <p>Enter a plaintext message to encrypt:</p>
        <input id="plaintext" type="text" placeholder="Enter message">
        <button class="game-btn" onclick="encryptMessage()">Encrypt</button>
    `;
}

function encryptMessage() {
    const message = document.getElementById("plaintext").value;
    console.log("message: " + message);
    // ciphertext = [...message].map(char => (char.charCodeAt(0) ** e) % n);
    
    ciphertext = [];
    for (let i = 0; i < message.length; i++) {
        let messagePlaintext = message.charAt(i);
        let messagePlaintextAscii = message.charCodeAt(i);
        let messagePlaintextAsciiEncrypted = modularExponentiation(messagePlaintextAscii, e, n);

        console.log(`plaintext: ${messagePlaintext}; plaintext ascii: ${messagePlaintextAscii}; encrypted: ${messagePlaintextAsciiEncrypted}`)

        ciphertext.push(messagePlaintextAsciiEncrypted);
    }

    console.log("ciphertext: " + ciphertext);
    showStage4();
}

function showStage4() {
    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 4: Decryption</h2>
        <p>Encrypted message: ${ciphertext.join(" ")}</p>
        <p>Enter your private key (d):</p>
        <input id="private-d" type="number" placeholder="Enter private key">
        <button class="game-btn" onclick="decryptMessage()">Decrypt</button>
    `;
}

function modularExponentiation(base, exponent, modulus) {
    let result = 1;
    base = base % modulus; // Handle base larger than modulus

    while (exponent > 0) {
        // If exponent is odd, multiply base with result
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        // Now exponent must be even
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus; // Square the base
    }
    return result;
}

function decryptMessage() {
    const userD = parseInt(document.getElementById("private-d").value);

    let decryptedMessage = "";
    for (let i = 0; i < ciphertext.length; i++) {
        let decryptedAscii = modularExponentiation(ciphertext[i], userD, n);
        let decryptedChar = String.fromCharCode(decryptedAscii);

        decryptedMessage += decryptedChar;
    }

    if (decryptedMessage.trim()) {
        finishTime = Date.now();
        timeTaken = (finishTime - startTime) / 1000;
        const playerName = document.getElementById("player-name-text").value;
        
        alert(`
            Game Finished!\n
            Decrypted Message: ${decryptedMessage}
        `);
        
        addToLeaderboard(playerName, chosenMode, timeTaken.toFixed(2), getCurrentDateTime());
        resetGame();
    } else {
        alert("Incorrect private key! Try again.");
    }
}

function displayLeaderboard(leaderboard) {
    document.getElementById("leaderboard-list").innerHTML = "";

    document.getElementById("leaderboard-list").innerHTML += `<tr>
    <th>No.</th>
    <th>Player Name</th>
    <th>Mode</th>
    <th>Time Taken</th>
    <th>Date & Time Played</th>
    </tr>`;

    if (leaderboard.length === 0) {
        document.getElementById("leaderboard-list").innerHTML += `<tr>
        <td colspan="5">No Available Data</td>
        </tr>`;
    } else {
        // Sort the leaderboard by timeTaken in ascending order
        leaderboard.sort((a, b) => a.timeTaken - b.timeTaken);

        let leaderboardText = "";
        for (let i = 0; i < leaderboard.length; i++) {
            let data = leaderboard[i];
            let playerInfo = `<tr>
            <td>${(i + 1)}.</td>
            <td>${data.playerName}</td>
            <td>${data.chosenMode}</td>
            <td>${data.timeTaken}</td>
            <td>${data.timePlayed}</td>
            </tr>`;
            leaderboardText += playerInfo;
        }

        document.getElementById("leaderboard-list").innerHTML += leaderboardText;
    }
}

function addToLeaderboard(playerName, chosenMode, timeTaken, currentDateTime) {
    leaderboard.push({
        playerName  : playerName,
        chosenMode  : chosenMode,
        timeTaken   : timeTaken,
        timePlayed  : currentDateTime
    });

    window.localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function getCurrentDateTime() {
    const d = new Date();
    const dayOfMonth = d.getDate();
    const month = d.getMonth() + 1; // Months are zero-based
    const year = d.getFullYear();
    let hour = d.getHours();
    const minute = d.getMinutes();

    // Determine AM or PM
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hour = hour % 12; // Convert to 12-hour format
    hour = hour ? hour : 12; // The hour '0' should be '12'

    // Pad minutes with leading zero if needed
    const formattedMinute = minute < 10 ? '0' + minute : minute;

    const formattedDateTime = `${dayOfMonth}/${month}/${year}, ${hour}:${formattedMinute} ${ampm}`;

    return formattedDateTime;
}

function resetGame() {
    displayLeaderboard(leaderboard);
    document.getElementById("game-stage").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    document.getElementById("leaderboard").style.display = "block";
}