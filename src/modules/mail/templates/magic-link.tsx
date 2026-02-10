import {
	Body,
	Container,
	Head,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

export type MagicLinkEmailProps = {
	link: string;
};

export const MagicLinkEmail = ({ link }: MagicLinkEmailProps) => (
	<Html>
		<Head />
		<Tailwind>
			<Body className="bg-white font-notion">
				<Preview>Log in to Vocabify</Preview>
				<Container className="px-3 mx-auto">
					<Link
						href={link}
						target="_blank"
						className="text-[#2754C5] text-[14px] underline mb-4 block"
					>
						Click here to log in with this magic link
					</Link>

					<Text className="text-[#ababab] text-[14px] mt-3.5 mb-4">
						If you didn&apos;t try to login, you can safely ignore this email.
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default MagicLinkEmail;
