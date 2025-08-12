// import "dotenv/config";
// import startupModule from "./server/plugins/startup";

export default defineNitroConfig({
	// minify: true,
	externals: {
		inline: ["zod", "zustand"],
	},
	plugins: ["./plugin-redis.ts"],
});
