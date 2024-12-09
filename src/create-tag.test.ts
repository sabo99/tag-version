import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import createTag from './create-tag'; // Update the path to your actual file

jest
  .mock('child_process')
  .mock('fs')
  .mock('path');

describe('createTag', () => {
  let mockExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockVersion = '1.0.0';
  const mockPackageJson = JSON.stringify({ version: mockVersion });

  beforeEach(() => {
    // Mock process.exit and console.error
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => { throw new Error(`process.exit: ${code}`); });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should create and push the Git tag when version exists in package.json', () => {
    // Mock dependencies
    (path.resolve as jest.Mock).mockReturnValue('/mock/package.json');
    (readFileSync as jest.Mock).mockReturnValue(mockPackageJson);

    createTag();

    expect(path.resolve).toHaveBeenCalledWith('package.json');
    expect(readFileSync).toHaveBeenCalledWith('/mock/package.json', 'utf-8');
    expect(execSync).toHaveBeenCalledWith(`git tag v${mockVersion}`, { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith(`git push origin v${mockVersion}`, { stdio: 'inherit' });
  });

  it('should throw an error if version is not found in package.json', () => {
    const mockPackageJson = JSON.stringify({});

    // Mock dependencies
    (path.resolve as jest.Mock).mockReturnValue('/mock/package.json');
    (readFileSync as jest.Mock).mockReturnValue(mockPackageJson);

    const result = () => createTag()

    expect(result).toThrow('process.exit: 1');
    expect(execSync).not.toHaveBeenCalled();
  });

  it('should log an error and exit the process on other errors', () => {
    // Mock dependencies
    (path.resolve as jest.Mock).mockReturnValue('/mock/package.json');
    (readFileSync as jest.Mock).mockReturnValue(mockPackageJson);

    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error('Mock git error');
    });

    const result = () => createTag();

    expect(result).toThrow('process.exit: 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Error creating Git tag:', expect.any(Error));
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});