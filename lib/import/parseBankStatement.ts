export type ParsedTransaction = {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
};

// Matches: DD/MM/YYYY  DD-MM-YYYY  DD.MM.YYYY  YYYY-MM-DD
const DATE_RE =
  /\b(\d{4}[-\/\.]\d{2}[-\/\.]\d{2}|\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})\b/;

function parseAmount(raw: string): number | null {
  const s = raw.replace(/\s/g, "").replace(/^[+-]/, "");
  // European: 1.234,56 (dots as thousands, comma as decimal)
  if (/^\d{1,3}(\.\d{3})*(,\d{2})$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  // US: 1,234.56 (commas as thousands, dot as decimal)
  if (/^\d{1,3}(,\d{3})*(\.\d{2})$/.test(s)) {
    return parseFloat(s.replace(/,/g, ""));
  }
  // Simple: 12.50 or 12,50
  const simple = parseFloat(s.replace(",", "."));
  return isNaN(simple) ? null : simple;
}

export function parseBankStatement(text: string): ParsedTransaction[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;

    // Find the last number-like token on the line (most bank formats put amount at end)
    const tokens = line.split(/\s+/);
    const lastToken = tokens[tokens.length - 1];
    const secondLast = tokens[tokens.length - 2];

    // Check if trailing minus sign is separate (e.g. "45.20 -")
    const rawAmount =
      secondLast && /^[\d.,]+$/.test(secondLast) && lastToken === "-"
        ? secondLast
        : lastToken;

    const isTrailingMinus = lastToken === "-" && rawAmount !== lastToken;
    const hasLeadingMinus = rawAmount.startsWith("-");

    const absAmount = parseAmount(rawAmount);
    if (absAmount === null || absAmount === 0) continue;

    const isDebit = hasLeadingMinus || isTrailingMinus;

    const dateEnd = (dateMatch.index ?? 0) + dateMatch[0].length;
    const amountIdx = line.lastIndexOf(rawAmount);
    const descRaw = line.slice(dateEnd, amountIdx).trim();
    const description = descRaw.replace(/\s+/g, " ") || "Transaction";

    results.push({
      date: dateMatch[1],
      description,
      amount: absAmount,
      type: isDebit ? "debit" : "credit",
    });
  }

  return results;
}
