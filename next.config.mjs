/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Load the Firebase SDK from node_modules on the server instead of bundling
  // it, so its component registry is shared across modules.
  serverExternalPackages: ["firebase", "@firebase/app", "@firebase/firestore"],
};

export default nextConfig;
