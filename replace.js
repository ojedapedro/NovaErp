const fs = require('fs');
const path = 'apps/frontend/src/router/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert import if not present
if (!content.includes('ParametrosFiscales')) {
  content = content.replace(
    "import { NominaBase } from '../pages/nomina/Nomina';",
    "import { NominaBase } from '../pages/nomina/Nomina';\nimport { ParametrosFiscales } from '../pages/configuracion/ParametrosFiscales';"
  );
}

// Insert route if not present
if (!content.includes('configuracion')) {
  content = content.replace(
    /path: 'nomina',\s*element: <NominaBase \/>,\s*},\s*\]/,
    "path: 'nomina',\n        element: <NominaBase />,\n      },\n      {\n        path: 'configuracion',\n        element: <ParametrosFiscales />,\n      },\n    ]"
  );
}

fs.writeFileSync(path, content);
console.log('done');
