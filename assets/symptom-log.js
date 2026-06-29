const rowTemplate = () => {
  const fragment = document.createDocumentFragment();
  const mainRow = document.createElement("tr");
  const notesRow = document.createElement("tr");
  const removeButtonId = `remove-${globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

  mainRow.className = "log-entry-main";
  notesRow.className = "log-entry-notes";

  mainRow.innerHTML = `
    <td><input type="date" data-field="date"></td>
    <td><input type="text" data-field="sleep" placeholder="e.g. 6h, broken"></td>
    <td><input type="text" data-field="food" placeholder="Meals, fluids"></td>
    <td><textarea data-field="event" rows="2" placeholder="School demand or event"></textarea></td>
    <td><input type="number" data-field="nausea" min="0" max="10" inputmode="numeric"></td>
    <td><input type="number" data-field="anxiety" min="0" max="10" inputmode="numeric"></td>
    <td><textarea data-field="symptoms" rows="2"></textarea></td>
    <td><textarea data-field="helped" rows="2"></textarea></td>
    <td><button type="button" class="icon-action" id="${removeButtonId}" aria-label="Remove entry">x</button></td>
  `;
  notesRow.innerHTML = `
    <td colspan="9">
      <label class="notes-field">
        Notes for this date
        <textarea data-field="notes" rows="3" placeholder="Observations, context, follow-up questions, or anything that does not fit above"></textarea>
      </label>
    </td>
  `;

  mainRow.querySelector("button").addEventListener("click", () => {
    if (document.querySelectorAll("#logRows .log-entry-main").length <= 1) return;
    mainRow.remove();
    notesRow.remove();
  });

  fragment.append(mainRow, notesRow);
  return fragment;
};

const rows = document.querySelector("#logRows");
const addRow = () => rows.appendChild(rowTemplate());

for (let index = 0; index < 7; index += 1) addRow();

document.querySelector("#addRow").addEventListener("click", addRow);
document.querySelector("#printPage").addEventListener("click", () => window.print());
document.querySelector("#clearForm").addEventListener("click", () => {
  if (!confirm("Clear all fields on this page?")) return;
  document.querySelectorAll("input, textarea").forEach((field) => field.value = "");
  document.querySelector("#purpose").selectedIndex = 0;
  rows.innerHTML = "";
  for (let index = 0; index < 7; index += 1) addRow();
});

const value = (selector) => document.querySelector(selector)?.value?.trim() || "";

const collectRows = () => [...document.querySelectorAll("#logRows .log-entry-main")].map((mainRow) => {
  const item = {};
  const notesRow = mainRow.nextElementSibling;
  [mainRow, notesRow].forEach((row) => {
    row?.querySelectorAll("[data-field]").forEach((field) => {
      item[field.dataset.field] = field.value.trim();
    });
  });
  return item;
}).filter((item) => Object.values(item).some(Boolean));

const addWrappedText = (doc, text, x, y, width, lineHeight = 5) => {
  const lines = doc.splitTextToSize(text || "-", width);
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
};

const sectionTitle = (doc, title, y) => {
  if (y > 265) {
    doc.addPage();
    y = 18;
  }
  doc.setFillColor(18, 107, 99);
  doc.rect(14, y - 5, 182, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 17, y + 1);
  doc.setTextColor(25, 33, 42);
  return y + 13;
};

const pdfText = (text) => text || "-";

const drawCell = (doc, text, x, y, width, height, options = {}) => {
  const {
    fill = null,
    border = [216, 224, 231],
    textColor = [25, 33, 42],
    font = "normal",
    fontSize = 8,
    padding = 2.5,
    maxLines = 3
  } = options;

  if (fill) doc.setFillColor(...fill);
  doc.setDrawColor(...border);
  doc.rect(x, y, width, height, fill ? "FD" : "S");

  if (!text) return;

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", font);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text), width - padding * 2).slice(0, maxLines);
  doc.text(lines, x + padding, y + padding + 3);
};

const drawLinedCell = (doc, label, text, x, y, width, height, options = {}) => {
  drawCell(doc, "", x, y, width, height, { fill: options.fill || [251, 253, 253] });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(18, 107, 99);
  doc.text(label, x + 2.5, y + 5);

  doc.setDrawColor(196, 214, 211);
  for (let lineY = y + 12; lineY < y + height - 3; lineY += 7) {
    doc.line(x + 2.5, lineY, x + width - 2.5, lineY);
  }

  if (!text) return;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(25, 33, 42);
  const lines = doc.splitTextToSize(text, width - 5).slice(0, Math.floor((height - 10) / 4));
  doc.text(lines, x + 2.5, y + 10);
};

const drawLogHeader = (doc, y, columns) => {
  let x = 10;
  columns.forEach(([label, width]) => {
    drawCell(doc, label, x, y, width, 10, {
      fill: [234, 243, 241],
      textColor: [18, 107, 99],
      font: "bold",
      fontSize: 7.2,
      maxLines: 2
    });
    x += width;
  });
};

const drawLogEntry = (doc, entry, y, columns, blank = false) => {
  const fields = [
    blank ? "" : entry.date,
    blank ? "" : entry.sleep,
    blank ? "" : entry.food,
    blank ? "" : entry.event,
    blank ? "" : entry.nausea,
    blank ? "" : entry.anxiety,
    blank ? "" : entry.symptoms,
    blank ? "" : entry.helped
  ];

  let x = 10;
  columns.forEach(([, width], index) => {
    drawCell(doc, fields[index], x, y, width, 17, {
      fill: [255, 255, 255],
      fontSize: 8,
      maxLines: index >= 2 ? 3 : 2
    });
    x += width;
  });

  drawLinedCell(doc, "Notes for this date", blank ? "" : entry.notes, 10, y + 17, 277, 23);
};

const drawPdfTitle = (doc, title, subtitle, week, person, purpose) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(18, 107, 99);
  doc.text(title, 10, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(92, 104, 117);
  doc.text(subtitle, 10, 21);
  doc.text("Generated locally in the browser. Treat completed forms as private health documents.", 10, 26);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 33, 42);
  doc.text(`Week beginning: ${week}`, 10, 34);
  doc.text(`Reference: ${person}`, 88, 34);
  doc.text(`Purpose: ${purpose}`, 154, 34);
};

const drawSummaryPage = (doc, summary) => {
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(18, 107, 99);
  doc.text("Weekly Pattern Summary", 10, 15);

  const boxes = [
    ["Most difficult times", summary.difficultTimes],
    ["Repeated triggers", summary.repeatedTriggers],
    ["Physical red flags or changes", summary.redFlags],
    ["What helped", summary.whatHelped],
    ["What made things worse", summary.madeWorse],
    ["Questions for professional", summary.questions]
  ];

  boxes.forEach(([label, text], index) => {
    const x = index % 2 === 0 ? 10 : 151.5;
    const y = 28 + Math.floor(index / 2) * 52;
    drawLinedCell(doc, label, text, x, y, 135.5, 44);
  });
};

const makePdf = (blank = false) => {
  const jsPdf = window.jspdf?.jsPDF;
  if (!jsPdf) {
    alert("PDF library did not load. Use Print page instead.");
    return;
  }

  const doc = new jsPdf({ unit: "mm", format: "a4", orientation: "landscape" });
  const week = value("#weekBeginning") || "Not specified";
  const person = value("#personRef") || "Not specified";
  const purpose = value("#purpose") || "Not specified";

  const columns = [
    ["Date", 30],
    ["Sleep", 24],
    ["Food/hydration", 36],
    ["School demand/event", 48],
    ["Nausea 0-10", 22],
    ["Anxiety 0-10", 22],
    ["Other symptoms", 48],
    ["What helped", 47]
  ];

  const entries = blank
    ? Array.from({ length: 7 }, () => ({}))
    : collectRows();

  drawPdfTitle(
    doc,
    blank ? "Blank Symptom and Trigger Log" : "Symptom and Trigger Log",
    "Pattern spotting for GP, school, CAMHS, counsellor or support conversations.",
    blank ? "" : week,
    blank ? "" : person,
    blank ? "" : purpose
  );

  if (!blank && entries.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(25, 33, 42);
    doc.text("No daily entries added.", 10, 48);
  } else {
    let y = 42;
    drawLogHeader(doc, y, columns);
    y += 10;

    entries.forEach((entry, index) => {
      if (y > 160) {
        doc.addPage();
        drawPdfTitle(
          doc,
          blank ? "Blank Symptom and Trigger Log" : "Symptom and Trigger Log",
          "Continued daily entries.",
          blank ? "" : week,
          blank ? "" : person,
          blank ? "" : purpose
        );
        y = 42;
        drawLogHeader(doc, y, columns);
        y += 10;
      }
      drawLogEntry(doc, entry, y, columns, blank);
      y += 43;
      if (blank && index === entries.length - 1) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.8);
        doc.setTextColor(92, 104, 117);
        doc.text("Use this for pattern spotting, not surveillance. Seek urgent help for immediate safety concerns or serious physical symptoms.", 10, 200);
      }
    });
  }

  drawSummaryPage(doc, {
    difficultTimes: blank ? "" : value("#difficultTimes"),
    repeatedTriggers: blank ? "" : value("#repeatedTriggers"),
    redFlags: blank ? "" : value("#redFlags"),
    whatHelped: blank ? "" : value("#whatHelped"),
    madeWorse: blank ? "" : value("#madeWorse"),
    questions: blank ? "" : value("#questions")
  });

  const safeWeek = (week || "week").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  doc.save(blank ? "blank-symptom-trigger-log.pdf" : `symptom-trigger-log-${safeWeek}.pdf`);
};

document.querySelector("#downloadPdf").addEventListener("click", () => makePdf(false));
document.querySelector("#downloadBlankPdf").addEventListener("click", () => makePdf(true));
