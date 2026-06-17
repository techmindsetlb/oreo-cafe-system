const fs = require('fs');
const content = fs.readFileSync('frontend/src/App.js', 'utf8');

// Issue: the guard was applied twice, creating a nested pattern
// Fix 1: Remove the inner duplicate guard (from :{emp.role===... to just :<button)
const innerGuardStart = '</span>:{emp.role===\'superadmin\'&&!isSA?<span className="muted" style={{fontSize:"0.72rem"}}>\uD83D\uDD12 {t.superadmin}</span>:';
const innerGuardEnd = '</span>:';

let fixed = content.replace(innerGuardStart, innerGuardEnd);

// Fix 2: Fix the double closing brace }} -> }
// Find the specific double brace after the edit button
const doubleBrace = '</button>}}{isSA&&';
const singleBrace = '</button>}{isSA&&';
fixed = fixed.replace(doubleBrace, singleBrace);

fs.writeFileSync('frontend/src/App.js', fixed, 'utf8');
console.log('Fix applied!');

// Verify
const verify = fs.readFileSync('frontend/src/App.js', 'utf8');
const idx = verify.indexOf('se(emp)');
const snippet = verify.substring(idx - 120, idx + 260);
console.log('Result:');
console.log(snippet);

// Check for any remaining nested patterns
const remaining = verify.indexOf('{emp.role===\'superadmin\'&&!isSA?<span', idx + 1);
if (remaining >= 0) {
  console.log('WARNING: Another guard found at:', remaining);
} else {
  console.log('No nested guards remaining - clean!');
}
