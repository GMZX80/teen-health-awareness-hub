const rowTemplate = () => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="date" data-field="date"></td>
    <td><input type="text" data-field="sleep" placeholder="e.g. 6h, broken"></td>
    <td><input type="text" data-field="food" placeholder="Meals, fluids"></td>
    <td><textarea data-field="event" rows="2" placeholder="School demand or event"></textarea></td>
    <td><input type="number" data-field="nausea" min="0" max="10" inputmode="numeric"></td>
    <td><input type="number" data-field="anxiety" min="0" max="10" inputmode="numeric"></td>
    <td><textarea data-field="symptoms" rows="2"></textarea></td>
    <td><textarea data-field="helped" rows="2"></textarea></td>
    <td><textarea data-field="notes" rows="2"></textarea></td>
    <td><button type="button" class="icon-action" aria-label="Remove row">x</button></td>
  `;
  tr.querySelector("button").addEventListener("click", () => {
    if (document.querySelectorAll("#logRows tr").length > 1) tr.remove();
  });
  return tr;
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

const collectRows = () => [...document.querySelectorAll("#logRows tr")].map((tr) => {
  const item = {};
  tr.querySelectorAll("[data-field]").forEach((field) => {
    item[field.dataset.field] = field.value.trim();
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

const generatePdf = () => {
  const jsPdf = window.jspdf?.jsPDF;
  if (!jsPdf) {
    alert("PDF library did not load. Use Print page instead.");
    return;
  }

  const doc = new jsPdf({ unit: "mm", format: "a4" });
  const week = value("#weekBeginning") || "Not specified";
  const person = value("#personRef") || "Not specified";
  const purpose = value("#purpose") || "Not specified";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(18, 107, 99);
  doc.text("Symptom and Trigger Log", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 104, 117);
  doc.text("Pattern spotting for GP, school, CAMHS, counsellor or support conversations.", 14, 28);
  doc.text("Generated locally in the browser. Treat as a private health document.", 14, 34);

  doc.setTextColor(25, 33, 42);
  doc.setFontSize(11);
  doc.text(`Week beginning: ${week}`, 14, 46);
  doc.text(`Reference: ${person}`, 14, 53);
  doc.text(`Purpose: ${purpose}`, 14, 60);

  let y = sectionTitle(doc, "Daily entries", 75);
  const entries = collectRows();
  doc.setFontSize(9);

  if (entries.length === 0) {
    doc.text("No daily entries added.", 14, y);
    y += 8;
  }

  entries.forEach((entry, index) => {
    if (y > 255) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(141, 63, 47);
    doc.text(`Entry ${index + 1}${entry.date ? ` - ${entry.date}` : ""}`, 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(25, 33, 42);
    const lines = [
      `Sleep: ${entry.sleep || "-"}`,
      `Food/hydration: ${entry.food || "-"}`,
      `School demand/event: ${entry.event || "-"}`,
      `Nausea: ${entry.nausea || "-"} / 10   Anxiety: ${entry.anxiety || "-"} / 10`,
      `Other symptoms: ${entry.symptoms || "-"}`,
      `What helped: ${entry.helped || "-"}`,
      `Notes: ${entry.notes || "-"}`
    ];
    lines.forEach((line) => {
      y = addWrappedText(doc, line, 18, y, 174, 4.6);
    });
    y += 4;
  });

  y = sectionTitle(doc, "Weekly pattern summary", y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const summary = [
    ["Most difficult times", value("#difficultTimes")],
    ["Repeated triggers", value("#repeatedTriggers")],
    ["Physical red flags or changes", value("#redFlags")],
    ["What helped", value("#whatHelped")],
    ["What made things worse", value("#madeWorse")],
    ["Questions for professional", value("#questions")]
  ];

  summary.forEach(([label, text]) => {
    if (y > 265) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = addWrappedText(doc, text || "-", 18, y, 174, 4.8) + 3;
  });

  doc.save(`symptom-trigger-log-${week || "week"}.pdf`);
};

document.querySelector("#downloadPdf").addEventListener("click", generatePdf);
