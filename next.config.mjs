import path from "node:path";

const nextConfig = {
  devIndicators: false,
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
