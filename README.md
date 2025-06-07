# Job Search App

This repository started as a minimal React Native project for a job search application.
It now also includes a simple Kotlin Multiplatform Mobile (KMM) module and example Swift projects for iOS and macOS.

## Getting Started

1. Ensure you have the React Native development environment set up. See the [React Native documentation](https://reactnative.dev/docs/environment-setup) for instructions.
2. Install dependencies (may require internet access):
   ```bash
   npm install
   ```
3. Run on Android:
   ```bash
   npm run android
   ```
4. Run on iOS:
   ```bash
   npm run ios
   ```

### Kotlin Multiplatform

The `kmm` directory contains a basic Kotlin Multiplatform project. To build the
shared framework for the iOS simulator on macOS run:

```bash
cd kmm
./gradlew :shared:assembleIosSimulatorArm64DebugFramework
```

The generated framework can then be opened with Xcode and executed in the iOS
emulator.

## Project Structure

- `src/App.js` - Main React Native component.
- `ios/` - Contains a minimal SwiftUI iOS example.
- `android/` - Placeholder for an Android project.
- `macos/` - Contains a minimal SwiftUI macOS example.
- `package.json` - Project metadata and scripts.

Feel free to expand on this skeleton to add job listings, search functionality, and more.
