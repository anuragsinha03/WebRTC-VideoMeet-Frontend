// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	// server: {
	// 	host: "192.168.107.2", // or use your local IP address directly, e.g., '192.168.x.x'
	// 	port: 5173,
	// },
});

