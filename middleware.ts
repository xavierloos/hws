// import { auth } from "./auth";
import {
  apiRoutes,
  authRoutes,
  publicRoutes,
  DEF_LOGIN_REDIRECT,
} from "@/routes";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  const isLogged = !!req.auth;
  const isApi = nextUrl.pathname.startsWith(apiRoutes);

  const checkIsPublic = (url: string) => {
    return publicRoutes.some((item) => {
      if (item.includes("*")) {
        const regex = new RegExp(item.replace("*", ".*"));
        return url.match(regex);
      } else {
        return item.includes(url);
      }
    });
  };

  const isPublic = checkIsPublic(nextUrl.pathname);
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
    const encodedCallbackUrl = `/hws/login?callbackUrl=${encodeURIComponent(
      callbackUrl
    )}`;

    return Response.redirect(new URL(encodedCallbackUrl, nextUrl));
  }
  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
