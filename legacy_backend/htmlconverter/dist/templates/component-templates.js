export const componentTemplates = {
    reactComponent: (name, body) => `
import React from 'react';

export const ${name}: React.FC = () => {
  return (
    ${body}
  );
};
`,
};
