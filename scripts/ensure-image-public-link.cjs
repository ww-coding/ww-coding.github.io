const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "src", "images");
const link = path.join(root, "src", ".vuepress", "public", "images");

if (!fs.existsSync(source)) {
  throw new Error(`Image source directory does not exist: ${source}`);
}

fs.mkdirSync(path.dirname(link), { recursive: true });

let stat = null;
try {
  stat = fs.lstatSync(link);
} catch {
  // Missing link is handled below.
}

if (stat) {
  if (stat.isSymbolicLink()) {
    const target = fs.readlinkSync(link);
    const resolved = path.resolve(path.dirname(link), target);
    if (resolved === source) process.exit(0);
    fs.rmSync(link, { force: true });
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(link);
    if (entries.length > 0) {
      throw new Error(
        `Refusing to replace non-empty directory with image link: ${link}`
      );
    }
    fs.rmSync(link, { recursive: true, force: true });
  } else {
    fs.rmSync(link, { force: true });
  }
}

const relativeTarget = path.relative(path.dirname(link), source);

try {
  fs.symlinkSync(relativeTarget, link, "junction");
} catch (error) {
  throw new Error(
    `Failed to create image link ${link} -> ${relativeTarget}: ${error.message}`
  );
}
