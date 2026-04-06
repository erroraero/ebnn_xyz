import { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session && request.nextUrl.pathname.startsWith("/guestbook")) {
		return NextResponse.redirect(new URL("/v2/oauth/social/Github/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/guestbook"],
};
