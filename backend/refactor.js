const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = ['participants.js', 'events.js', 'coordinators.js', 'registrations.js', 'event-assignments.js', 'reports.js', 'reset.js'];

// We'll just do naive replacements for common patterns

files.forEach(file => {
  if (!fs.existsSync(path.join(routesDir, file))) return;
  let content = fs.readFileSync(path.join(routesDir, file), 'utf8');

  // 1. SELECT all
  content = content.replace(/SELECT \* FROM ([A-Za-z_]+)(.*?)ORDER BY/g, 'SELECT * FROM $1 WHERE admin_id = ? $2ORDER BY');
  // Handle where the replacement needs req.admin.id
  content = content.replace(/pool\.execute\([\s\S]*?'SELECT \* FROM ([A-Za-z_]+) WHERE admin_id = \? (.*?)ORDER BY (.*?)'[\s\S]*?\)/g, (match, table, mid, order) => {
    return `pool.execute(\n      'SELECT * FROM ${table} WHERE admin_id = ? ${mid}ORDER BY ${order}',\n      [req.admin.id]\n    )`;
  });

  // 2. SELECT by ID
  content = content.replace(/WHERE ([a-z_]+_id) = \?'/g, 'WHERE $1 = ? AND admin_id = ?\'');
  content = content.replace(/\[(id|eventId|participantId|coordinatorId)\]/g, '[$1, req.admin.id]');

  // 3. INSERT
  content = content.replace(/INSERT INTO Participant \((name, college, department, email, phone)\) VALUES \(\?, \?, \?, \?, \?\)/g, 'INSERT INTO Participant ($1, admin_id) VALUES (?, ?, ?, ?, ?, ?)');
  content = content.replace(/\[name, college, department, email \|\| null, phone \|\| null\]/g, '[name, college, department, email || null, phone || null, req.admin.id]');

  content = content.replace(/INSERT INTO Event \((event_name, event_type, description, event_date, venue, max_participants)\) VALUES \(\?, \?, \?, \?, \?, \?\)/g, 'INSERT INTO Event ($1, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  content = content.replace(/\[\s*event_name,\s*event_type,\s*description \|\| null,\s*event_date,\s*venue \|\| null,\s*max_participants \|\| 100\s*\]/g, '[\n        event_name,\n        event_type,\n        description || null,\n        event_date,\n        venue || null,\n        max_participants || 100,\n        req.admin.id\n      ]');

  content = content.replace(/INSERT INTO Coordinator \((name, type, email, phone, department)\) VALUES \(\?, \?, \?, \?, \?\)/g, 'INSERT INTO Coordinator ($1, admin_id) VALUES (?, ?, ?, ?, ?, ?)');
  content = content.replace(/\[name, type \|\| 'student', email \|\| null, phone \|\| null, department \|\| null\]/g, '[name, type || \\\'student\\\', email || null, phone || null, department || null, req.admin.id]');

  content = content.replace(/INSERT INTO Registration \((participant_id, event_id, status)\) VALUES \(\?, \?, \?\)/g, 'INSERT INTO Registration ($1, admin_id) VALUES (?, ?, ?, ?)');
  content = content.replace(/\[participant_id, event_id, status \|\| 'registered'\]/g, '[participant_id, event_id, status || \\\'registered\\\', req.admin.id]');

  content = content.replace(/INSERT INTO Event_Assignment \((coordinator_id, event_id, role)\) VALUES \(\?, \?, \?\)/g, 'INSERT INTO Event_Assignment ($1, admin_id) VALUES (?, ?, ?, ?)');
  content = content.replace(/\[coordinator_id, event_id, role \|\| 'coordinator'\]/g, '[coordinator_id, event_id, role || \\\'coordinator\\\', req.admin.id]');

  // 4. UPDATE
  content = content.replace(/WHERE ([a-z_]+_id) = \?'/g, 'WHERE $1 = ? AND admin_id = ?\'');
  content = content.replace(/\[\s*(.*),\s*id\s*\]/g, '[$1, id, req.admin.id]');

  // 5. DELETE
  content = content.replace(/DELETE FROM ([A-Za-z_]+) WHERE ([a-z_]+_id) = \?'/g, 'DELETE FROM $1 WHERE $2 = ? AND admin_id = ?\'');

  // Let's just output the files modified to verify
  fs.writeFileSync(path.join(routesDir, file), content, 'utf8');
  console.log(`Updated ${file}`);
});
