// import { auth } from "./auth";
import {
  apiRoutes,
  authRoutes,
  publicRoutes,
  DEF_LOGIN_REDIRECT,
} from "@/routes";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  const isLogged = !!req.auth;
  const isApi = nextUrl.pathname.startsWith(apiRoutes);
  const isPublic = publicRoutes.includes(nextUrl.pathname);
  const isAuth = authRoutes.includes(nextUrl.pathname);

  if (isApi) return null;

  if (isAuth) {
    if (isLogged)
      return Response.redirect(new URL(DEF_LOGIN_REDIRECT, nextUrl));
    return null;
  }

  if (!isLogged && !isPublic) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(
      new URL(`/hws/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
