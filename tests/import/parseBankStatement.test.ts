import assert from "assert";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
function requireFresh(modulePath: string) {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
  return require(modulePath);
}

const { parseBankStatement } = requireFresh(
  path.join(__dirname, "..", "..", "lib", "import", "parseBankStatement.ts"),
);

// 1: empty text → empty array
{
  const r = parseBankStatement("");
  assert.deepStrictEqual(r, [], "empty text returns empty array");
}

// 2: single debit with US decimal
{
  const r = parseBankStatement("01/05/2026  Coffee Shop       -3.50");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 3.5, "amount 3.50");
  assert.strictEqual(r[0].type, "debit", "negative is debit");
  assert.ok(r[0].description.length > 0, "description not empty");
}

// 3: European format 1.234,56
{
  const r = parseBankStatement("15.05.2026  Supermarkt        -1.234,56");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 1234.56, "European amount parsed correctly");
  assert.strictEqual(r[0].type, "debit", "European debit detected");
}

// 4: credit transaction
{
  const r = parseBankStatement("2026-05-01  Salary            2200.00");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 2200.0, "salary 2200");
  assert.strictEqual(r[0].type, "credit", "positive is credit");
}

// 5: zero amount filtered out
{
  const r = parseBankStatement("01/05/2026  Balance forward   0.00");
  assert.deepStrictEqual(r, [], "zero amount filtered");
}

// 6: no transaction lines
{
  const r = parseBankStatement(
    "Account Statement\nPage 1 of 3\nOpening Balance",
  );
  assert.deepStrictEqual(r, [], "header-only text returns empty");
}

// 7: multiple lines
{
  const text = [
    "01/05/2026  Grocery Store    -45.20",
    "02/05/2026  ATM Withdrawal   -100.00",
    "05/05/2026  Direct Deposit   1800.00",
  ].join("\n");
  const r = parseBankStatement(text);
  assert.strictEqual(r.length, 3, "three transactions");
  assert.strictEqual(r[2].type, "credit", "last is credit");
  assert.strictEqual(r[0].type, "debit", "first is debit");
}

console.log("All parseBankStatement tests passed");
