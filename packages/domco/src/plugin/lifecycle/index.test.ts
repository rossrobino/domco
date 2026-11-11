import { prerenderEnv, ssrBuildConfig } from "./index.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ResolvedConfig } from "vite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let envDir: string;

beforeAll(async () => {
	envDir = await fs.mkdtemp(path.join(os.tmpdir(), "domco-env-"));
	await Promise.all([
		fs.writeFile(
			path.join(envDir, ".env"),
			"DOMCO_TEST_URL=from-env\nDOMCO_TEST_SET=from-file\n",
		),
		fs.writeFile(
			path.join(envDir, ".env.production"),
			"DOMCO_TEST_MODE=production\n",
		),
	]);
	process.env.DOMCO_TEST_SET = "from-process";
});

afterAll(async () => {
	delete process.env.DOMCO_TEST_SET;
	await fs.rm(envDir, { recursive: true, force: true });
});

const config = (options: Pick<ResolvedConfig, "mode" | "envDir">) =>
	options as ResolvedConfig;

describe("prerenderEnv", () => {
	test("loads every variable from the mode's .env files", () => {
		const env = prerenderEnv(config({ mode: "production", envDir }));

		expect(env.DOMCO_TEST_URL).toBe("from-env");
		expect(env.DOMCO_TEST_MODE).toBe("production");
		expect(env.PATH).toBe(process.env.PATH);
	});

	test("keeps variables already set in the environment", () => {
		const env = prerenderEnv(config({ mode: "production", envDir }));

		expect(env.DOMCO_TEST_SET).toBe("from-process");
	});

	test("only loads the files for the mode", () => {
		const env = prerenderEnv(config({ mode: "staging", envDir }));

		expect(env.DOMCO_TEST_URL).toBe("from-env");
		expect(env.DOMCO_TEST_MODE).toBeUndefined();
	});

	test("uses process.env when envDir is false", () => {
		const env = prerenderEnv(config({ mode: "production", envDir: false }));

		expect(env).toBe(process.env);
	});
});

describe("ssrBuildConfig", () => {
	test("uses the client build's mode and config file", () => {
		expect(
			ssrBuildConfig({
				mode: "staging",
				configFile: "/app/vite.custom.ts",
			} as ResolvedConfig),
		).toStrictEqual({
			mode: "staging",
			configFile: "/app/vite.custom.ts",
			build: { ssr: true },
		});
	});

	test("does not look for a config file when the client build had none", () => {
		expect(
			ssrBuildConfig({ mode: "production" } as ResolvedConfig).configFile,
		).toBe(false);
	});
});
