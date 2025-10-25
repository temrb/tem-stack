/**
 * SVG Favicon Route Handler
 *
 * Generates a true vector-based SVG favicon that remains crisp at any resolution.
 * This eliminates pixelation issues inherent to rasterized PNG/ICO formats.
 *
 * SVG favicons are supported by all modern browsers (Chrome 80+, Firefox 41+, Safari 9+).
 * PNG fallback (icon.png) provides compatibility for older browsers.
 */
export async function GET() {
	// SVG markup with gradient circle matching brand design
	const svg = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:hsl(0, 0%, 4%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(0, 0%, 96%);stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#iconGradient)" />
</svg>
	`.trim();

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
