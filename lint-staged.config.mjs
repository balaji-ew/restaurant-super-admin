import path from 'path';

const buildEslintCommand = (filenames) => {
  return `next lint --fix --file ${filenames
    .filter((f) => f.includes('/app/'))
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;
};

const config = {
  '*.{ts,tsx}': [buildEslintCommand, "bash -c 'npm run check-types'"],
};

export default config;
