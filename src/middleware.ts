import { NextRequest, NextResponse } from "next/server";
import { AuthSessionMiddleware } from "./middleware/auth-session-middleware";
import { geolocation } from "./server/utils/geolocation";
import { connectRedis } from "./lib/db/redis";


const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
};


function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};



export const publicRoute = ['/login', '/signup', '/'];



export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const isPublicRoute = publicRoute.includes(pathname);

  await connectRedis();


  const authResponse = await AuthSessionMiddleware(request);
  const isAuthenticated = authResponse && authResponse instanceof NextResponse && authResponse.status === 200;

  const { country } = await geolocation.getGeolocation();

  const localizedLanding = `/${country.toLowerCase()}/en`;
  publicRoute.push(localizedLanding)


  if (url.pathname === '/looking') {
    return NextResponse.redirect(new URL(`/go/home?visitor_id=sdbfiw92834ye9r&from=navbar`, request.url));
  }


  // 3. Authenticated user should NOT access public routes
  if ((isAuthenticated && isPublicRoute)) {
    console.log('authenticated')
    url.pathname = `${localizedLanding}/rider-home`;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // 4. Unauthenticated user trying to access protected routes (not public)
  if (!isAuthenticated && !isPublicRoute) {
    console.log('unAuthenticated')
    url.pathname = localizedLanding;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (authResponse) {
    return withSecurityHeaders(authResponse);
  }

  const response = NextResponse.next();

  return withSecurityHeaders(response);
};


export const config = {
  matcher: [
    // Apply middleware to all routes except static files, _next, api, _vercel
    '/((?!_next|api|_vercel|.*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|ico|woff2?)).*)'
  ]
};