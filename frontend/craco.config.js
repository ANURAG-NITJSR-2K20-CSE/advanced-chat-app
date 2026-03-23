const path = require("path");

module.exports = {
  webpack: {
    alias: {
      // Before "@": on case-insensitive volumes, `components` and `Components` are the same
      // folder; shadcn output landed in src/Components/ui/. Map imports explicitly.
      "@/components/ui": path.resolve(__dirname, "src/Components/ui"),
      "@": path.resolve(__dirname, "src"),
    },
  },
};
