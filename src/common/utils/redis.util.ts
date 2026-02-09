import { GetTermSuggestionDto } from "@api/suggestion/suggestion.dto";
import { UUID } from "@common/types";

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

export function getSignUpSessionKey(token: string) {
	return `sign_up_session:${token}`;
}

export function getSuggestionKey({
	term,
	partOfSpeech,
	termLanguage,
	definitionLanguage,
}: GetTermSuggestionDto) {
	return `suggestion:${term}:${partOfSpeech}:termLang:${termLanguage}:defLang:${definitionLanguage}`;
}
