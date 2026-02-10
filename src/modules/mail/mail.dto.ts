export class SendEmailDto {
	to!: string;
}

export class SendWelcomeDto extends SendEmailDto {
	username!: string;
}

export class SendMagicLinkDto extends SendEmailDto {
	magicLink!: string;
}

export class SendOtpDto extends SendEmailDto {
	otp!: string;
}
