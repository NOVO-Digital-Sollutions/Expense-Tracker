/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Set base path for GitHub Pages subdirectory deployment
  basePath: process.env.NODE_ENV === 'production' ? '/Expense-Tracker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Expense-Tracker' : '',
}

module.exports = nextConfig