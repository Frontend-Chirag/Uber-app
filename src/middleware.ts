import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "./lib/auth";
import { AuthSessionMiddleware } from "./middleware/auth-session-middleware";
import { geolocation, ipAddress } from '@vercel/functions';


const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
}

function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}


export const publicRoute = ['/login', '/signup', '/'];


export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const isPublicRoute = publicRoute.includes(pathname);


  const authResponse = await AuthSessionMiddleware(request);
  const isAuthenticated = authResponse && authResponse instanceof NextResponse && authResponse.status === 200;
 

  const geo = geolocation(request);
  const ip = ipAddress(request);  

  console.log('Geolocation:', geo);
  console.log('Ip Address', ip);

  if (url.pathname === '/looking') {
    return NextResponse.redirect(new URL(`/go/home?visitor_id=sdbfiw92834ye9r&from=navbar`, request.url));
  }


  if (isAuthenticated && isPublicRoute) {
    return withSecurityHeaders(NextResponse.redirect(new URL('/go/home', request.url)));
  }

  if (!isAuthenticated && !isPublicRoute) {
    url.pathname = "/login";
    return withSecurityHeaders(NextResponse.redirect(url));
  }


  if (authResponse) {
    return withSecurityHeaders(authResponse);
  }

  const response = NextResponse.next();
  await getClientIp();
  return withSecurityHeaders(response);

}


export const config = {
  matcher: [
    // Apply middleware to all routes except static files, _next, api, _vercel
    '/((?!_next|api|_vercel|.*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|ico|woff2?)).*)'

  ]
}