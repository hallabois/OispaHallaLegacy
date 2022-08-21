export async function load({ parent }) {
	const theme = parent.theme;
	return {
		theme_override: theme
	};
}
