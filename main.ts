// A working news-image-daily entry (Node 22, standard library only): its image is the entry.png beside this file, and
// the program copies it to /output/entry.png. A starting point, not a winner: replace the image. The gate takes a
// whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels, and the judge sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const source = new URL('./entry.png', import.meta.url);
const destination = join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png');

copyFileSync(source, destination);

// Verify the copy: it must exist, be a regular file, and start with the 8-byte PNG signature.
let size: number;
try {
  const stats = statSync(destination);
  if (!stats.isFile()) throw new Error('not a regular file');
  size = stats.size;
} catch (err) {
  throw new Error(`Output check failed: ${destination} does not exist or is not a file (${(err as Error).message})`);
}

if (size < PNG_MAGIC.length) {
  throw new Error(`Output check failed: ${destination} is only ${size} bytes, too short to be a PNG`);
}

const header = Buffer.alloc(PNG_MAGIC.length);
const fd = openSync(destination, 'r');
try {
  readSync(fd, header, 0, header.length, 0);
} finally {
  closeSync(fd);
}

if (!header.equals(PNG_MAGIC)) {
  throw new Error(
    `Output check failed: ${destination} does not have a PNG header ` +
      `(expected ${PNG_MAGIC.toString('hex')}, got ${header.toString('hex')})`,
  );
}

console.log(`Wrote ${destination} (${size} bytes, PNG header OK)`);
