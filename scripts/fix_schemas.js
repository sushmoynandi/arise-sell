const fs = require('fs');
const path = require('path');

const schemasDir = path.join(__dirname, '..', 'backend', 'app', 'schemas');
const apiDir = path.join(__dirname, '..', 'backend', 'app', 'api');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace Optional[type] with type | None
  // e.g., Optional[str] -> str | None
  // Optional[dict[str, Any]] -> dict[str, Any] | None
  // Optional[Literal["signal", "mint", "amber"]] -> Literal["signal", "mint", "amber"] | None
  content = content.replace(/Optional\[(.*?)\]/g, '$1 | None');

  // Also make sure if Optional was in typing imports, remove or keep it clean
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.py')) {
      fixFile(fullPath);
    }
  }
}

processDir(schemasDir);
processDir(apiDir);
console.log('All schemas and API files cleaned of unimported Optional[T]');
