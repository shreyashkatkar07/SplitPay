const authConfig = {
  providers: [
    {
      type: "oidc",
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
};

export default authConfig;