/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["storage.googleapis.com", "firebasestorage.googleapis.com"], // Đảm bảo hostname của Google Cloud Storage được thêm vào
  },
};

module.exports = nextConfig;
