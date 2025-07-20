import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/tests/setup.ts"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/tests/"],
		},
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});