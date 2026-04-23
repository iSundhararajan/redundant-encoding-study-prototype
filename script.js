const USE_LOCAL_ONLY = false;
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOv3055LJg2sUhc7FBACmSk9McT90XG8LboOKm-gXvYnUN80GxF_09VQiYt7PXVSZv5g/exec"; // paste the Apps Script Web App URL here after deploying

const TABLEAU_URLS = {
  colorOnly:
    "https://public.tableau.com/views/HeartDiseaseMortalityRate_Color/ColorOnly?:showVizHome=no&:embed=true",
  colorSize:
    "https://public.tableau.com/views/HeartDiseaseMortalityRate_Size/ColorSize?:showVizHome=no&:embed=true",
  colorShape:
    "https://public.tableau.com/views/HeartDiseaseMortalityRate_Pattern/ColorPattern?:showVizHome=no&:embed=true"
};

const baseTasks = [
  {
    id: "B2",
    condition: "Color + Size",
    taskType: "Pairwise Comparison",
    tableauKey: "colorSize",
    question: "Which state has a higher mortality rate?",
    options: ["California", "New York", "About the same"]
  },
  {
    id: "A1",
    condition: "Color-only",
    taskType: "Extreme Value Identification",
    tableauKey: "colorOnly",
    question: "Which state appears to have the highest mortality rate?",
    options: ["Mississippi", "California", "Colorado", "Washington"]
  },
  {
    id: "C3",
    condition: "Color + Shape",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorShape",
    question: "Which region shows the largest contiguous area of high values?",
    options: ["Southeast", "Midwest", "Northeast", "West Coast"]
  },
  {
    id: "B4",
    condition: "Color + Size",
    taskType: "Extreme Value Identification",
    tableauKey: "colorSize",
    question: "Which state appears to have the highest mortality rate?",
    options: ["Mississippi", "California", "Colorado", "Washington"]
  },
  {
    id: "A3",
    condition: "Color-only",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorOnly",
    question: "Which region shows the strongest concentration of high values?",
    options: ["Southeast", "West Coast", "Northeast", "Midwest"]
  },
  {
    id: "C1",
    condition: "Color + Shape",
    taskType: "Extreme Value Identification",
    tableauKey: "colorShape",
    question: "Which state falls in the second-highest category?",
    options: ["Alabama", "California", "Oregon", "Colorado"]
  },
  {
    id: "B1",
    condition: "Color + Size",
    taskType: "Extreme Value Identification",
    tableauKey: "colorSize",
    question: "Which state appears to have the lowest mortality rate?",
    options: ["Utah", "Mississippi", "Kentucky", "Arkansas"]
  },
  {
    id: "A5",
    condition: "Color-only",
    taskType: "Pairwise Comparison",
    tableauKey: "colorOnly",
    question: "Which state has a higher mortality rate?",
    options: ["Florida", "Minnesota", "About the same"]
  },
  {
    id: "C6",
    condition: "Color + Shape",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorShape",
    question: "Which region has the least concentration of high values?",
    options: ["West Coast", "Southeast", "Midwest", "Northeast"]
  },
  {
    id: "B3",
    condition: "Color + Size",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorSize",
    question: "Where do high values appear most spatially grouped?",
    options: ["Southeast", "Southwest", "Northeast", "West Coast"]
  },
  {
    id: "A2",
    condition: "Color-only",
    taskType: "Pairwise Comparison",
    tableauKey: "colorOnly",
    question: "Which state has a higher mortality rate?",
    options: ["Alabama", "Utah", "About the same"]
  },
  {
    id: "C4",
    condition: "Color + Shape",
    taskType: "Extreme Value Identification",
    tableauKey: "colorShape",
    question: "Which state falls in the lowest category?",
    options: ["Utah", "Mississippi", "Alabama", "Arkansas"]
  },
  {
    id: "B5",
    condition: "Color + Size",
    taskType: "Pairwise Comparison",
    tableauKey: "colorSize",
    question: "Which state has a higher mortality rate?",
    options: ["Georgia", "Oregon", "About the same"]
  },
  {
    id: "A4",
    condition: "Color-only",
    taskType: "Extreme Value Identification",
    tableauKey: "colorOnly",
    question: "Which state appears to have the lowest mortality rate?",
    options: ["New Jersey", "North Dakota", "California", "Tennessee"]
  },
  {
    id: "C2",
    condition: "Color + Shape",
    taskType: "Pairwise Comparison",
    tableauKey: "colorShape",
    question: "Which state has a higher mortality rate?",
    options: ["Kentucky", "Washington", "About the same"]
  },
  {
    id: "B6",
    condition: "Color + Size",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorSize",
    question: "Which region shows mostly lower mortality values?",
    options: ["West Coast", "Southeast", "Midwest", "Northeast"]
  },
  {
    id: "A6",
    condition: "Color-only",
    taskType: "Spatial Cluster Detection",
    tableauKey: "colorOnly",
    question: "Which region shows mostly lower mortality rates?",
    options: ["West Coast", "Southeast", "Midwest", "Northeast"]
  },
  {
    id: "C5",
    condition: "Color + Shape",
    taskType: "Pairwise Comparison",
    tableauKey: "colorShape",
    question: "Which state has a higher mortality rate?",
    options: ["Texas", "New York", "About the same"]
  }
];

let tasks = [];
let currentTaskIndex = -1;
let taskStartTime = null;

const studyData = {
  participant: {
    participantId: "",
    age:"",
    major: "",
    vizExperience: "",
    consentGivenAt: "",
    conditionOrderId: "",
    conditionOrder: []
  },
  tasks: [],
  final: {}
};

const screens = {
  intro: document.getElementById("screen-intro"),
  task: document.getElementById("screen-task"),
  finish: document.getElementById("screen-finish")
};

const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");
const startBtn = document.getElementById("startBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBackBtn = document.getElementById("finishBackBtn");
const submitBtn = document.getElementById("submitBtn");
const downloadBtn = document.getElementById("downloadBtn");
const introError = document.getElementById("introError");
const taskError = document.getElementById("taskError");
const finishError = document.getElementById("finishError");
const finishSuccess = document.getElementById("finishSuccess");
const conditionBadge = document.getElementById("conditionBadge");
const questionText = document.getElementById("questionText");
const taskMeta = document.getElementById("taskMeta");
const answerOptions = document.getElementById("answerOptions");
const confidenceOptions = document.getElementById("confidenceOptions");
const tableauVizContainer = document.getElementById("tableauVizContainer");

const LIKERT_ANCHORS = {
  1: "1 — Not confident at all",
  2: "2",
  3: "3 — Somewhat confident",
  4: "4",
  5: "5 — Extremely confident"
};

const STORAGE_KEY = "redundantEncodingStudy:v1";


function shuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateParticipantId() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return "P-" + time + "-" + random;
}

function persistToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studyData));
  } catch (_) {}
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
  updateProgress();
}

function updateProgress() {
  if (currentTaskIndex < 0) {
    progressLabel.textContent = "Welcome";
    progressFill.style.width = "0%";
    return;
  }
  const totalSteps = tasks.length + 1;
  const currentStep = Math.min(currentTaskIndex + 1, totalSteps);
  progressLabel.textContent =
    currentTaskIndex < tasks.length
      ? `Task ${currentTaskIndex + 1} of ${tasks.length}`
      : "Final Feedback";
  progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
}

function clearAlerts() {
  [introError, taskError, finishError, finishSuccess].forEach((el) =>
    el.classList.remove("show")
  );
}

function createRadioOption(name, value, labelText) {
  const label = document.createElement("label");
  label.className = "option";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.value = value;
  label.appendChild(input);
  label.appendChild(document.createTextNode(labelText));
  return label;
}

function renderTableauEmbed(tableauKey, onReady) {
  const url = TABLEAU_URLS[tableauKey];
  if (!url) {
    tableauVizContainer.innerHTML = "Error: URL not found.";
    if (onReady) onReady();
    return;
  }
  tableauVizContainer.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.width = "100%";
  iframe.height = "520";
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  iframe.title = "Tableau Visualization";
  iframe.addEventListener("load", () => { if (onReady) onReady(); });
  tableauVizContainer.appendChild(iframe);
}

function renderTask() {
  clearAlerts();
  const task = tasks[currentTaskIndex];
  const prior = studyData.tasks[currentTaskIndex];

  conditionBadge.textContent = task.condition;
  questionText.textContent = task.question;
  taskMeta.textContent = `${task.taskType} • Each question is independent. Please focus only on the current map.`;

  taskStartTime = null;
  renderTableauEmbed(task.tableauKey, () => {
    if (!prior) {
      taskStartTime = performance.now();
    }
  });

  answerOptions.innerHTML = "";
  task.options.forEach((option) => {
    const radio = createRadioOption("answer", option, option);
    if (prior && prior.answer === option) {
      radio.querySelector("input").checked = true;
    }
    answerOptions.appendChild(radio);
  });

  confidenceOptions.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const radio = createRadioOption("confidence", String(i), LIKERT_ANCHORS[i]);
    if (prior && Number(prior.confidence) === i) {
      radio.querySelector("input").checked = true;
    }
    confidenceOptions.appendChild(radio);
  }

  prevBtn.style.visibility = currentTaskIndex === 0 ? "hidden" : "visible";
  nextBtn.textContent = currentTaskIndex === tasks.length - 1 ? "Continue" : "Next";
  showScreen("task");
}

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function persistCurrentTask() {
  const answer = getCheckedValue("answer");
  const confidence = getCheckedValue("confidence");

  if (!answer || !confidence) {
    taskError.classList.add("show");
    return false;
  }

  const task = tasks[currentTaskIndex];
  const prior = studyData.tasks[currentTaskIndex];

  let responseTimeSec;
  if (prior && prior.answer === answer && Number(prior.confidence) === Number(confidence)) {
    responseTimeSec = prior.responseTimeSec;
  } else if (taskStartTime != null) {
    responseTimeSec = Number(((performance.now() - taskStartTime) / 1000).toFixed(2));
  } else {
    responseTimeSec = prior ? prior.responseTimeSec : null;
  }

  studyData.tasks[currentTaskIndex] = {
    taskId: task.id,
    condition: task.condition,
    taskType: task.taskType,
    presentationIndex: task.presentationIndex,
    answer,
    confidence: Number(confidence),
    responseTimeSec,
    submittedAt: new Date().toISOString()
  };

  persistToLocalStorage();
  return true;
}

function downloadJSON(data, filename = "study_responses.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function sendToAppsScript(payload) {
  if (USE_LOCAL_ONLY || !APPS_SCRIPT_URL) return { status: "local-only" };
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status && data.status !== "ok") {
    throw new Error(data.message || `server returned status=${data.status}`);
  }
  return data;
}

function collectFinalResponses() {
  const feltEasiest = document.getElementById("feltEasiest").value;
  const mostClear = document.getElementById("mostClear").value;
  const mostCluttered = document.getElementById("mostCluttered").value;
  const openComment = document.getElementById("openComment").value.trim();

  if (!feltEasiest || !mostClear || !mostCluttered) {
    finishError.textContent = "Please complete the three comparison questions.";
    finishError.classList.add("show");
    return null;
  }

  studyData.final = { feltEasiest, mostClear, mostCluttered, openComment };
  return {
    timestamp: new Date().toISOString(),
    participant: studyData.participant,
    tasks: studyData.tasks,
    final: studyData.final,
    mode: USE_LOCAL_ONLY ? "local-only" : "apps-script"
  };
}

startBtn.addEventListener("click", () => {
  clearAlerts();

  const participantIdField = document.getElementById("participantId");
  const participantId = participantIdField.value || generateParticipantId();
  participantIdField.value = participantId;

  const age = document.getElementById("age").value;
  const major = document.getElementById("major").value.trim();
  const vizExperience = document.getElementById("vizExperience").value;
  const consent = document.getElementById("consent").checked;

  if (!vizExperience || !consent || !age) {
    introError.classList.add("show");
    return;
  }

  try {
    // Interleaved randomization
    // Each task is treated as its own unit and all tasks are shuffled together, so conditions are mixed.
    tasks = shuffle(baseTasks).map((t, idx) => ({
      ...t,
      options: shuffle([...t.options]),
      presentationIndex: idx
    }));

    studyData.participant = {
      participantId,
      age,
      major,
      vizExperience,
      consentGivenAt: new Date().toISOString(),
      conditionOrderId: "Full-Random-Interleaved",
      conditionOrder: ["Mixed"]
    };

    studyData.tasks = new Array(tasks.length);
    persistToLocalStorage();
    currentTaskIndex = 0;
    renderTask();
  } catch (err) {
    console.error(err);
    alert("Error starting survey. See console.");
  }
});

prevBtn.addEventListener("click", () => {
  if (currentTaskIndex > 0) {
    currentTaskIndex -= 1;
    renderTask();
  }
});

nextBtn.addEventListener("click", () => {
  if (!persistCurrentTask()) return;
  if (currentTaskIndex < tasks.length - 1) {
    currentTaskIndex += 1;
    renderTask();
  } else {
    showScreen("finish");
  }
});

finishBackBtn.addEventListener("click", () => {
  currentTaskIndex = tasks.length - 1;
  renderTask();
});

downloadBtn.addEventListener("click", () => {
  const payload = collectFinalResponses();
  if (!payload) return;
  downloadJSON(payload, `${studyData.participant.participantId}_responses.json`);
});

submitBtn.addEventListener("click", async () => {
  clearAlerts();
  const payload = collectFinalResponses();
  if (!payload) return;

  persistToLocalStorage();
  downloadJSON(payload, `${studyData.participant.participantId}_responses.json`);

  submitBtn.disabled = true;
  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = "Submitting...";

  try {
    const result = await sendToAppsScript(payload);
    if (result.status === "local-only") {
      finishSuccess.textContent =
        "Responses saved locally and downloaded. No remote endpoint is configured — please email the JSON file to the researchers.";
    } else {
      finishSuccess.textContent =
        "Responses submitted successfully. Thank you for participating!";
    }
    finishSuccess.classList.add("show");
  } catch (err) {
    finishError.textContent =
      `Remote submission failed (${err.message}). Your responses were still downloaded — please email the JSON file to the researchers.`;
    finishError.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

window.addEventListener("load", () => {
  const participantId = generateParticipantId();
  const input = document.getElementById("participantId");
  if (input) input.value = participantId;
});
