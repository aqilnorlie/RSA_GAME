let startTime, timeLimit, primesRange, currentStage;
let p, q, e, d, n, phi;
let ciphertext, remaining, finishTime, chosenMode, message;
let lastSelectedPrime = null;

let leaderboard = window.localStorage.getItem("leaderboard");
let leaderboardElements = document.getElementsByClassName("leaderboard-table");

if (leaderboard === null) {
    leaderboard = [];
    window.localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
} else {
    leaderboard = JSON.parse(leaderboard);
    displayLeaderboard(leaderboard);
}

document.getElementById("player-name-text").focus();

function startGame(mode, limit, min, max) {
    let playerName = document.getElementById("player-name-text").value;
    if (playerName === null || playerName === "") {
        alert("Please enter player name.");
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
    document.getElementById("prime-p").focus();
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

    // Filter out the last selected prime if it exists
    const availablePrimes = lastSelectedPrime ? primes.filter(prime => prime !== lastSelectedPrime) : primes;

    // If there are no available primes left, just return
    if (availablePrimes.length === 0) return;

    // Select a random prime from the available primes
    const selectedPrime = availablePrimes[Math.floor(Math.random() * availablePrimes.length)];
    document.getElementById(inputId).value = selectedPrime;

    // Update the last selected prime
    lastSelectedPrime = selectedPrime;
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
    let pInput = document.getElementById("prime-p").value;
    let qInput = document.getElementById("prime-q").value;

    if (pInput === null || pInput === "" || qInput === null || qInput === "") {
        alert("Plese enter values for 'p' and 'q'.");
        return;
    }

    p = parseInt(pInput);
    q = parseInt(qInput);

    if (isPrime(p) && isPrime(q) && p >= primesRange.min && q <= primesRange.max && p !== q) {
        showStage2();
        document.getElementById("public-e").focus();
    }
    else {
        alert(`
            Invalid input!
            Please ensure that both numbers 'p' and 'q' are:
            - prime numbers
            - within the set range
            - different from each other
        `);
        return;
    }
}

function showStage2() {
    n = p * q;
    phi = (p - 1) * (q - 1);

    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 2: Key Generation</h2>
        <p>n = ${n}, ϕ(n) = ${phi}</p>
        <p>Select a public key exponent (e) such that 1 < e < ϕ(n) and gcd(e, ϕ(n)) = 1:</p>
        <label for="public-e">Enter Public Key (e):</label>
        <input id="public-e" type="number" list="valid-e-values">
        <datalist id="valid-e-values"></datalist>
        <button class="game-btn" onclick="validateStage2()">Submit</button>
    `;

    populateEDataList(phi);
}

function getValidEs(phiN) {
    let validEs = [];
    for (let eVal = 2; validEs.length < 15 && eVal < phiN; eVal++) {
        if (gcd(eVal, phiN) === 1) {
            validEs.push(eVal);
        }
    }
    return validEs;
}

function populateEDataList(phiN) {
    const eDataList = document.getElementById("valid-e-values");
    eDataList.innerHTML = "";

    const validEs = getValidEs(phiN);
    validEs.forEach(eVal => {
        let option = document.createElement("option");
        option.value = eVal;
        eDataList.appendChild(option);
    });
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function find_d() {
    let result = 0;
    let condition = true;
    let time = 1;

    while (condition) {
        result = (phi * time) + 1;
        result = result / e;
        let resultInt = Number(result);

        if (Number.isInteger(resultInt)) {
            condition = false;
        } else {
            time += 1; // Increment time
        }
    }
    return result;
}

function validateStage2() {
    let eInput = document.getElementById("public-e").value;

    if (eInput === null || eInput === "") {
        alert("Plese enter 'e'.");
        return;
    }

    e = parseInt(eInput);

    if (gcd(e, phi) === 1) {
        d = modInverse(e, phi);
        // d = find_d()
        console.log("e: " + e);
        console.log("d: " + d);
        showStage3();
        document.getElementById("plaintext").focus();
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
    
    if (message === null || message === "") {
        alert("Plese enter the message to be encrypted.");
        return;
    }
    
    ciphertext = [];
    for (let i = 0; i < message.length; i++) {
        let messagePlaintext = message.charAt(i);
        let messagePlaintextAscii = message.charCodeAt(i);
        let messagePlaintextAsciiEncrypted = modularExponentiation(messagePlaintextAscii, e, n);

        ciphertext.push(messagePlaintextAsciiEncrypted);
    }
    showStage4();
    document.getElementById("private-d").focus();
}

function showDValue() {
    // Set the value of 'd' in the modal
    document.getElementById("d-value").innerText = `Value of private key 'd' for the chosen public key 'e' (${e}): ${d}`;

    // Show the modal and overlay
    document.getElementById("modal").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    // Copy to clipboard functionality
    document.getElementById("copy-button").onclick = function() {
        // Create a temporary textarea element to hold the value
        const textarea = document.createElement("textarea");
        textarea.value = d; // Set the value to 'd'
        document.body.appendChild(textarea);
        textarea.select(); // Select the text
        document.execCommand("copy"); // Copy the text to clipboard
        document.body.removeChild(textarea); // Remove the textarea

        alert("Value copied to clipboard!"); // Notify the user

        document.getElementById("modal").style.display = "none";
        document.getElementById("overlay").style.display = "none";

        document.getElementById("private-d").focus();
    };
}

function showStage4() {
    document.getElementById("stage-content").innerHTML = `
        <h2>Stage 4: Decryption</h2>
        <p>Encrypted message: ${ciphertext.join(" ")}</p>
        <p>Enter your private key (d):</p>
        <input id="private-d" type="number" placeholder="Enter private key">
        <button id="show-d-btn" class="game-btn" onclick="showDValue()">Hint: Show 'd'</button>
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
    let dInput = document.getElementById("private-d").value;

    if (dInput === null || dInput === "") {
        alert("Plese enter the value of 'd'.");
        return;
    }
    
    let userD = parseInt(dInput);

    let decryptedMessage = "";
    for (let i = 0; i < ciphertext.length; i++) {
        let decryptedAscii = modularExponentiation(ciphertext[i], userD, n);
        let decryptedChar = String.fromCharCode(decryptedAscii);
        decryptedMessage += decryptedChar;
    }

    let trimmedDecryptedMessage = decryptedMessage.trim();

    console.log(`Decrypted message: ${trimmedDecryptedMessage}`);

    if (trimmedDecryptedMessage === message) {
        finishTime = Date.now();
        timeTaken = (finishTime - startTime) / 1000;
        const playerName = document.getElementById("player-name-text").value;

        alert(`
            Game finished!
            Decrypted message matches with original message!
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
        <th>Time Taken (seconds)</th>
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
    const second = d.getSeconds(); // Get the current seconds

    // Determine AM or PM
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hour = hour % 12; // Convert to 12-hour format
    hour = hour ? hour : 12; // The hour '0' should be '12'

    // Pad minutes and seconds with leading zero if needed
    const formattedMinute = minute < 10 ? '0' + minute : minute;
    const formattedSecond = second < 10 ? '0' + second : second; // Pad seconds

    // Construct the formatted date and time string including seconds
    const formattedDateTime = `${dayOfMonth}/${month}/${year}, ${hour}:${formattedMinute}:${formattedSecond} ${ampm}`;

    return formattedDateTime;
}

function resetGame() {
    displayLeaderboard(leaderboard);
    document.getElementById("game-stage").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    document.getElementById("leaderboard").style.display = "block";
}