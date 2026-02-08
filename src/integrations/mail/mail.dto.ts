export class SendMailDto {
	to!: string;
}

export class SendWelcomeEmailDto extends SendMailDto {
	username!: string;
}

export class SendMagicLinkEmailDto extends SendMailDto {
	magicLink!: string;
}

export class SendEmailVerificationEmailDto extends SendMailDto {
	otp!: string;
}
