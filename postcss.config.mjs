/**
 * Vercel/Next.js production PostCSS configuration.
 *
 * This project uses plain CSS. The previous Vinext/Cloudflare scaffold loaded
 * @tailwindcss/postcss even though the current application does not use
 * Tailwind. Keeping this file intentionally dependency-free prevents stale
 * repository files from breaking `next build` on Vercel.
 */
const config = {
  plugins: {},
};

export default config;
