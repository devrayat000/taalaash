export default defineNitroConfig({
	minify: true,
	externals: {
		inline: ["zod", "zustand"],
	},
});
