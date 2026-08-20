import { parseAnalyticsConfig } from "./config";
import { createRuntime, getStatus, runAlerts, runBot, runDailyReport } from "./runtime";

async function main() {
  const command = process.argv[2];
  if (!command || !["report", "status", "alerts", "bot"].includes(command)) {
    throw new Error("ANALYTICS_COMMAND_INVALID");
  }
  const runtime = createRuntime(parseAnalyticsConfig());
  if (command === "bot") {
    await runBot(runtime);
    return;
  }
  try {
    if (command === "report") await runDailyReport(runtime);
    if (command === "status") console.log(await getStatus(runtime));
    if (command === "alerts") await runAlerts(runtime);
  } finally {
    await runtime.database.close();
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "analytics_failed",
      message: error instanceof Error ? error.message : "UNKNOWN"
    }));
    process.exitCode = 1;
  });
}
