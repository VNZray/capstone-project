import React from "react";
import { colors } from "../utils/Colors";

export type ResponsiveTextType =
	| `title-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `header-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `sub-title-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `body-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `card-title-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `card-sub-title-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `label-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`
	| `link-${"extra-small" | "small" | "normal" | "medium" | "large" | "extra-large"}`;

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
	responsive?: boolean; // If true, text color adapts to parent background
	margin?: number | string;
	padding?: number | string;

	// ...existing code...
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
	// ===== Title Sizes =====
	// extra-large: 40px, large: 32px, medium: 28px, normal: 26px, small: 24px, extra-small: 20px
	"title-extra-large": 2.5, // 40px
	"title-large": 2.0, // 32px
	"title-medium": 1.75, // 28px
	"title-normal": 1.625, // 26px
	"title-small": 1.5, // 24px
	"title-extra-small": 1.25, // 20px

	// ===== Header Sizes =====
	// extra-large: 40px, large: 32px, medium: 28px, normal: 26px, small: 24px, extra-small: 20px
	"header-extra-large": 2.5, // 40px
	"header-large": 2.0, // 32px
	"header-medium": 1.75, // 28px
	"header-normal": 1.625, // 26px
	"header-small": 1.5, // 24px
	"header-extra-small": 1.25, // 20px

	// ===== Sub-Title Sizes =====
	// extra-large: 24px, large: 22px, medium: 20px, normal: 19px, small: 18px, extra-small: 16px
	"sub-title-extra-large": 1.5, // 24px
	"sub-title-large": 1.375, // 22px
	"sub-title-medium": 1.25, // 20px
	"sub-title-normal": 1.1875, // 19px
	"sub-title-small": 1.125, // 18px
	"sub-title-extra-small": 1.0, // 16px

	// ===== Body Sizes =====
	// extra-large: 20px, large: 18px, medium: 16px, normal: 15px, small: 14px, extra-small: 12px
	"body-extra-large": 1.25, // 20px
	"body-large": 1.125, // 18px
	"body-medium": 1.0, // 16px
	"body-normal": 0.9375, // 15px
	"body-small": 0.875, // 14px
	"body-extra-small": 0.75, // 12px

	// ===== Card Title Sizes =====
	// extra-large: 22px, large: 20px, medium: 18px, normal: 17px, small: 16px, extra-small: 14px
	"card-title-extra-large": 1.375, // 22px
	"card-title-large": 1.25, // 20px
	"card-title-medium": 1.125, // 18px
	"card-title-normal": 1.0625, // 17px
	"card-title-small": 1.0, // 16px
	"card-title-extra-small": 0.875, // 14px

	// ===== Card Sub-Title Sizes =====
	// extra-large: 18px, large: 16px, medium: 14px, normal: 13px, small: 12px, extra-small: 10px
	"card-sub-title-extra-large": 1.125, // 18px
	"card-sub-title-large": 1.0, // 16px
	"card-sub-title-medium": 0.875, // 14px
	"card-sub-title-normal": 0.8125, // 13px
	"card-sub-title-small": 0.75, // 12px
	"card-sub-title-extra-small": 0.625, // 10px

	// ===== Label Sizes =====
	// extra-large: 18px, large: 16px, medium: 14px, normal: 13px, small: 12px, extra-small: 10px
	"label-extra-large": 1.125, // 18px
	"label-large": 1.0, // 16px
	"label-medium": 0.875, // 14px
	"label-normal": 0.8125, // 13px
	"label-small": 0.75, // 12px
	"label-extra-small": 0.6875, // 11px

	// ===== Link Sizes =====
	// extra-large: 20px, large: 18px, medium: 16px, normal: 15px, small: 14px, extra-small: 12px
	"link-extra-large": 1.25, // 20px
	"link-large": 1.125, // 18px
	"link-medium": 1.0, // 16px
	"link-normal": 0.9375, // 15px
	"link-small": 0.875, // 14px
	"link-extra-small": 0.75, // 12px
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
	// Choose vw influence and bounds by scale - higher vw for more aggressive width-based scaling
	const settings: Record<Scale, { vw: number; min: number; max: number; add: number }> = {
		lg: { vw: 1.2, min: baseRem * 0.6, max: baseRem * 1.3, add: baseRem * 0.2 },
		md: { vw: 1.0, min: baseRem * 0.6, max: baseRem * 1.25, add: baseRem * 0.2 },
		sm: { vw: 0.9, min: baseRem * 0.6, max: baseRem * 1.2, add: baseRem * 0.15 },
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

// Detect if color is light or dark using luminance
const isLightColor = (color: string): boolean => {
	// Parse hex color or css color name
	let r = 0, g = 0, b = 0;

	if (color.startsWith("#")) {
		const hex = color.replace("#", "");
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
	} else if (color.startsWith("rgb")) {
		// Parse rgb(r, g, b) format
		const match = color.match(/\d+/g);
		if (match) {
			[r, g, b] = match.map(Number);
		}
	} else {
		// Fallback: assume light color for most common names
		const lightColors = ["white", "lightgray", "lightgrey", "lightyellow", "lightblue", "lightgreen"];
		return lightColors.some((lc) => color.toLowerCase().includes(lc));
	}

	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
};

// Get computed background color of parent
const getParentBackgroundColor = (element: HTMLElement | null): string => {
	if (!element) return "white";

	let el: HTMLElement | null = element.parentElement;
	while (el) {
		const bgColor = window.getComputedStyle(el).backgroundColor;
		if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
			return bgColor;
		}
		el = el.parentElement;
	}

	return "white";
};

export default function ResponsiveText({
	type = "body-medium",
	weight = "normal",
	align = "left",
	color = "#111111",
	responsive = true,
	margin,
	padding,
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
	
	// Ref to detect parent background and adjust color dynamically
	const spanRef = React.useRef<HTMLSpanElement>(null);
	const [textColor, setTextColor] = React.useState<string>(isLink ? colors.primary ?? "#1e90ff" : color);

	React.useEffect(() => {
		if (!responsive || !spanRef.current) return;

		// Get parent background color
		const parentBgColor = getParentBackgroundColor(spanRef.current);
		
		// Determine if parent is light or dark
		const isLight = isLightColor(parentBgColor);
		
		// Set text color based on background
		setTextColor(isLight ? "#000000" : "#FFFFFF");
	}, [responsive]);

	const textEl = (
		<span
			ref={spanRef}
			style={{
				fontSize,
				fontFamily: "'Poppins', sans-serif",
				margin,
				padding,
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
