import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

export type WelcomeEmailProps = {
	username: string;
};

export const WelcomeEmail = ({ username }: WelcomeEmailProps) => (
	<Html lang="en">
		<Head />
		<Tailwind>
			<Body className="bg-white font-sans">
				<Preview>Welcome to Vocabify!</Preview>
				<Container className="mx-auto py-5 pb-12">
					<Text className="text-[16px] leading-[26px]">Hi {username},</Text>
					<Text className="text-[16px] leading-[26px]">
						Welcome to Vocabify!
					</Text>
					<Section className="text-center">
						<Button
							className="bg-[#5F51E8] rounded-[3px] text-white text-[16px] no-underline text-center block p-3"
							href="#"
						>
							Get started
						</Button>
					</Section>
					<Text className="text-[16px] leading-[26px]">
						Best,
						<br />
						The Vocabify team
					</Text>
					<Hr className="border-[#cccccc] my-5" />
					<Text className="text-[#8898aa] text-[12px]">Ha Noi, Viet Nam</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default WelcomeEmail;
