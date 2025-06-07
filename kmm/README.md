# Kotlin Multiplatform Module

This folder contains a minimal Kotlin Multiplatform project. The `shared` module compiles to a framework that can run on iOS and Android.

## Building for iOS

From a macOS machine run:

```bash
./gradlew :shared:assembleIosSimulatorArm64DebugFramework
```

The resulting framework can be opened with Xcode and run in the iOS simulator.
