// Bundles the built dist as a consumer app would, without externals, so that
// broken imports from dependencies (e.g. a removed default export) fail here
// instead of in frontoffice/podcastmaker. Run after `npm run build`.
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    root: import.meta.dirname,
    logLevel: "warn",
    // Some dependencies ship raw .vue files (e.g. vue-material-design-icons)
    plugins: [vue()],
    build: {
        // Only resolve and link; nothing is written
        write: false,
        minify: false,
        rollupOptions: { input: "entry.js" }
    }
});
