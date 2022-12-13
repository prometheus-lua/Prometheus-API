import dotenv from 'dotenv';

import fs from 'fs/promises';
import crypto from 'crypto';
import { exec } from 'child_process';
import { format, parse } from 'lua-json';
import { FileSizeUnit, getFileSize, getFileSizeFromString } from '../../util';

dotenv.config();

const {
  LUA_ENV_VARIABLE,
  PROMETHEUS_PATH
} = <any>process.env;

interface IObfuscationResult {
  success: boolean;
  error?: string;
  obfuscated?: string;
  timeTook?: string;
  obfuscatedSize?: string;
  contentSize?: string;
}

export function obfuscate(content: string, config: any): Promise<IObfuscationResult> {
  return new Promise(async (resolve) => {
    try {
      config = format(typeof config === 'string' ? JSON.parse(config) : config);
    } catch (error: any) {
      resolve({ success: false, error: `Error while parsing config: ${error.message}` });
    }

    const startTime = Date.now();

    const contentHash = crypto.createHash('sha256').update(content).digest('hex');
    const contentFilePath = `${PROMETHEUS_PATH}/tmp/${contentHash}.lua`;
    const configFilePath = `${PROMETHEUS_PATH}/tmp/${contentHash}.config.lua`;
    const obfuscatedFilePath = contentFilePath.split('.').slice(0, -1).join('.') + '.obfuscated.lua';
    const errorFilePath = contentFilePath.split('.').slice(0, -1).join('.') + '.error.txt';

    await fs.mkdir(`${PROMETHEUS_PATH}/tmp`, { recursive: true }).catch(() => { });
    await fs.writeFile(contentFilePath, content);
    await fs.writeFile(configFilePath, config);

    const command = `${LUA_ENV_VARIABLE} ${PROMETHEUS_PATH}/src/cli.lua --saveerrors ${contentFilePath} --config ${configFilePath}`;

    async function unlinkFiles() {
      await fs.unlink(contentFilePath).catch(() => { });
      await fs.unlink(configFilePath).catch(() => { });
      await fs.unlink(obfuscatedFilePath).catch(() => { });
      await fs.unlink(errorFilePath).catch(() => { });
    }

    exec(command, async (error, stdout, stderr) => {
      await fs.readFile(obfuscatedFilePath, 'utf-8').then(async (obfuscated) => {
        const timeTook = (Date.now() - startTime) / 1000 + 's';
        const obfuscatedSize = (getFileSize(FileSizeUnit.KB, getFileSizeFromString(obfuscated))).toFixed(2) + ' KB';
        const contentSize = (getFileSize(FileSizeUnit.KB, getFileSizeFromString(content))).toFixed(2) + ' KB';

        await unlinkFiles();
        resolve({ success: true, obfuscated: obfuscated, timeTook, obfuscatedSize, contentSize });
      }).catch(async (error: any) => {
        const errorMessage = await fs.readFile(errorFilePath, 'utf-8').catch(async () => {
          return "Error file couldn't be read";
        });

        await unlinkFiles();
        resolve({ success: false, error: errorMessage });
      });
    });
  });
}