import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

function createTag() {
  try {
    const packageJsonPath = path.resolve('package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    if (!version) {
      throw new Error('Version not found in package.json');
    }

    // Create the Git tag
    execSync(`git tag v${version}`, { stdio: 'inherit' });
    console.log(`Git tag v${version} created successfully.`);

    // Push the tag to remote
    execSync(`git push origin v${version}`, { stdio: 'inherit' });
    console.log(`Git tag v${version} pushed to remote.`);
  } catch (error) {
    console.error('Error creating Git tag:', error);
    process.exit(1);
  }
}

// Run the function if executed as a CLI
if (require.main === module) {
  createTag();
}


export default createTag;
