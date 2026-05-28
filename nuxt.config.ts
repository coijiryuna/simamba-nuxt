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
    // Session password untuk nuxt-auth-utils
    sessionPassword:
      process.env.NUXT_SESSION_PASSWORD || "23d8427157ff4361a8ee053bf37a57aa",

    // SIMBA API
    simbaUrl: process.env.SIMBA_URL,
    simbaOrg: process.env.SIMBA_ORG,
    simbaKey: process.env.SIMBA_KEY,

    // Variabel Database Utama (Simamba) di Server)
    databaseHost: process.env.DATABASE_HOST,
    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    databaseName: process.env.DATABASE_NAME,
    databasePort: process.env.DATABASE_PORT || 3306,

    // Variabel ByZIS
    byzisHost: process.env.BYZIS_HOST || "localhost",
    byzisUser: process.env.BYZIS_USER || "sql_byzis",
    byzisPassword: process.env.BYZIS_PASSWORD || "F3SPdTmP4HcJmdxP",
    byzisName: process.env.BYZIS_NAME || "sql_byzis",

    // Google OAuth (Untuk keperluan API Donasi / ByZIS)
    googleClientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,

    // Upload Directory
    uploadDir: process.env.UPLOAD_DIR || "",

    // Midtrans
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,

    // Security & JWT
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS,
    jwtSecretByzis: process.env.JWT_SECRET_BYZIS,

    public: {
      apiBase: process.env.API_BASE || "/api",
      donasiBase:
        process.env.DONASI_BASE || "https://donasi.baznastangerangkab.or.id",
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
