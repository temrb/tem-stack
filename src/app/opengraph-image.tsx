import { SOCIAL_IMAGE_SIZES } from '@/lib/metadata/config';
import { ImageResponse } from 'next/og';

export const alt = 'Open Graph Image';
export const size = SOCIAL_IMAGE_SIZES.openGraph;
export const contentType = 'image/png';

/**
 * Root Open Graph image generator
 *
 * This generates the default OG image for all pages that don't have
 * a more specific opengraph-image.tsx file in their route folder.
 *
 * For dynamic images per route, create opengraph-image.tsx files
 * in the specific route folders.
 */
export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#ffffff',
					position: 'relative',
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				{/* Background gradient circle */}
				<div
					style={{
						position: 'absolute',
						bottom: '40px',
						right: '40px',
						width: '100px',
						height: '100px',
						borderRadius: '50%',
						background: 'hsl(20, 14.3%, 4.1%)',
					}}
				></div>

				{/* Brand name */}
				{/* <div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
						zIndex: 1,
					}}
				>
					<h1
						style={{
							fontSize: '80px',
							fontWeight: 700,
							color: 'hsl(20, 14.3%, 4.1%)',
							margin: 0,
							marginBottom: '20px',
							letterSpacing: '-0.05em',
						}}
					>
						{env.NEXT_PUBLIC_APP_NAME}
					</h1>
					<p
						style={{
							fontSize: '32px',
							color: 'hsl(0, 0%, 45%)',
							margin: 0,
							textAlign: 'center',
							maxWidth: '800px',
							lineHeight: 1.4,
						}}
					>
						Job Search & Resume Optimization Platform
					</p>
				</div> */}
			</div>
		),
		{
			...size,
		},
	);
}
