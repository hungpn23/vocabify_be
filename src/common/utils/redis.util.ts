import { UUID } from "@common/types";
import { GetTermSuggestionDto } from "@modules/suggestion/suggestion.dto";

export function getUserSessionKey(userId: UUID, sessionId: UUID) {
	return `user:${userId}:session:${sessionId}`;
}

export function getVerificationTokenKey(token: string) {
	return `verification_token:${token}`;
}

export function getEmailVerificationKey(
	email: string,
	type: "otp" | "request_attempts" | "confirm_attempts",
) {
	return `email_verification:${type}:${email}`;
}

export function getPasswordResetKey(
	email: string,
	type: "otp" | "request_attempts" | "confirm_attempts",
) {
	return `password_reset:${type}:${email}`;
}

export function getSignUpSessionKey(token: string) {
	return `sign_up_session:${token}`;
}

export function getResetPasswordSessionKey(token: string) {
	return `reset_password_session:${token}`;
}

export function getSuggestionKey({
	term,
	partOfSpeech,
	termLanguage,
	definitionLanguage,
}: GetTermSuggestionDto) {
	return `suggestion:${term}:${partOfSpeech}:term_lang:${termLanguage}:def_lang:${definitionLanguage}`;
}

export function getPrivateCacheKey(userId: UUID, key: string) {
	return `private_cache:${userId}:${key}`;
}
