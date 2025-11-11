# Run project all at once

    npm start

## Install dependencies

    npm i

## Expo Project

    cd city-venture
    npm i
    npx expo start

## Unified UI and Organized Files

1. Use global omponents for consistent and unified UI
    - PageContainer.tsx
    - Container.tsx
    - Typography.tsx
        - Sample Use:
            - [ ] <Typography.Title></Typography.Title>
            - [ ] <Typography.Header></Typography.Header>
            - [ ] <Typography.CardTitle></Typography.CardTitle>
            - [ ] <Typography.CardSubTitle></Typography.CardSubTitle>
            - [ ] <Typography.Label></Typography.Label>
            - [ ] <Typography.Body></Typography.Body>
    - Button.tsx
    - IconButton.tsx
    - SearchBar.tsx
    - DynamicTab.tsx
    - NoDataFound.tsx
2. Use utils/Colors.ts for consistent color
3. Configure the IP Address in api.tsx to run the app locally
4. Use clean architecture

## For Component Demo

    http://localhost:5173/test

## For Business

    http://localhost:5173/login

## For Admin

    http://localhost:5173/tourism/login

## Test Account

1. Business Portal
    - email: `owner@gmail.com` | `owner1@gmail.com` | `owner2@gmail.com`
    - password: owner123

2. Admin Portal
    - email: `admin@gmail.com`
    - password: admin123

3. Tourist
    - email: `tourist@gmail.com`
    - password: tourist123
