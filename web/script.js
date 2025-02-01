let startTime, timeLimit, primesRange, currentStage, p, q, e, d, n, ciphertext, remaining, finishTime, chosenMode, message;
let leaderboard = window.localStorage.getItem("leaderboard");
let leaderboardElements = document.getElementsByClassName("leaderboard-table");

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

// Function to generate prime numbers using the Sieve of Eratosthenes
const getPrimes = (min, max) => {
    const sieve = Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false; // 0 and 1 are not prime

    for (let i = 2; i * i <= max; i++) {
        if (sieve[i]) {
            for (let j = i * i; j <= max; j += i) {
                sieve[j] = false;
            }
        }
    }

    return sieve.map((isPrime, num) => (isPrime ? num : null)).filter(Boolean).filter(n => n >= min);
};

// Function to get a random prime from the generated list
const getRandPrime = (min, max, inputId) => {
    const primes = getPrimes(min, max);
    if (primes.length === 0) return; // Edge case: No primes found
    document.getElementById(inputId).value = primes[Math.floor(Math.random() * primes.length)];
};

// Function to display Stage 1 UI
function showStage1() {
    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 1: Prime Number Selection</h2>
        <p>Enter two prime numbers between ${primesRange.min} and ${primesRange.max}:</p>
        
        <input id="prime-p" type="number" placeholder="Enter prime p">
        <button class="game-btn" onclick="getRandPrime(${primesRange.min}, ${primesRange.max}, 'prime-p')">
            Generate Random 'p'
        </button>
        <br>

        <input id="prime-q" type="number" placeholder="Enter prime q">
        <button class="game-btn" onclick="getRandPrime(${primesRange.min}, ${primesRange.max}, 'prime-q')">
            Generate Random 'q'
        </button>
        <br>

        <button class="game-btn" onclick="validateStage1()">Submit</button>
    `;
}

function validateStage1() {
    p = parseInt(document.getElementById("prime-p").value);
    q = parseInt(document.getElementById("prime-q").value);

    if (isPrime(p) && isPrime(q) && p >= primesRange.min && q <= primesRange.max)
        showStage2();
    else
        alert("Invalid input! Please ensure both numbers are prime and within the range.");
}

function showStage2() {
    n = p * q;
    const phi = (p - 1) * (q - 1);

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
        console.log("e: " + e);
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
    message = document.getElementById("plaintext").value;
    // console.log("message: " + message);
    // ciphertext = [...message].map(char => (char.charCodeAt(0) ** e) % n);

    ciphertext = [];
    for (let i = 0; i < message.length; i++) {
        let messagePlaintext = message.charAt(i);
        let messagePlaintextAscii = message.charCodeAt(i);
        let messagePlaintextAsciiEncrypted = modularExponentiation(messagePlaintextAscii, e, n);

        // console.log(`plaintext: ${messagePlaintext}; plaintext ascii: ${messagePlaintextAscii}; encrypted: ${messagePlaintextAsciiEncrypted}`)

        ciphertext.push(messagePlaintextAsciiEncrypted);
    }

    // console.log("ciphertext: " + ciphertext);
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

    if (decryptedMessage.trim() === message) {
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

function displayLeaderboardHeader(leaderboard) {
    for (let i = 0; i < leaderboardElements.length; i++) {
        leaderboardElements[i].innerHTML = "";

        leaderboardElements[i].innerHTML += `<tr>
        <th>No.</th>
        <th>Player Name</th>
        <th>Mode</th>
        <th>Time Taken</th>
        <th>Date & Time Played</th>
        </tr>`;

        if (leaderboard.length === 0) {
            leaderboardElements[i].innerHTML += `<tr>
            <td colspan="5">No Available Data</td>
            </tr>`;
        }
    }
}

function displayEmptyLeaderboard(chosenMode) {
    document.getElementById(`leaderboard-${chosenMode}`).innerHTML += `<tr>
    <td colspan="5">No Available Data</td>
    </tr>`;
}

function displayLeaderboardContent(leaderboard, chosenMode, iterNumber) {
    let leaderboardText = "";

    for (let i = 0; i < leaderboard.length; i++) {
        let data = leaderboard[i];
        let playerInfo = `<tr>
        <td>${iterNumber}.</td>
        <td>${data.playerName}</td>
        <td>${data.chosenMode}</td>
        <td>${data.timeTaken}</td>
        <td>${data.timePlayed}</td>
        </tr>`;

        if (data.chosenMode !== chosenMode) { continue; }
        else {
            leaderboardText += playerInfo;
            iterNumber++;
        }
    }

    document.getElementById(`leaderboard-${chosenMode}`).innerHTML += leaderboardText;
}

function displayLeaderboard(leaderboard) {
    displayLeaderboardHeader(leaderboard);

    if (leaderboard.length === 0) {
        return;
    }

    let countEasy = 0, countMedium = 0, countHard = 0;

    for (let i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].chosenMode === "Easy") { countEasy++; }
        else if (leaderboard[i].chosenMode === "Medium") { countMedium++; }
        else { countHard++; }
    }

    // Sort the leaderboard by timeTaken in ascending order
    leaderboard.sort((a, b) => a.timeTaken - b.timeTaken);

    if (countEasy === 0) {
        displayEmptyLeaderboard("Easy");
    } else if (countEasy > 0) {
        let iterEasy = 1;
        displayLeaderboardContent(leaderboard, "Easy", iterEasy);
    }
    if (countMedium === 0) {
        displayEmptyLeaderboard("Medium");
    } else if (countMedium > 0) {
        let iterMedium = 1;
        displayLeaderboardContent(leaderboard, "Medium", iterMedium);
    }
    if (countHard === 0) {
        displayEmptyLeaderboard("Hard");
    } else if (countHard > 0) {
        let iterHard = 1;
        displayLeaderboardContent(leaderboard, "Hard", iterHard);
    }
}

function addToLeaderboard(playerName, chosenMode, timeTaken, currentDateTime) {
    leaderboard.push({
        playerName: playerName,
        chosenMode: chosenMode,
        timeTaken: timeTaken,
        timePlayed: currentDateTime
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