# Job Search App

This repository provides a minimal React Native application alongside a Kotlin Multiplatform Mobile (KMM) module and simple SwiftUI examples for iOS and macOS.

## Getting Started with Visual Studio

1. Install [Visual Studio Code](https://code.visualstudio.com/) and add the **React Native Tools** extension. This extension allows you to run React Native applications directly from the editor.
2. Follow the [React Native environment setup](https://reactnative.dev/docs/environment-setup) for your operating system. This installs Node.js, the Android SDK (or Xcode for iOS), and the React Native CLI.
3. Clone this repository and install dependencies:
   ```bash
   npm install
   ```
4. Open the project folder in Visual Studio Code. Start an Android or iOS simulator from your installed SDK tools.
5. With the simulator running, press `F5` or choose **Run Android** / **Run iOS** from the Command Palette to launch the app in the emulator. You can also run the scripts manually:
   ```bash
   npm run android    # builds and runs on Android
   npm run ios        # builds and runs on iOS
   ```

### Kotlin Multiplatform

The `kmm` directory contains a basic Kotlin Multiplatform project. To build the shared framework for the iOS simulator on macOS run:

```bash
cd kmm
./gradlew :shared:assembleIosSimulatorArm64DebugFramework
```

The generated framework can then be opened with Xcode and executed in the iOS simulator.

## Project Structure

- `src/App.js` - Main React Native component.
- `ios/` - Contains a minimal SwiftUI iOS example.
- `android/` - Placeholder for an Android project.
- `macos/` - Contains a minimal SwiftUI macOS example.
- `package.json` - Project metadata and scripts.

Feel free to expand on this skeleton to add job listings, search functionality, and more.
