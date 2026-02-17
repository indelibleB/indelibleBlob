#!/bin/bash
echo "🎬 Generating Holographic Bumper from Splash Icon..."

if ! command -v ffmpeg &> /dev/null
then
    echo "❌ FFmpeg could not be found. Please install it (sudo apt install ffmpeg) to generate the video."
    echo "⚠️  Using the placeholder file for now (This is just an image renamed to .mp4 and will NOT play)."
    exit 1
fi

# Generate 3-second video from image
# -loop 1: Loop image
# -t 3: Duration 3 seconds
# -pix_fmt yuv420p: Ensure compatibility with Android/iOS players
# -vf scale=1080:1920: Force portrait HD (if source is different)
# -r 30: 30 fps
ffmpeg -y -loop 1 -i splash-icon.png -c:v libx264 -t 3 -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -r 30 bumper.mp4

echo "✅ bumper.mp4 generated successfully!"
