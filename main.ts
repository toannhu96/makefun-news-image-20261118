import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const PROGRAM_NAME = "newsimage";
const FILE_NAME = "entry.png";
const MAX_SOURCE_BYTES = 1048576; // 1 MiB
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Every failure path goes through here: it reports the error with the program
// name prefix, sets a non-zero exit code, and terminates the process, so no
// code after a call to fail() ever runs.
function fail(message: string): never {
  process.stderr.write(`${PROGRAM_NAME}: error: ${message}\n`);
  process.exitCode = 1;
  process.exit(1);
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(scriptDir, FILE_NAME);

const envDir = process.env.MAKEFUN_OUTPUT_DIR;
const outputDir = path.resolve(envDir && envDir.length > 0 ? envDir : "/output");
const destPath = path.join(outputDir, FILE_NAME);

// Validate the source file.
let stat: fs.Stats;
try {
  stat = fs.statSync(sourcePath);
} catch (err) {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === "ENOENT") fail(`source file not found: ${sourcePath}`);
  fail(`cannot stat source file ${sourcePath}: ${errMsg(err)}`);
}
if (!stat.isFile()) fail(`source is not a regular file: ${sourcePath}`);
if (stat.size === 0) fail(`source file is empty: ${sourcePath}`);
if (stat.size > MAX_SOURCE_BYTES) {
  fail(
    `source file is too large: ${sourcePath} is ${stat.size} bytes (limit ${MAX_SOURCE_BYTES} bytes)`,
  );
}

let data: Buffer;
try {
  data = fs.readFileSync(sourcePath);
} catch (err) {
  fail(`cannot read source file ${sourcePath}: ${errMsg(err)}`);
}
if (data.length === 0) fail(`source file is empty: ${sourcePath}`);
if (data.length > MAX_SOURCE_BYTES) {
  fail(
    `source file is too large: ${sourcePath} is ${data.length} bytes (limit ${MAX_SOURCE_BYTES} bytes)`,
  );
}

// Write to the output directory.
try {
  fs.mkdirSync(outputDir, { recursive: true });
} catch (err) {
  fail(`cannot create output directory ${outputDir}: ${errMsg(err)}`);
}

try {
  fs.writeFileSync(destPath, data);
} catch (err) {
  fail(`cannot write ${destPath}: ${errMsg(err)}`);
}

// Verify the written file starts with the PNG signature.
function removeOutput(): void {
  try {
    fs.rmSync(destPath, { force: true });
  } catch (err) {
    process.stderr.write(`${PROGRAM_NAME}: warning: cannot delete ${destPath}: ${errMsg(err)}\n`);
  }
}

let header: Buffer;
try {
  const fd = fs.openSync(destPath, "r");
  try {
    header = Buffer.alloc(PNG_SIGNATURE.length);
    const bytesRead = fs.readSync(fd, header, 0, header.length, 0);
    header = header.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
} catch (err) {
  removeOutput();
  fail(`cannot read back ${destPath} for verification: ${errMsg(err)}`);
}
if (!header.equals(PNG_SIGNATURE)) {
  removeOutput();
  const got = header.toString("hex").match(/../g)?.join(" ").toUpperCase() ?? "(none)";
  fail(
    `output file ${destPath} is not a valid PNG: expected signature 89 50 4E 47 0D 0A 1A 0A, got ${got}; deleted output file`,
  );
}

process.stdout.write(`Wrote ${data.length} bytes to ${destPath}\n`);
