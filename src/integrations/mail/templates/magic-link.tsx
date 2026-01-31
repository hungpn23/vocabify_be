import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

export type MagicLinkEmailProps = {
	magicLink: string;
};

export const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => (
	<Html>
		<Head />
		<Tailwind>
			<Body className="bg-white font-notion">
				<Preview>Log in with this magic link</Preview>
				<Container className="px-3 mx-auto">
					<Heading className="text-[#333] text-[24px] my-10 mx-0 p-0">
						Login
					</Heading>
					<Link
						href={magicLink}
						target="_blank"
						className="text-[#2754C5] text-[14px] underline mb-4 block"
					>
						Click here to log in with this magic link
					</Link>
					<Text className="text-[#ababab] text-[14px] mt-3.5 mb-4">
						If you didn&apos;t try to login, you can safely ignore this email.
					</Text>
					<Text className="text-[#898989] text-[12px] leading-[22px] mt-3 mb-6">
						<Link
							href="https://notion.so"
							target="_blank"
							className="text-[#898989] text-[14px] underline"
						>
							Notion.so
						</Link>
						, the all-in-one-workspace
						<br />
						for your notes, tasks, wikis, and databases.
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default MagicLinkEmail;
