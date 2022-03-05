module.exports = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontSize: {
				'4xs': '.5rem',
				'3xs': '.55rem',
				'2xs': '.65rem',
			},
			screens: {
				desktop: "1200px"
			},
			colors: {
				base: {
					light: "#f9f9f9",
					gray: "#777777",
					dark: "#1C1C1C"
				},
				neutral: {
					dark: '#292929',
					gray: '#F2F2F2',
					grayer: '#7F7F7F',
					grayest: '#DADADA',
					grayiest: '#bbbbbb',
					light: '#FFFFFF',
				},
				primary: {
					light: "#64CDAD",
					DEFAULT: "#93DCC6",
					dark: "#93DCC6"
				},
			}
		},
	},
	plugins: [],
};
