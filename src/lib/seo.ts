interface SiteConfig {
	title: string;
	description: string;
	keywords?: string[];
	author?: {
		name: string;
	};
	siteName?: string;
	url?: string;
	locale?: string;
}

export function seo(siteConfig: SiteConfig) {
	return [
		{ charSet: "utf-8" },
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1, viewport-fit=cover",
		},
		{
			name: "description",
			content: siteConfig.description,
		},
		{
			name: "keywords",
			content: siteConfig.keywords.join(", "),
		},
		{
			name: "author",
			content: siteConfig.author.name,
		},
		{
			name: "robots",
			content:
				"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
		},
		{
			name: "googlebot",
			content:
				"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
		},
		// Open Graph
		{
			property: "og:type",
			content: "website",
		},
		{
			property: "og:site_name",
			content: siteConfig.siteName,
		},
		{
			property: "og:title",
			content: siteConfig.title,
		},
		{
			property: "og:description",
			content: siteConfig.description,
		},
		{
			property: "og:url",
			content: siteConfig.url,
		},
		{
			property: "og:image",
			content: `${siteConfig.url}/og-image.png`, // Add this image to your public folder
		},
		{
			property: "og:image:width",
			content: "1200",
		},
		{
			property: "og:image:height",
			content: "630",
		},
		{
			property: "og:image:alt",
			content: siteConfig.title,
		},
		{
			property: "og:locale",
			content: siteConfig.locale,
		},
		// Twitter Card
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:site",
			content: "@zul_rayat",
		},
		{
			name: "twitter:creator",
			content: "@zul_rayat",
		},
		{
			name: "twitter:title",
			content: siteConfig.title,
		},
		{
			name: "twitter:description",
			content: siteConfig.description,
		},
		{
			name: "twitter:image",
			content: `${siteConfig.url}/og-image.png`,
		},
		// Apple Web App
		{
			name: "apple-mobile-web-app-capable",
			content: "yes",
		},
		{
			name: "apple-mobile-web-app-title",
			content: siteConfig.siteName,
		},
		{
			name: "apple-mobile-web-app-status-bar-style",
			content: "default",
		},
		// PWA
		{
			name: "application-name",
			content: siteConfig.siteName,
		},
		{
			name: "mobile-web-app-capable",
			content: "yes",
		},
		{
			name: "theme-color",
			content: "#ffffff",
		},
		// Additional SEO
		{
			name: "generator",
			content: "TanStack Start",
		},
		{
			name: "category",
			content: "Education",
		},
		{
			name: "coverage",
			content: "Worldwide",
		},
	];
}
