const parseTags = (text) => {
  // Remove numbering, newlines, asterisks, and extra spaces
  return text
    .split(/\n|,/)
    .map((tag) =>
      tag
        .replace(/^\d+\.\s*/, "")
        .replace(/[*#]/g, "")
        .trim()
    )
    .filter((tag) => tag.length > 0);
};

module.exports = parseTags;
