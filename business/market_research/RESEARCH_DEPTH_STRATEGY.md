# 📉 Research: Depth Validation Strategy (The 2D Defense)

**Goal**: Detect if the user is photographing a **real 3D scene** or a **2D Screen** (Analog Loophole Attack).
**Mechanism**: Depth Maps (LiDAR / ToF).

---

## 1. The Limitation 🚧
We are currently building with **Expo Managed Workflow** (`expo-camera`).
*   **Status**: `expo-camera` **does NOT** support Depth Map extraction (API `depthData` was experimental and removed/unreliable in modern `CameraView`).
*   **Result**: We cannot currently get a "Heatmap of Distance" to prove 3D structure.

## 2. The Solution: `react-native-vision-camera` 👁️
To get true Depth Data (on iOS LiDAR and Android ToF), we must migrate to `react-native-vision-camera`.
*   **Pros**: Full control, frame processors, depth buffers.
*   **Cons**: Requires native code linking (Prebuild), heavier maintainability.

## 3. The Interim Strategy: "Logic-First"
Since we are in the "Signify & Verify" phase (Sprint 2) and want to avoid a full Camera rewrite *right now*:

1.  **Implement the Forensics Logic**: Update `SensorForensics.ts` to accept and analyze depth buffers (even if empty for now).
2.  **Define the Schema**: Ensure our `Capture` type has a slot for `depthMap`.
3.  **The "Null" Defense**: Currently, we will flag captures as "No Depth Data" (Bronze/Silver Grade).
    *   *Gold Grade (Future)*: Will REQUIRE valid depth variance (proving 3D).

## 4. Proposed Roadmap Adjustment
*   **Step 1 (Now)**: Finalize `SensorForensics.validateDepth` logic (The Brain).
*   **Step 2 (Later)**: Swap `expo-camera` for `vision-camera` (The Eye).

---

## 5. Technical Implementation (The Schema)
We will add this to our Metadata:
```typescript
interface DepthMetadata {
  minDepth: number; // meters
  maxDepth: number; // meters
  variance: number; // 0.0 = Flat (Screen), >0.5 = 3D (Real)
  map?: string;     // Base64 small heatmap (optional)
}
```
