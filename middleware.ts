import { withAuth } from "next-auth/middleware";
import { getToken, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// export default withAuth({
//   pages: {
//     signIn: "/signin",
//     error: "/signin",
//     newUser: "/init",
//   },
//   callbacks: {
//     authorized({ token, req }) {
//       const url = new URL(req.url);

//       if (token?.type === "admin" && url.pathname.includes("admin")) {
//         return true;
//       }

//       if (token?.type === "user" && !url.pathname.includes("admin")) {
//         return true;
//       }

//       return false;
//     },
//   },
// });

export default async function middleware(req: NextRequest) {
  console.log("runninng middleware");

  const url = new URL(req.url);
  const token = await getToken({ req });
  if (url.pathname.includes("admin")) {
    if (url.pathname.includes("signin")) {
      return NextResponse.next();
    }
    if (token?.type === "admin") {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      `${req.nextUrl.origin}/admin/signin?callbackUrl=${req.nextUrl.pathname}`
    );
  } else {
    if (token?.type === "user") {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      `${req.nextUrl.origin}/signin?callbackUrl=${req.nextUrl.pathname}`
    );
  }
}

// export default withAuth(
//   (req, ev) => {
//     console.log("runninng middleware");

//     const url = new URL(req.url);
//     const token = req.nextauth?.token;
//     const token = await getToken({req})
//     if (url.pathname.includes("admin")) {
//       if (url.pathname.includes("signin")) {
//         return NextResponse.next();
//       }
//       if (token?.type === "admin") {
//         return NextResponse.next();
//       }
//       return NextResponse.redirect(`${req.nextUrl.origin}/admin/signin`);
//     } else {
//       if (token?.type === "user") {
//         return NextResponse.next();
//       }
//       return NextResponse.redirect(`${req.nextUrl.origin}/signin`);
//     }
//   },
//   {
//     pages: {
//       signIn: "/signin",
//       error: "/signin",
//       newUser: "/init",
//     },
//   }
// );

export const config = {
  matcher: [
    // "/((?!api|_next/static|_next/image|favicon.ico|admin).*)",
    "/admin/:path*",
    "/search",
    "/bookmarks",
  ],
};
