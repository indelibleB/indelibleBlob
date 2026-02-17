# indelible.Blob: Kotlin Version Compatibility Loop Analysis

## The Problem (In Plain English)

Your build is stuck in a **version mismatch loop** between:
- **Kotlin version:** 1.9.24 (being used)
- **Compose Compiler version:** 1.5.15 (requires Kotlin 1.9.25)

The error message:
```
This version (1.5.15) of the Compose Compiler requires Kotlin version 1.9.25 
but you appear to be using Kotlin version 1.9.24 which is not known to be compatible.
```

---

## Why This Loop Occurs

### Root Cause: Version Mismatch in Expo Modules

**The chain of events:**

1. **Expo 52.0.0** includes `expo-modules-core` (which bundles Compose Compiler 1.5.15)
2. **Compose Compiler 1.5.15** requires Kotlin 1.9.25
3. **Your gradle.properties** specifies Kotlin 1.9.25 ✅
4. **BUT:** When you run `npx expo prebuild --clean`, Expo regenerates the Android build files
5. **During regeneration:** The build system uses a different Kotlin version (1.9.24) from somewhere
6. **Result:** Version mismatch → Build fails → You try to fix it → Loop repeats

### Why Simple Version Matching Fails

You probably tried:
```bash
# This doesn't work because...
android.kotlinVersion=1.9.25  # ← You set this
# But Expo's prebuild overwrites it with 1.9.24
```

The issue is that **multiple sources of truth** exist:
1. `gradle.properties` (your setting)
2. `build.gradle` (Expo's setting)
3. Expo CLI's internal defaults
4. React Native's defaults

When `npx expo prebuild --clean` runs, it regenerates files and can override your settings.

---

## The Solution (Three Approaches)

### Approach 1: Force Kotlin Version in build.gradle (RECOMMENDED)

**Why this works:** `build.gradle` takes precedence over `gradle.properties` during the build process.

**Steps:**

1. **Edit `mobile/android/build.gradle`:**

```gradle
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    ext {
        buildToolsVersion = findProperty('android.buildToolsVersion') ?: '35.0.0'
        minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
        compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
        targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '34')
        kotlinVersion = '1.9.25'  // ← EXPLICITLY SET HERE (matches Compose Compiler)

        ndkVersion = "26.1.10909125"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath('com.android.tools.build:gradle')
        classpath('com.facebook.react:react-native-gradle-plugin')
        classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')  // ← ADD THIS LINE
    }
}

apply plugin: "com.facebook.react.rootproject"

allprojects {
    repositories {
        maven {
            url(new File(['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), '../android'))
        }
        maven {
            url(new File(['node', '--print', "require.resolve('jsc-android/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim(), '../dist'))
        }

        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
```

**Key changes:**
- Line 9: `kotlinVersion = '1.9.25'` (explicitly set)
- Line 20: `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')` (force Kotlin plugin version)

2. **Edit `mobile/android/gradle.properties`:**

```properties
# ... existing content ...

# EXPLICITLY SET KOTLIN VERSION (matches Compose Compiler 1.5.15)
android.kotlinVersion=1.9.25

# SUPPRESS VERSION CHECK (if needed as fallback)
# Uncomment only if build still fails after above changes
# kotlin.supposeKotlinVersionCompatibilityCheck=true
```

3. **Clean and rebuild:**

```bash
cd ~/indelible-blob/mobile/android
./gradlew clean

cd ~/indelible-blob/mobile
npx expo run:android
```

---

### Approach 2: Update Expo to Latest (Alternative)

If Approach 1 doesn't work, update Expo to the latest version which may have fixed this:

```bash
cd ~/indelible-blob/mobile

# Update Expo to latest
npm install expo@latest

# Update other Expo modules
npm install expo-modules-core@latest

# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

---

### Approach 3: Suppress Version Check (Nuclear Option - Last Resort)

Only use this if Approaches 1-2 fail:

```gradle
// In mobile/android/build.gradle, add to buildscript block:

buildscript {
    ext {
        kotlinVersion = '1.9.25'
        // ... other settings ...
    }
    
    // Add this block:
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += "-Xsuppress-version-warnings"
        }
    }
}
```

---

## Why This Loop Happens (Technical Deep Dive)

### The Dependency Chain:

```
Expo 52.0.0
  └─ expo-modules-core (includes Compose UI)
      └─ Compose Compiler 1.5.15
          └─ Requires Kotlin 1.9.25

Your Project
  └─ React Native 0.76.6
      └─ Uses Kotlin 1.9.24 (default)
```

### The Conflict:

When `npx expo prebuild --clean` runs:
1. It regenerates `build.gradle` from templates
2. Templates use React Native's default Kotlin version (1.9.24)
3. But Expo's Compose Compiler requires 1.9.25
4. **Result:** Mismatch

### Why Matching Versions Alone Doesn't Work:

You might have set `android.kotlinVersion=1.9.25` in gradle.properties, but:
- ❌ `gradle.properties` is read **after** `build.gradle`
- ❌ `build.gradle` classpath dependencies use their own versions
- ❌ `npx expo prebuild` regenerates files and can override your settings

**The fix:** Set Kotlin version in `build.gradle` (which is read first) AND in `gradle.properties` (as backup).

---

## How to Avoid This in the Future

### 1. **Lock Kotlin Version Immediately**

After creating a new Expo project, immediately set Kotlin version:

```bash
# In mobile/android/build.gradle:
kotlinVersion = '1.9.25'  // Match your Compose Compiler version

# In mobile/android/gradle.properties:
android.kotlinVersion=1.9.25
```

### 2. **Check Compose-Kotlin Compatibility**

Before updating Expo or Compose:
- Visit: https://developer.android.com/jetpack/androidx/releases/compose-kotlin
- Find the compatible Kotlin version for your Compose Compiler
- Set it explicitly in both `build.gradle` and `gradle.properties`

### 3. **Don't Use `npx expo prebuild --clean` Lightly**

This command regenerates Android files and can override your settings. Only use when:
- ✅ Starting a new project
- ✅ Updating major Expo versions
- ❌ NOT for regular builds

Instead, use:
```bash
npx expo run:android  # Builds without regenerating files
```

### 4. **Create a Version Lock File**

Create `mobile/android/KOTLIN_VERSION.lock`:

```
# indelible.Blob Kotlin Version Lock
# Last updated: 2025-02-10
# Reason: Compose Compiler 1.5.15 requires Kotlin 1.9.25

KOTLIN_VERSION=1.9.25
COMPOSE_COMPILER_VERSION=1.5.15
EXPO_VERSION=52.0.0

# If you need to update Kotlin:
# 1. Check Compose-Kotlin compatibility map
# 2. Update both build.gradle and gradle.properties
# 3. Update this file
# 4. Test thoroughly
```

### 5. **Add Version Verification Script**

Create `mobile/android/verify-versions.sh`:

```bash
#!/bin/bash

KOTLIN_VERSION=$(grep "kotlinVersion = " build.gradle | head -1 | sed "s/.*= '//;s/'.*//")
GRADLE_KOTLIN=$(grep "android.kotlinVersion" gradle.properties | sed 's/.*=//')

if [ "$KOTLIN_VERSION" != "$GRADLE_KOTLIN" ]; then
    echo "❌ Kotlin version mismatch!"
    echo "   build.gradle: $KOTLIN_VERSION"
    echo "   gradle.properties: $GRADLE_KOTLIN"
    exit 1
fi

echo "✅ Kotlin versions match: $KOTLIN_VERSION"
```

Run before building:
```bash
./verify-versions.sh && npx expo run:android
```

---

## Summary Table

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with Kotlin version mismatch | `npx expo prebuild` regenerates files with wrong Kotlin version | Set Kotlin version in `build.gradle` classpath dependencies |
| Simple version matching doesn't work | Multiple sources of truth for Kotlin version | Set in both `build.gradle` AND `gradle.properties` |
| Loop keeps happening | `npx expo prebuild --clean` keeps regenerating files | Use `npx expo run:android` instead (doesn't regenerate) |
| Don't know which version to use | Compose Compiler requires specific Kotlin version | Check https://developer.android.com/jetpack/androidx/releases/compose-kotlin |

---

## Quick Fix (Copy & Paste)

### Step 1: Update mobile/android/build.gradle

Find this section:
```gradle
buildscript {
    ext {
        kotlinVersion = '1.9.25'  // ← Make sure this is 1.9.25
```

Add this line in the `dependencies` block:
```gradle
classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')
```

### Step 2: Update mobile/android/gradle.properties

Add/update this line:
```properties
android.kotlinVersion=1.9.25
```

### Step 3: Clean and rebuild

```bash
cd ~/indelible-blob/mobile/android
./gradlew clean

cd ~/indelible-blob/mobile
npx expo run:android
```

---

## Expected Result

After these changes:
- ✅ Build completes successfully
- ✅ No Kotlin version mismatch errors
- ✅ App launches on Seeker
- ✅ No more version loops
- ✅ Ready for customer discovery

---

*indelible.Blob Build System Analysis - February 10, 2025*
*This is a common issue in React Native/Expo projects with Compose UI*
