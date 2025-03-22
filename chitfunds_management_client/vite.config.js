import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: process.env.NODE_ENV === 'production' ? 3000 : 5173,
		proxy: {
			'/api': {
				target:
					process.env.NODE_ENV === 'production'
						? 'http://server:5001'
						: 'http://chit-server-dev:5001',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
});
