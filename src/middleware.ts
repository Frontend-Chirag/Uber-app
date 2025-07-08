import { NextRequest, NextResponse } from "next/server";
import { AuthSessionMiddleware } from "./middleware/auth-session-middleware";
import { geolocation } from "./server/utils/geolocation";


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

function isPublicRoute(pathname: string): boolean {
  // Remove leading slash for easier parsing
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  // Split path into segments
  const segments = cleanPath.split('/').filter(Boolean);

  // Auth routes are public (login, signup)
  if (segments[0] === 'login' || segments[0] === 'signup') {
    return true;
  }

  // Check if it's a country/lang pattern (2-letter country codes, 2-letter language codes)
  const countryPattern = /^[a-z]{2}$/i;
  const langPattern = /^[a-z]{2}$/i;

  // Only public if exactly two segments (/<country>/<lang>)
  if (
    segments.length === 2 &&
    countryPattern.test(segments[0]) &&
    langPattern.test(segments[1])
  ) {
    return true;
  }

  // All other routes are protected
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Get country for redirects
  const { country } = await geolocation.getGeolocation();
  const localizedLanding = `/${country.toLowerCase()}/en`;

  // Check if current route is public
  const isPublic = isPublicRoute(pathname);


  const authResponse = await AuthSessionMiddleware(request);
  const isAuthenticated = authResponse && authResponse instanceof NextResponse && authResponse.status === 200;
  
  console.log(isAuthenticated, isPublic)

  // Handle special redirects
  if (pathname === '/looking') {
    return NextResponse.redirect(new URL(`/go/home?visitor_id=sdbfiw92834ye9r&from=navbar`, request.url));
  }
  

  // Authenticated user trying to access public routes - redirect to rider home
  if (isAuthenticated && isPublic) {
    console.log(pathname)
    url.pathname = `${localizedLanding}/rider-home`;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // Unauthenticated user trying to access protected routes - redirect to localized landing
  if (!isAuthenticated && !isPublic) {

    url.pathname = localizedLanding;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (pathname === '/') {
    return withSecurityHeaders(NextResponse.redirect(new URL(localizedLanding, request.url)));
  }

  // If we have an auth response, return it
  if (authResponse) {
    return withSecurityHeaders(authResponse);
  }

  // Continue with the request
  const response = NextResponse.next();
  return withSecurityHeaders(response);
};

export const config = {
  matcher: [
    // Apply middleware to all routes except static files, _next, api, _vercel
    '/((?!_next|api|_vercel|.*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|ico|woff2?)).*)'
  ]
};
