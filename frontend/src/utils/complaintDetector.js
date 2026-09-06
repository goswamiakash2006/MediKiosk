function detectComplaint(text) {
  const complaint = text.toLowerCase();

  if (
    complaint.includes("chest pain") ||
    complaint.includes("chest")
  ) {
    return "chestPain";
  }

  if (
    complaint.includes("headache") ||
    complaint.includes("head pain")
  ) {
    return "headache";
  }

  if (
  text.includes("fever") ||
  text.includes("बुखार") ||
  text.includes("জ্বর")
) {
  return "fever";
}

  if (
  text.includes("nausea") ||
  text.includes("nauseous") ||
  text.includes("मतली") ||
  text.includes("বমি বমি")
) {
  return "nausea";
}

  return "general";
}

export default detectComplaint;