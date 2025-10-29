// Prefer EXPO public env, otherwise derive host dynamically so IP changes automatically on `npx expo start`.
import { Platform, NativeModules } from "react-native";

function deriveApiFromDevHost(): string | undefined {
	try {
		if (Platform.OS === "web") {
			// Use the page host on web
			const host = (window as any)?.location?.hostname;
			if (host) return `http://${host}:3000/api`;
		} else {
			// React Native: infer Metro/Expo host from bundle URL
			const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
			if (scriptURL) {
				// e.g. exp://192.168.1.14:19000/index.bundle?platform=android&...
				const match = scriptURL.match(/^[a-zA-Z]+:\/\/([^:\/]+)(?::\d+)?\//);
				const host = match?.[1];
				if (host) return `http://${host}:3000/api`;
				console.warn("Failed to parse host from scriptURL", host);
			}
		}
	} catch {
		// ignore and fall through
	}
	return undefined;
}

const api =
	// process.env.EXPO_PUBLIC_API_URL ||
	// deriveApiFromDevHost() ||
	// "http://localhost:3000/api" ||
	 "http://192.168.110.65:3000/api";

export default api;
