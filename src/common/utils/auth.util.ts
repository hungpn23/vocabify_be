export function extractTokenFromHeader(authorizationHeader?: string) {
	const [type, token] = authorizationHeader?.split(" ") ?? [];
	return type === "Bearer" ? token : "";
}
