const fs = require('fs');
const content = fs.readFileSync('frontend/src/App.js', 'utf8');

// Fix missing </button> after the status toggle button
// Current: {emp.is_active?t.active:t.inactive}}</td><td>
// Should:  {emp.is_active?t.active:t.inactive}</button>}</td><td>

const broken = "{emp.is_active?t.active:t.inactive}}</td><td>";
const fixed = "{emp.is_active?t.active:t.inactive}</button>}</td><td>";

if (content.includes(broken)) {
  const newContent = content.replace(broken, fixed);
  fs.writeFileSync('frontend/src/App.js', newContent, 'utf8');
  console.log('Fixed missing </button> tag!');
} else {
  console.log('Pattern not found exactly');
  const idx = content.indexOf('t.active:t.inactive}}');
  if (idx >= 0) {
    console.log('Found at:', idx);
    console.log('Context:', content.substring(idx, idx + 60));
  }
}
