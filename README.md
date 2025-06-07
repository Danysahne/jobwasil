# Job Search App

This repository contains a simple React Native project demonstrating a dummy job search application. It can run on both Android and iOS, including the iOS simulator available on a Macbook.

## Getting Started

1. Ensure you have the React Native development environment set up. See the [React Native documentation](https://reactnative.dev/docs/environment-setup) for instructions.
2. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
3. Open the project in Visual Studio Code.
4. To launch the app in the iOS simulator (Macbook required):
   ```bash
   npm run ios
   ```
   The command opens the default iOS simulator and starts the Metro bundler.
5. To launch on Android, ensure an Android emulator is available and run:
   ```bash
   npm run android
   ```

## Project Structure

- `src/App.js` – Main application component with a search bar and a static list of jobs.
- `package.json` – Project metadata and scripts. A test script prints "No tests yet".

Feel free to expand this skeleton with real job listings, network requests, or additional features.
