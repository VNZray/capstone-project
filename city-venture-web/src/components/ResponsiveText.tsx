import React from "react";
import { colors } from "../utils/Colors";

export type ResponsiveTextType =
	| `title-${"extra-small" | "small" | "medium" | "large"}`
	| `header-${"extra-small" | "small" | "medium" | "large"}`
	| `sub-title-${"extra-small" | "small" | "medium" | "large"}`
	| `body-${"extra-small" | "small" | "medium" | "large"}`
	| `card-title-${"extra-small" | "small" | "medium" | "large"}`
	| `card-sub-title-${"extra-small" | "small" | "medium" | "large"}`
	| `label-${"extra-small" | "small" | "medium" | "large"}`
	| `link-${"extra-small" | "small" | "medium" | "large"}`;

export type FontWeight =
	| "normal"
	| "medium"
	| "semi-bold"
	| "bold"
	| "bolder"
	| "extra-bold"
	| "black";

export type TextAlign = "left" | "center" | "right" | "justify";

export type ResponsiveTextProps = React.HTMLAttributes<HTMLSpanElement> & {
	type?: ResponsiveTextType;
	weight?: FontWeight;
	align?: TextAlign;
	color?: string;

	// spacing (in rem)
	pt?: number;
	pr?: number;
	pb?: number;
	pl?: number;
	mt?: number;
	mr?: number;
	mb?: number;
	ml?: number;

	// icons
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;
	topIcon?: React.ReactNode;
	bottomIcon?: React.ReactNode;
	children?: React.ReactNode;
};

// Base rem sizes derived from the React Native themed-text px values
const BASE_REM: Record<ResponsiveTextType, number> = {
	// Titles
	"title-large": 2.0, // 32px
	"title-medium": 1.75, // 28px
	"title-small": 1.5, // 24px
	"title-extra-small": 1.25, // 20px

	// Headers
	"header-large": 2.0,
	"header-medium": 1.75,
	"header-small": 1.5,
	"header-extra-small": 1.25,

	// Sub Titles
	"sub-title-large": 1.375, // 22px
	"sub-title-medium": 1.25,
	"sub-title-small": 1.125,
	"sub-title-extra-small": 1.0,

	// Body
	"body-large": 1.125,
	"body-medium": 1.0,
	"body-small": 0.875,
	"body-extra-small": 0.75,

	// Card Titles
	"card-title-large": 1.25,
	"card-title-medium": 1.125,
	"card-title-small": 1.0,
	"card-title-extra-small": 0.875,

	// Card Sub Titles
	"card-sub-title-large": 1.0,
	"card-sub-title-medium": 0.875,
	"card-sub-title-small": 0.75,
	"card-sub-title-extra-small": 0.625,

	// Labels
	"label-large": 1.0,
	"label-medium": 0.875,
	"label-small": 0.75,
	"label-extra-small": 0.625,

	// Links
	"link-large": 1.125,
	"link-medium": 1.0,
	"link-small": 0.875,
	"link-extra-small": 0.75,
};

type Scale = "lg" | "md" | "sm";

const classifyScale = (base: number): Scale => {
	if (base >= 1.5) return "lg";
	if (base >= 1.0) return "md";
	return "sm";
};

// Build a fluid clamp string using the requested formula
// font-size: clamp(min-rem, calc(base-vw + base-rem), max-rem)
const fluidClamp = (baseRem: number) => {
	const scale = classifyScale(baseRem);
	// Choose vw influence and bounds by scale
	const settings: Record<Scale, { vw: number; min: number; max: number; add: number }> = {
		lg: { vw: 0.6, min: baseRem * 0.9, max: baseRem * 1.3, add: baseRem * 0.6 },
		md: { vw: 0.5, min: baseRem * 0.9, max: baseRem * 1.2, add: baseRem * 0.5 },
		sm: { vw: 0.4, min: baseRem * 0.9, max: baseRem * 1.15, add: baseRem * 0.4 },
	};
	const { vw, min, max, add } = settings[scale];
	// Convert numbers to rem strings with up to 4 decimals
	const toRem = (n: number) => `${parseFloat(n.toFixed(4))}rem`;
	return `clamp(${toRem(min)}, calc(${vw}vw + ${toRem(add)}), ${toRem(max)})`;
};

const weightToCss = (weight: FontWeight): React.CSSProperties => {
	switch (weight) {
		case "medium":
			return { fontWeight: 500 };
		case "semi-bold":
			return { fontWeight: 600 };
		case "bold":
			return { fontWeight: 700 };
		case "bolder":
			return { fontWeight: 800 };
		case "extra-bold":
			return { fontWeight: 800 };
		case "black":
			return { fontWeight: 900 };
		default:
			return { fontWeight: 400 };
	}
};

export default function ResponsiveText({
	type = "body-medium",
	weight = "normal",
	align = "left",
	color = "#111111",
	pt = 0,
	pr = 0,
	pb = 0,
	pl = 0,
	mt = 0,
	mr = 0,
	mb = 0,
	ml = 0,
	startIcon,
	endIcon,
	topIcon,
	bottomIcon,
	children,
	style,
	...rest
}: ResponsiveTextProps) {
	const isLink = type.startsWith("link-");
	const baseRem = BASE_REM[type];
	const fontSize = fluidClamp(baseRem);
	const textColor = isLink ? colors.primary ?? "#1e90ff" : color;

	const textEl = (
		<span
			style={{
				fontSize,
				color: textColor,
				textAlign: align as any,
				paddingTop: pt ? `${pt}rem` : undefined,
				paddingRight: pr ? `${pr}rem` : undefined,
				paddingBottom: pb ? `${pb}rem` : undefined,
				paddingLeft: pl ? `${pl}rem` : undefined,
				marginTop: mt ? `${mt}rem` : undefined,
				marginRight: mr ? `${mr}rem` : undefined,
				marginBottom: mb ? `${mb}rem` : undefined,
				marginLeft: ml ? `${ml}rem` : undefined,
				textDecoration: isLink ? "underline" : undefined,
				display: "inline-block",
				...weightToCss(weight),
				...(style as React.CSSProperties),
			}}
			{...rest}
		>
			{children}
		</span>
	);

	if (topIcon || bottomIcon) {
		return (
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				{topIcon ? <div style={{ marginBottom: "0.25rem" }}>{topIcon}</div> : null}
				{textEl}
				{bottomIcon ? <div style={{ marginTop: "0.25rem" }}>{bottomIcon}</div> : null}
			</div>
		);
	}

	return (
		<div style={{ display: "flex", alignItems: "center" }}>
			{startIcon ? <div style={{ marginRight: "0.375rem" }}>{startIcon}</div> : null}
			{textEl}
			{endIcon ? <div style={{ marginLeft: "0.375rem" }}>{endIcon}</div> : null}
		</div>
	);
}

export const clampFor = (type: ResponsiveTextType) => fluidClamp(BASE_REM[type]);
