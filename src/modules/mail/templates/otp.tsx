import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

export type OtpEmailProps = {
	otp: string;
};

export const OtpEmail = ({ otp }: OtpEmailProps) => (
	<Html>
		<Head />
		<Tailwind>
			<Body className="bg-white font-notion">
				<Preview>Verify your email in Vocabify</Preview>
				<Container className="px-3 mx-auto">
					<Heading className="text-[#333] text-[24px] my-10 mx-0 p-0">
						Enter this code to verify your email: {otp}
					</Heading>
					<Text className="text-[#ababab] text-[14px] mt-3.5 mb-4">
						This code will expire in 5 minutes.
					</Text>
					<Text className="text-[#ababab] text-[14px] mt-3.5 mb-4">
						If you didn&apos;t try to sign up, you can safely ignore this email.
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default OtpEmail;
