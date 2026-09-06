function detectRedFlags(text) {
  const symptoms = text.toLowerCase();

  const flags = [];

  const chestPain =
    symptoms.includes("chest pain") ||
    symptoms.includes("chest pressure");

  const breathingDifficulty =
    symptoms.includes("difficulty breathing") ||
    symptoms.includes("shortness of breath") ||
    symptoms.includes("breathlessness") ||
    symptoms.includes("can't breathe");

  const strokeSymptoms =
    symptoms.includes("face drooping") ||
    symptoms.includes("facial drooping") ||
    symptoms.includes("slurred speech") ||
    symptoms.includes("weakness on one side") ||
    symptoms.includes("one sided weakness");

  if (chestPain && breathingDifficulty) {
    flags.push({
      type: "URGENT",
      message:
        "Chest pain with breathing difficulty detected. Priority medical assessment may be required.",
    });
  }

  if (strokeSymptoms) {
    flags.push({
      type: "URGENT",
      message:
        "Possible stroke-related symptoms detected. Priority medical assessment may be required.",
    });
  }

  return flags;
}

export default detectRedFlags;