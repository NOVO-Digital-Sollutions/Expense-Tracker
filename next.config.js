/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Set base path if deploying to a subdirectory (e.g., /repo-name)
  // basePath: process.env.NODE_ENV === 'production' ? '/novo-expense-tracker' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/novo-expense-tracker' : '',
}

module.exports = nextConfig