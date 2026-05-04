import nextCoreVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
