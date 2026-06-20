export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-auth-utils", "@nuxt/ui"],
  sourcemap: {
    client: "hidden",
    server: true,
  },
  app: {
    head: {
      titleTemplate: "%s | BAZNAS Kabupaten Tangerang",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#01803d" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "BAZNAS Kabupaten Tangerang" },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  // Tailwind 4 setup via PostCSS
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ["lucide-vue-next"],
  },

  // Konfigurasi Nuxt 4
  future: {
    compatibilityVersion: 4,
  },

  // Percaya header dari Nginx reverse proxy (penting untuk HTTPS di produksi)
  nitro: {
    preset: "node-server",
    // Development-only: debug trusted proxies
    logLevel: process.env.NODE_ENV === "development" ? 4 : 3,
  },

  runtimeConfig: {
    sessionPassword: "23d8427157ff4361a8ee053bf37a57aa",

    simbaUrl: "",
    simbaOrg: "",
    simbaKey: "",

    databaseHost: "localhost",
    databaseUser: "",
    databasePassword: "",
    databaseName: "",
    databasePort: "3306",

    byzisHost: "localhost",
    byzisUser: "sql_byzis",
    byzisPassword: "",
    byzisName: "sql_byzis",

    googleClientId: "",
    googleClientSecret: "",

    uploadDir: "",

    midtransIsProduction: false,
    midtransClientKey: "",
    midtransServerKey: "",

    corsAllowedOrigins: "",
    jwtSecretByzis: "",

    public: {
      apiBase: "/api",
      donasiBase: "https://donasi.baznastangerangkab.or.id",
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "@tiptap/vue-3",
        "@tiptap/starter-kit",
        "@tiptap/extension-image",
        "@tiptap/extension-link",
        "@tiptap/extension-underline",
        "swiper/vue",
        "swiper/modules",
        "@tiptap/extension-text-align",
        "@tiptap/extension-text-style",
        "@tiptap/extension-color",
        "@tiptap/extension-highlight",
        "sweetalert2",
      ],
    },
  },
});
