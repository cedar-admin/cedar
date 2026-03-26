import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['ui', 'ui-patterns', 'common', 'icons'],
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
}

export default nextConfig
