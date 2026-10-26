/* =========================================================
   FOCUS ELICIGO
   COMPLETE SCRIPT.JS
   ========================================================= */

"use strict";


/* =========================================================
   SETTINGS
========================================================= */

const DAILY_GOAL = 60;

let selectedMinutes = 25;
let selectedMode = "easy";

let timerInterval = null;
let remainingSeconds = selectedMinutes * 60;

let sessionRunning = false;
let sessionPaused = false;


/* =========================================================
   DATA
========================================================= */

let appData = {

    focusTime:
        Number(localStorage.getItem("focusTime")) || 0,

    sessions:
        Number(localStorage.getItem("sessions")) || 0,

    streak:
        Number(localStorage.getItem("streak")) || 0,

    bestStreak:
        Number(localStorage.getItem("bestStreak")) || 0,

    todayMinutes:
        Number(localStorage.getItem("todayMinutes")) || 0,

    todayDate:
        localStorage.getItem("todayDate") || "",

    history:
        JSON.parse(
            localStorage.getItem("sessionHistory") || "[]"
        ),

    websites:
        JSON.parse(
            localStorage.getItem("blockedWebsites") || "[]"
        ),

    mediumPin:
        localStorage.getItem("mediumPin") || ""
};


/* =========================================================
   ELEMENTS
========================================================= */

const durationButtons =
    document.querySelectorAll(".duration-btn");

const modeButtons =
    document.querySelectorAll(".mode-btn");

const mediumPinSection =
    document.getElementById("mediumPinSection");

const mediumPinInput =
    document.getElementById("mediumPin");

const confirmMediumPinInput =
    document.getElementById("confirmMediumPin");

const saveMediumPinButton =
    document.getElementById("saveMediumPin");

const pinStatus =
    document.getElementById("pinStatus");

const timerDisplay =
    document.getElementById("timerDisplay");

const startButton =
    document.getElementById("startBtn");

const pauseButton =
    document.getElementById("pauseBtn");

const stopButton =
    document.getElementById("stopBtn");

const focusStatus =
    document.getElementById("focusStatus");

const blockingStatus =
    document.getElementById("blockingStatus");

const blockingStatusSmall =
    document.getElementById("blockingStatusSmall");

const focusTimeElement =
    document.getElementById("focusTime");

const sessionsElement =
    document.getElementById("sessions");

const streakElement =
    document.getElementById("streak");

const todayMinutesElement =
    document.getElementById("todayMinutes");

const bestStreakElement =
    document.getElementById("bestStreak");

const goalText =
    document.getElementById("goalText");

const progressBar =
    document.getElementById("progressBar");

const progressMessage =
    document.getElementById("progressMessage");

const sessionHistoryList =
    document.getElementById("sessionHistoryList");

const websiteInput =
    document.getElementById("websiteInput");

const addWebsiteButton =
    document.getElementById("addWebsiteBtn");

const blockedWebsites =
    document.getElementById("blockedWebsites");

const blockedCount =
    document.getElementById("blockedCount");


/* =========================================================
   DATE
========================================================= */

function getTodayKey() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );
}


/* =========================================================
   RESET DAILY DATA
========================================================= */

function resetTodayIfNeeded() {

    const today = getTodayKey();

    if (appData.todayDate !== today) {

        appData.todayDate = today;

        appData.todayMinutes = 0;

        localStorage.setItem(
            "todayDate",
            today
        );

        localStorage.setItem(
            "todayMinutes",
            "0"
        );
    }
}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        "focusTime",
        String(appData.focusTime)
    );

    localStorage.setItem(
        "sessions",
        String(appData.sessions)
    );

    localStorage.setItem(
        "streak",
        String(appData.streak)
    );

    localStorage.setItem(
        "bestStreak",
        String(appData.bestStreak)
    );

    localStorage.setItem(
        "todayMinutes",
        String(appData.todayMinutes)
    );

    localStorage.setItem(
        "todayDate",
        appData.todayDate
    );

    localStorage.setItem(
        "sessionHistory",
        JSON.stringify(appData.history)
    );

    localStorage.setItem(
        "blockedWebsites",
        JSON.stringify(appData.websites)
    );

    localStorage.setItem(
        "mediumPin",
        appData.mediumPin
    );
}


/* =========================================================
   TIMER DISPLAY
========================================================= */

function updateTimerDisplay() {

    if (!timerDisplay) {
        return;
    }

    const minutes =
        Math.floor(remainingSeconds / 60);

    const seconds =
        remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


/* =========================================================
   DURATION SELECTION
========================================================= */

durationButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (sessionRunning) {
            return;
        }

        durationButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedMinutes =
            Number(button.dataset.minutes);

        remainingSeconds =
            selectedMinutes * 60;

        updateTimerDisplay();
    });

});


/* =========================================================
   MODE SELECTION
========================================================= */

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (sessionRunning) {
            return;
        }

        const requestedMode =
            button.dataset.mode;


        /* -----------------------------------------
           MEDIUM REQUIRES PIN
        ----------------------------------------- */

        if (requestedMode === "medium") {

            if (!appData.mediumPin) {

                alert(
                    "You must create a 4-digit Medium Focus PIN before activating Medium Focus."
                );

                if (mediumPinSection) {
                    mediumPinSection.style.display =
                        "block";
                }

                if (mediumPinInput) {
                    mediumPinInput.focus();
                }

                return;
            }
        }


        modeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedMode =
            requestedMode;

        updatePinSection();

        updateControlButtons();
    });

});


/* =========================================================
   MEDIUM PIN SECTION
========================================================= */

function updatePinSection() {

    if (!mediumPinSection) {
        return;
    }

    if (selectedMode === "medium") {

        mediumPinSection.style.display =
            "block";

    } else {

        mediumPinSection.style.display =
            "none";

        if (pinStatus) {
            pinStatus.textContent = "";
        }
    }
}


/* =========================================================
   SAVE MEDIUM PIN
========================================================= */

if (saveMediumPinButton) {

    saveMediumPinButton.addEventListener(
        "click",
        () => {

            const pin =
                mediumPinInput.value.trim();

            const confirmPin =
                confirmMediumPinInput.value.trim();


            if (!/^\d{4}$/.test(pin)) {

                pinStatus.textContent =
                    "PIN must be exactly 4 digits.";

                return;
            }


            if (pin !== confirmPin) {

                pinStatus.textContent =
                    "PINs do not match.";

                return;
            }


            appData.mediumPin =
                pin;


            localStorage.setItem(
                "mediumPin",
                pin
            );


            pinStatus.textContent =
                "PIN saved successfully.";

            mediumPinInput.value = "";

            confirmMediumPinInput.value = "";
        }
    );
}


/* =========================================================
   MEDIUM PIN CHECK
========================================================= */

function requestMediumPin() {

    if (!appData.mediumPin) {

        alert(
            "Please create your Medium Focus PIN first."
        );

        return false;
    }


    const enteredPin =
        prompt(
            "Enter your 4-digit Medium Focus PIN:"
        );


    if (enteredPin === null) {
        return false;
    }


    if (enteredPin !== appData.mediumPin) {

        alert(
            "Incorrect PIN."
        );

        return false;
    }


    return true;
}


/* =========================================================
   CONTROL BUTTONS
========================================================= */

function updateControlButtons() {

    if (!pauseButton || !stopButton) {
        return;
    }


    /*
       STOP LOOKS LIKE PAUSE.
       Remove the old danger styling.
    */

    stopButton.classList.remove(
        "danger-btn"
    );


    if (!sessionRunning) {

        pauseButton.disabled = true;

        stopButton.disabled = true;

        pauseButton.textContent =
            "PAUSE";

        stopButton.textContent =
            "STOP";

        return;
    }


    /* -----------------------------------------
       STRICT MODE
    ----------------------------------------- */

    if (selectedMode === "strict") {

        pauseButton.disabled = true;

        stopButton.disabled = true;

        pauseButton.textContent =
            "PAUSE";

        stopButton.textContent =
            "STOP";

        return;
    }


    /* -----------------------------------------
       EASY MODE
    ----------------------------------------- */

    if (selectedMode === "easy") {

        pauseButton.disabled = false;

        stopButton.disabled = false;

        return;
    }


    /* -----------------------------------------
       MEDIUM MODE
    ----------------------------------------- */

    if (selectedMode === "medium") {

        pauseButton.disabled = false;

        stopButton.disabled = false;

        return;
    }
}


/* =========================================================
   FOCUS UI
========================================================= */

function setFocusActiveUI() {

    document.body.classList.add(
        "focus-active"
    );

    focusStatus.textContent =
        "Focus Mode: ON";

    blockingStatus.textContent =
        "Blocking: ON";

    blockingStatusSmall.textContent =
        "ON";

    startButton.textContent =
        "FOCUS IN PROGRESS";

    startButton.disabled = true;

    /*
       IMPORTANT:
       Re-render websites so REMOVE
       changes to 🔐 immediately.
    */

    renderWebsites();
}


function setFocusInactiveUI() {

    document.body.classList.remove(
        "focus-active"
    );

    focusStatus.textContent =
        "Focus Mode: OFF";

    blockingStatus.textContent =
        "Blocking: OFF";

    blockingStatusSmall.textContent =
        "OFF";

    startButton.textContent =
        "START FOCUS";

    startButton.disabled = false;

    /*
       Re-render websites so 🔐
       changes back to REMOVE.
    */

    renderWebsites();
}


/* =========================================================
   START SESSION
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        if (sessionRunning) {
            return;
        }


        /* -----------------------------------------
           MEDIUM SAFETY CHECK
        ----------------------------------------- */

        if (
            selectedMode === "medium" &&
            !appData.mediumPin
        ) {

            alert(
                "You must create a Medium Focus PIN before starting Medium Focus."
            );

            if (mediumPinSection) {
                mediumPinSection.style.display =
                    "block";
            }

            return;
        }


        resetTodayIfNeeded();


        sessionRunning = true;

        sessionPaused = false;


        remainingSeconds =
            selectedMinutes * 60;


        updateTimerDisplay();


        setFocusActiveUI();

        updateControlButtons();


        startTimer();
    }
);


/* =========================================================
   START TIMER
========================================================= */

function startTimer() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(
            () => {

                if (sessionPaused) {
                    return;
                }


                remainingSeconds--;

                updateTimerDisplay();


                if (remainingSeconds <= 0) {

                    clearInterval(
                        timerInterval
                    );

                    timerInterval = null;

                    completeSession();
                }

            },
            1000
        );
}


/* =========================================================
   PAUSE
========================================================= */

pauseButton.addEventListener(
    "click",
    () => {

        if (!sessionRunning) {
            return;
        }


        /* -----------------------------------------
           STRICT CANNOT PAUSE
        ----------------------------------------- */

        if (selectedMode === "strict") {

            alert(
                "Strict Focus cannot be paused."
            );

            return;
        }


        /* -----------------------------------------
           MEDIUM REQUIRES PIN
        ----------------------------------------- */

        if (selectedMode === "medium") {

            if (!requestMediumPin()) {
                return;
            }
        }


        sessionPaused =
            !sessionPaused;


        if (sessionPaused) {

            pauseButton.textContent =
                "RESUME";

            focusStatus.textContent =
                "Focus Mode: PAUSED";

        } else {

            pauseButton.textContent =
                "PAUSE";

            focusStatus.textContent =
                "Focus Mode: ON";
        }
    }
);


/* =========================================================
   STOP
========================================================= */

stopButton.addEventListener(
    "click",
    () => {

        if (!sessionRunning) {
            return;
        }


        /* -----------------------------------------
           STRICT CANNOT STOP
        ----------------------------------------- */

        if (selectedMode === "strict") {

            alert(
                "Strict Focus cannot be stopped before the timer finishes."
            );

            return;
        }


        /* -----------------------------------------
           MEDIUM REQUIRES PIN
        ----------------------------------------- */

        if (selectedMode === "medium") {

            if (!requestMediumPin()) {
                return;
            }
        }


        stopSession();
    }
);


/* =========================================================
   STOP INCOMPLETE SESSION
========================================================= */

function stopSession() {

    clearInterval(
        timerInterval
    );

    timerInterval = null;


    sessionRunning = false;

    sessionPaused = false;


    /*
       INCOMPLETE SESSION IS DISCARDED.

       It does NOT count as:
       - Focus time
       - Session
       - Streak
       - Today's progress
       - History
    */


    remainingSeconds =
        selectedMinutes * 60;


    updateTimerDisplay();


    setFocusInactiveUI();


    pauseButton.disabled = true;

    stopButton.disabled = true;


    pauseButton.textContent =
        "PAUSE";

    stopButton.textContent =
        "STOP";


    renderStatistics();

    renderHistory();
}


/* =========================================================
   COMPLETE SESSION
========================================================= */

function completeSession() {

    sessionRunning = false;

    sessionPaused = false;


    clearInterval(
        timerInterval
    );

    timerInterval = null;


    const completedMinutes =
        selectedMinutes;


    /* -----------------------------------------
       COUNT COMPLETED SESSION
    ----------------------------------------- */

    appData.focusTime +=
        completedMinutes;

    appData.sessions +=
        1;

    appData.todayMinutes +=
        completedMinutes;


    updateStreak();


    /* -----------------------------------------
       HISTORY
    ----------------------------------------- */

    appData.history.unshift({

        date:
            new Date().toLocaleDateString(),

        time:
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ),

        duration:
            completedMinutes,

        mode:
            selectedMode,

        status:
            "completed"
    });


    /*
       Only completed sessions remain.
    */

    appData.history =
        appData.history
            .filter(
                session =>
                    session.status ===
                    "completed"
            )
            .slice(0, 20);


    saveData();


    renderStatistics();

    renderHistory();


    setFocusInactiveUI();


    pauseButton.disabled = true;

    stopButton.disabled = true;


    pauseButton.textContent =
        "PAUSE";

    stopButton.textContent =
        "STOP";


    remainingSeconds = 0;

    updateTimerDisplay();


    startButton.textContent =
        "SESSION COMPLETE";


    alert(
        "Focus session completed! Great work."
    );


    setTimeout(
        () => {

            remainingSeconds =
                selectedMinutes * 60;

            updateTimerDisplay();

            startButton.textContent =
                "START FOCUS";

        },
        1000
    );
}


/* =========================================================
   STREAK
========================================================= */

function updateStreak() {

    const today =
        getTodayKey();

    const lastCompletedDate =
        localStorage.getItem(
            "lastCompletedDate"
        );


    if (!lastCompletedDate) {

        appData.streak = 1;

    } else {

        const lastDate =
            new Date(lastCompletedDate);

        const todayDate =
            new Date(today);


        const difference =
            Math.floor(
                (
                    todayDate.getTime() -
                    lastDate.getTime()
                ) /
                (1000 * 60 * 60 * 24)
            );


        if (difference === 0) {

            /*
               Already completed today.
            */

        } else if (difference === 1) {

            appData.streak += 1;

        } else {

            appData.streak = 1;
        }
    }


    if (
        appData.streak >
        appData.bestStreak
    ) {

        appData.bestStreak =
            appData.streak;
    }


    localStorage.setItem(
        "lastCompletedDate",
        today
    );
}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    resetTodayIfNeeded();


    focusTimeElement.textContent =
        appData.focusTime;

    sessionsElement.textContent =
        appData.sessions;

    streakElement.textContent =
        appData.streak;

    todayMinutesElement.textContent =
        appData.todayMinutes;

    bestStreakElement.textContent =
        appData.bestStreak;


    goalText.textContent =
        `${Math.min(
            appData.todayMinutes,
            DAILY_GOAL
        )} / ${DAILY_GOAL} min`;


    const percentage =
        Math.min(
            (
                appData.todayMinutes /
                DAILY_GOAL
            ) * 100,
            100
        );


    progressBar.style.width =
        percentage + "%";


    const remaining =
        Math.max(
            DAILY_GOAL -
            appData.todayMinutes,
            0
        );


    if (remaining > 0) {

        progressMessage.textContent =
            `${remaining} minutes remaining today.`;

    } else {

        progressMessage.textContent =
            "Daily focus goal completed! 🎉";
    }
}


/* =========================================================
   SESSION HISTORY
========================================================= */

function renderHistory() {

    /*
       Delete incomplete sessions from
       previous versions.
    */

    appData.history =
        appData.history.filter(
            session =>
                session.status ===
                "completed"
        );


    saveData();


    if (!appData.history.length) {

        sessionHistoryList.innerHTML = `
            <div class="empty-history">
                No completed sessions yet.
            </div>
        `;

        return;
    }


    sessionHistoryList.innerHTML =
        appData.history
            .map(
                session => {

                    return `
                        <div class="session-history-item">

                            <div>

                                <strong>
                                    ${session.duration}
                                    minute focus
                                </strong>

                                <small>
                                    ${session.date}
                                    • ${session.time}
                                    • ${String(
                                        session.mode
                                    ).toUpperCase()}
                                </small>

                            </div>

                            <span class="completed">
                                COMPLETED
                            </span>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   WEBSITE NORMALIZATION
========================================================= */

function normalizeWebsite(value) {

    return value
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");
}


/* =========================================================
   RENDER BLOCKED WEBSITES
========================================================= */

function renderWebsites() {

    if (!blockedWebsites) {
        return;
    }


    blockedCount.textContent =
        appData.websites.length;


    if (!appData.websites.length) {

        blockedWebsites.innerHTML = `
            <li class="empty-blocked">
                No websites blocked yet.
            </li>
        `;

        return;
    }


    /*
       IMPORTANT:

       FOCUS ON:
           🔐

       FOCUS OFF:
           REMOVE

       ADD BUTTON:
           ALWAYS AVAILABLE
    */


    blockedWebsites.innerHTML =
        appData.websites
            .map(
                website => {

                    if (sessionRunning) {

                        return `
                            <li>

                                <span>
                                    ${website}
                                </span>

                                <span
                                    class="locked-website"
                                    title="Website locked during Focus Mode"
                                    aria-label="Website locked"
                                >
                                    🔐
                                </span>

                            </li>
                        `;
                    }


                    return `
                        <li>

                            <span>
                                ${website}
                            </span>

                            <button
                                type="button"
                                class="remove-website-btn"
                                data-website="${website}"
                            >
                                REMOVE
                            </button>

                        </li>
                    `;
                }
            )
            .join("");


    /* -----------------------------------------
       REMOVE BUTTONS
    ----------------------------------------- */

    if (!sessionRunning) {

        const removeButtons =
            blockedWebsites.querySelectorAll(
                ".remove-website-btn"
            );


        removeButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        removeWebsite(
                            button.dataset.website
                        );
                    }
                );
            }
        );
    }
}


/* =========================================================
   REMOVE WEBSITE
========================================================= */

function removeWebsite(website) {

    /*
       REMOVE IS LOCKED DURING FOCUS.

       ADD IS NOT LOCKED.
    */

    if (sessionRunning) {

        alert(
            "You cannot remove blocked websites while Focus Mode is active."
        );

        renderWebsites();

        return;
    }


    const index =
        appData.websites.indexOf(
            website
        );


    if (index === -1) {
        return;
    }


    appData.websites.splice(
        index,
        1
    );


    saveData();

    renderWebsites();
}


/* =========================================================
   ADD WEBSITE
========================================================= */

if (addWebsiteButton) {

    addWebsiteButton.addEventListener(
        "click",
        addWebsite
    );
}


if (websiteInput) {

    websiteInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addWebsite();
            }
        }
    );
}


function addWebsite() {

    /*
       IMPORTANT:

       ADDING A WEBSITE IS ALWAYS ALLOWED.

       Even when Focus Mode is ON.

       Only REMOVE is locked.
    */


    const website =
        normalizeWebsite(
            websiteInput.value
        );


    if (!website) {

        alert(
            "Please enter a website."
        );

        return;
    }


    if (
        appData.websites.includes(
            website
        )
    ) {

        alert(
            "That website is already blocked."
        );

        return;
    }


    appData.websites.push(
        website
    );


    saveData();


    websiteInput.value = "";


    /*
       Immediately refresh the list.

       If Focus Mode is ON,
       the new website will appear
       with 🔐.
    */

    renderWebsites();
}


/* =========================================================
   INITIALIZE APP
========================================================= */

function initializeApp() {

    resetTodayIfNeeded();


    /*
       Clean old incomplete history.
    */

    appData.history =
        appData.history.filter(
            session =>
                session.status ===
                "completed"
        );


    saveData();


    updateTimerDisplay();

    updatePinSection();

    renderStatistics();

    renderHistory();

    renderWebsites();

    updateControlButtons();
}


/* =========================================================
   START APPLICATION
========================================================= */

initializeApp();
