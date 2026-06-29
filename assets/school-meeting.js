const value = (selector) => document.querySelector(selector)?.value?.trim() || "";

document.querySelector("#printPage").addEventListener("click", () => window.print());
document.querySelector("#clearForm").addEventListener("click", () => {
  if (!confirm("Clear all fields on this page?")) return;
  document.querySelectorAll("input, textarea").forEach((field) => field.value = "");
  document.querySelector("#meetingPurpose").selectedIndex = 0;
});

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

const writeItems = (doc, y, items) => {
  doc.setFontSize(10);
  items.forEach(([label, text]) => {
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
  return y;
};

const generatePdf = () => {
  const jsPdf = window.jspdf?.jsPDF;
  if (!jsPdf) {
    alert("PDF library did not load. Use Print page instead.");
    return;
  }

  const doc = new jsPdf({ unit: "mm", format: "a4" });
  const date = value("#meetingDate") || "Not specified";
  const person = value("#personRef") || "Not specified";
  const purpose = value("#meetingPurpose") || "Not specified";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(18, 107, 99);
  doc.text("School Meeting Notes", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 104, 117);
  doc.text("Structured notes for school anxiety, attendance, SEND or wellbeing conversations.", 14, 28);
  doc.text("Generated locally in the browser. Review before sharing.", 14, 34);

  doc.setTextColor(25, 33, 42);
  doc.setFontSize(11);
  doc.text(`Meeting date: ${date}`, 14, 46);
  doc.text(`Reference: ${person}`, 14, 53);
  doc.text(`Purpose: ${purpose}`, 14, 60);
  doc.text(`Attendees/roles: ${value("#attendees") || "Not specified"}`, 14, 67);

  let y = sectionTitle(doc, "What we are seeing", 82);
  y = writeItems(doc, y, [
    ["Attendance pattern", value("#attendancePattern")],
    ["Anxiety or distress signs", value("#distressSigns")],
    ["Physical symptoms", value("#physicalSymptoms")],
    ["Times or places that seem hardest", value("#hardestTimes")],
    ["What helps even a little", value("#helps")],
    ["Strengths or protective factors", value("#strengths")]
  ]);

  y = sectionTitle(doc, "Questions for school", y + 4);
  y = writeItems(doc, y, [
    ["School observations", value("#schoolObserve")],
    ["Specific linked triggers", value("#specificTriggers")],
    ["Issues to investigate", value("#investigate")],
    ["Named trusted adult", value("#trustedAdult")],
    ["Distress signal", value("#distressSignal")],
    ["If the plan does not work", value("#ifPlanFails")]
  ]);

  y = sectionTitle(doc, "Agreed adjustments", y + 4);
  y = writeItems(doc, y, [
    ["Arrival plan", value("#arrivalPlan")],
    ["Safe space or trusted route", value("#safeSpace")],
    ["Reduced or flexible timetable", value("#timetable")],
    ["Catch-up work plan", value("#catchUp")],
    ["Communication route", value("#communication")],
    ["Review date and success signs", value("#reviewDate")]
  ]);

  y = sectionTitle(doc, "One clear next step", y + 4);
  writeItems(doc, y, [
    ["Specific next step", value("#nextStep")],
    ["Owner", value("#owner")],
    ["Review timing", value("#reviewWhen")]
  ]);

  doc.save(`school-meeting-notes-${date || "meeting"}.pdf`);
};

document.querySelector("#downloadPdf").addEventListener("click", generatePdf);
