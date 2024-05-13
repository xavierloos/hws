/**
 * Public access, does not require authentication
 */
export const publicRoutes = ["/", "/hws/emailverification", "/blogs"];
/**
 * Public access to authentication
 */
export const authRoutes = [
  "/hws/login",
  "/hws/register",
  "/hws/registerinvitation",
  "/hws/error",
  "/hws/resetpassword",
];
/**
 * Special public for api / do not block it
 */
export const apiRoutes = ["/api/auth"];
/**
 * Redirect after athenticate
 */
export const DEF_LOGIN_REDIRECT = "/hws/dashboard";

// ANY OTHER ROUTE WILL BE BLOCKED BY AUTH
