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

const apiKey = process.env.OPENAI_API_KEY || "";
const endpointInput = process.env.OPENAI_TRANSLATION_BASE_URL || "https://agentrouter.org/v1/chat/completions";

// Candidate URL variations
const candidateUrls = [
  endpointInput,
  "https://api.openai.com/v1/chat/completions",
  "https://agentrouter.org/v1/chat/completions",
  "https://agentrouter.org/api/v1/chat/completions",
].filter((u, i, self) => Boolean(u) && self.indexOf(u) === i);

// Candidate User-Agents and Auth headers
const headerCombos = [
  {
    name: "Bearer + AgentRouter Referer & Origin",
    headers: {
      authorization: `Bearer ${apiKey}`,
      referer: "https://agentrouter.org",
      origin: "https://agentrouter.org",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "content-type": "application/json",
    },
  },
  {
    name: "Bearer + LinuxUnity Referer",
    headers: {
      authorization: `Bearer ${apiKey}`,
      referer: "https://linuxunity.com",
      origin: "https://linuxunity.com",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "content-type": "application/json",
    },
  },
  {
    name: "Bearer + Browser User-Agent",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "content-type": "application/json",
    },
  },
  {
    name: "Bearer + OpenAI User-Agent",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "user-agent": "OpenAI/NodeJS",
      "content-type": "application/json",
    },
  },
];

console.log("--------------------------------------------------");
console.log("🔍 AGENT ROUTER DIAGNOSTIC MATRIX TEST");
console.log(`API Key: ${apiKey ? apiKey.slice(0, 10) + "..." : "MISSING"}`);
console.log("--------------------------------------------------\n");

async function testCombination(url, combo, model) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: combo.headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the word SUCCESS" }],
        temperature: 0.1,
      }),
    });

    const raw = await response.text();
    if (response.ok) {
      console.log(`✅ SUCCESS! URL: ${url} | Combo: ${combo.name} | Model: ${model}`);
      console.log(`   Response: ${raw.slice(0, 120)}\n`);
      return { url, combo, model };
    } else {
      console.log(`❌ FAILED [${response.status}] URL: ${url} | Combo: ${combo.name} | Model: ${model}`);
      console.log(`   Detail: ${raw.slice(0, 120)}\n`);
      return null;
    }
  } catch (err) {
    console.log(`❌ ERROR URL: ${url} | Combo: ${combo.name} -> ${err.message}\n`);
    return null;
  }
}

const testModels = [
  process.env.OPENAI_TRANSLATION_MODEL,
  "claude-opus-5",
  "gpt-5.6-sol",
  "claude-opus-4-8",
  "gpt-4o-mini",
  "gpt-4o",
  "default",
].filter((m, i, self) => Boolean(m) && self.indexOf(m) === i);

async function main() {
  if (!apiKey) {
    console.log("ℹ️ OPENAI_API_KEY is not set in .env. Skipping token check.");
    process.exit(0);
  }

  let foundMatch = null;

  for (const url of candidateUrls) {
    for (const combo of headerCombos) {
      for (const model of testModels) {
        const result = await testCombination(url, combo, model);
        if (result) {
          foundMatch = result;
          break;
        }
      }
      if (foundMatch) break;
    }
    if (foundMatch) break;
  }

  console.log("--------------------------------------------------");
  if (foundMatch) {
    console.log(`🎉 SUCCESSFUL WORKING COMBINATION FOUND!`);
    console.log(`URL: ${foundMatch.url}`);
    console.log(`Model: ${foundMatch.model}`);
    console.log(`Header Strategy: ${foundMatch.combo.name}`);
  } else {
    console.log("⚠️ All combinations returned 401 Unauthenticated.");
    console.log("Please check:");
    console.log(" 1. Token status in Agent Router Console (must be Enabled/Active).");
    console.log(" 2. Your API Key in .env (OPENAI_API_KEY=sk-...).");
  }
  console.log("--------------------------------------------------");
}

main();
