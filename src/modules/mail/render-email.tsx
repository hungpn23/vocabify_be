import { render } from "@react-email/components";

export async function renderEmail<Props extends Record<string, unknown>>(
	Component: React.FC<Props>,
	props: Props,
) {
	return await render(<Component {...props} />, { pretty: true });
}
