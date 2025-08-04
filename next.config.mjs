/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true,
      domains: [
       
      ],
    },
    async redirects() {
      return [
        {
          source: '/procurer',
          destination: '/procurer/dashboard',
          permanent: true,
        },
        {
          source: '/client',
          destination: '/client/dashboard',
          permanent: true,
        },
      ]
    },
  };
  
  export default nextConfig;
  