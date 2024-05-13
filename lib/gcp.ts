const { Storage } = require("@google-cloud/storage");
export const storage = new Storage({
  projectId: `${process.env.GCP_PROJECT_ID}`,
  credentials: {
    client_email: `${process.env.GCP_SERVICE_ACCOUNT_EMAIL}`,
    private_key: `${process.env.GCP_PRIVATE_KEY}`,
  },
});
