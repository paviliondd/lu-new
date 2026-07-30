import fs from "node:fs";
import path from "node:path";

// Zero-dependency .env loader
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const apiKey = process.env.OPENAI_API_KEY;
const endpoint = process.env.OPENAI_TRANSLATION_BASE_URL || "https://agentrouter.org/v1/chat/completions";

console.log("--------------------------------------------------");
console.log("🔍 AGENT ROUTER TOKEN & MODEL TEST");
console.log(`Endpoint: ${endpoint}`);
console.log(`API Key: ${apiKey ? apiKey.slice(0, 10) + "..." : "MISSING"}`);
console.log("--------------------------------------------------\n");

const testModels = [
  process.env.OPENAI_TRANSLATION_MODEL,
  "claude-opus-5",
  "gpt-5.6-sol",
  "claude-opus-4-8",
  "gpt-4o-mini",
  "gpt-4o",
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "default",
  "auto",
].filter((m, i, self) => Boolean(m) && self.indexOf(m) === i);

async function testModel(model) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the word SUCCESS" }],
        temperature: 0.1,
      }),
    });

    const raw = await response.text();
    if (response.ok) {
      console.log(`✅ Model "${model}": SUCCESS ->`, raw.slice(0, 100));
      return true;
    } else {
      console.log(`❌ Model "${model}": FAILED [${response.status}] ->`, raw);
      return false;
    }
  } catch (err) {
    console.log(`❌ Model "${model}": ERROR ->`, err.message);
    return false;
  }
}

async function main() {
  if (!apiKey) {
    console.log("ℹ️ OPENAI_API_KEY is not set in .env. Skipping token check.");
    process.exit(0);
  }

  let workingModel = null;
  for (const model of testModels) {
    const ok = await testModel(model);
    if (ok && !workingModel) {
      workingModel = model;
    }
  }

  console.log("\n--------------------------------------------------");
  if (workingModel) {
    console.log(`🎉 WORKING MODEL FOUND: "${workingModel}"`);
    console.log(`Set OPENAI_TRANSLATION_MODEL=${workingModel} in your .env!`);
  } else {
    console.log("⚠️ No models succeeded. Please check your Agent Router Token permissions or Endpoint URL.");
  }
  console.log("--------------------------------------------------");
}

main();
