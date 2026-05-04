import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const certificatePath = path.join(rootDir, "certs", "russian_trusted_root_ca.cer");
const nextCliPath = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const nextArgs = process.argv.slice(2);

const env = { ...process.env };

if (!env.NODE_EXTRA_CA_CERTS && existsSync(certificatePath)) {
  env.NODE_EXTRA_CA_CERTS = certificatePath;
}

const child = spawn(process.execPath, [nextCliPath, ...nextArgs], {
  cwd: rootDir,
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
