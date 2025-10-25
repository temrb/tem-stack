import env from '@/env';
import { GoogleTagManager } from '@next/third-parties/google';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Script from 'next/script';

export const Analytics = () => {
	return (
		process.env.NODE_ENV === 'production' && (
			<>
				{/* clarity */}
				<Script
					type='text/javascript'
					id='ms_clarity'
					dangerouslySetInnerHTML={{
						__html: `
		(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
	})(window, document, "clarity", "script", "${env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
					`,
					}}
				/>

				{/* google analytics */}
				<GoogleTagManager gtmId={env.NEXT_PUBLIC_GTAG_ID} />

				{/* vercel analytics */}
				<VercelAnalytics />
			</>
		)
	);
};

export default Analytics;
