import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(
		{postcss: true}
	),

	kit: {
		adapter: adapter(),
		vite: {
			ssr: {
				noExternal: []
			},
			server: {
				proxy: {
					'/socket.io': {
						changeOrigin: true,
						target: 'ws://localhost:3001',
						ws: true,
					}
				},
				cors: true
			}
		}
	}
};

export default config;
