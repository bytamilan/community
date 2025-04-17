import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"

export async function middleware(request: NextRequest) {
  // First handle Supabase auth
  const response = await updateSession(request)

  // Then handle language detection
  const pathname = request.nextUrl.pathname

  // Skip language detection for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/locales")
  ) {
    return response
  }

  // Check if language is already set in URL or cookie
  const searchParams = request.nextUrl.searchParams
  const langParam = searchParams.get("lang")
  const langCookie = request.cookies.get("i18nextLng")?.value

  // If language is already set, continue
  if (langParam || langCookie) {
    return response
  }

  // Detect language from Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language") || ""
  const preferredLanguage = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim())
    .find((lang) => SUPPORTED_LANGUAGES.includes(lang.substring(0, 2) as string))

  // If a supported language is found, redirect with that language
  if (preferredLanguage) {
    const lang = preferredLanguage.substring(0, 2)
    if (SUPPORTED_LANGUAGES.includes(lang as string)) {
      const url = new URL(request.url)
      url.searchParams.set("lang", lang)
      return NextResponse.redirect(url)
    }
  }

  // Otherwise continue with the default response
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
