# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## City Venture Extensions

### Responsive Design Utilities

A new utility `utils/responsive.ts` provides helpers to scale sizes for small devices:

```ts
import { scale, moderateScale, useResponsive } from '@/utils/responsive';

const { width, isSmallPhone, moderateScale: ms } = useResponsive();
const buttonHeight = ms(44); // adapts to screen width
```

Updated components using this:

- `components/Button.tsx` (adaptive height, padding, font size)
- `components/accommodation/AccommodationCard.tsx` (list image + text sizing)
- `components/GridContainer.tsx` (new responsive grid wrapper)
- `components/TextInput.tsx` (adaptive font size and padding)

#### Adding responsiveness to a new component

1. Import `useWindowDimensions` or `useResponsive`.
2. Replace fixed numbers with `moderateScale(base, factor, width)`.
3. Clamp values with the exported `scaled` helper if needed.

Example:

```ts
const { width } = useWindowDimensions();
const cardPadding = moderateScale(16, 0.5, width); // smaller on narrow screens
```

### Typography System

Responsive typography utilities are available in `constants/typography.ts`.

Usage:

```ts
import { useTypography } from '@/constants/typography';
const t = useTypography();
<Text style={{ fontSize: t.body }}>Adaptive body text</Text>
```

Tokens (baseline before scaling): `display`, `h1`, `h2`, `h3`, `h4`, `body`, `bodySmall`, `caption`, `micro`.
Scaling is moderated (factor ~0.45) so text doesn’t shrink too aggressively on small phones.

If you need a custom one-off size:

```ts
import { scaleFont } from '@/constants/typography';
const size = scaleFont(18);
```
