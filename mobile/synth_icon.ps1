Add-Type -AssemblyName System.Drawing

$ForePath = "\\wsl.localhost\Ubuntu\home\theil\indelible-blob\mobile\assets\adaptive-foreground.png"
$DestPath = "\\wsl.localhost\Ubuntu\home\theil\indelible-blob\mobile\assets\icon.png"
$Width = 512
$Height = 512
# Deep Space Purple #100820
$BgColor = [System.Drawing.ColorTranslator]::FromHtml("#100820")

function Composite-Icon {
    try {
        if (-not (Test-Path $ForePath)) { throw "Foreground not found at $ForePath" }

        # Load Foreground
        $foreImg = [System.Drawing.Bitmap]::FromFile($ForePath)
        
        # Instantiate correct Enum for 24bpp (No Alpha - Strict Opaque)
        $PFormat = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb

        # Create Canvas
        $finalImg = New-Object System.Drawing.Bitmap $Width, $Height, $PFormat
        $g = [System.Drawing.Graphics]::FromImage($finalImg)
        $g.Clear($BgColor)
        
        # Enable High Quality Scaling
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Draw centered
        $g.DrawImage($foreImg, 0, 0, $Width, $Height)
        
        # Save
        $finalImg.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $g.Dispose()
        $finalImg.Dispose()
        $foreImg.Dispose()
        
        Write-Host "✅ Created Synthesized Opaque Icon (24-bit) at $DestPath"
    }
    catch {
        Write-Error "Composition Failed: $_"
    }
}

Composite-Icon
Add-Type -AssemblyName System.Drawing

$ForePath = "\\wsl.localhost\Ubuntu\home\theil\indelible-blob\mobile\assets\adaptive-foreground.png"
$DestPath = "\\wsl.localhost\Ubuntu\home\theil\indelible-blob\mobile\assets\icon.png"
$Width = 512
$Height = 512
# Deep Space Purple #100820
$BgColor = [System.Drawing.ColorTranslator]::FromHtml("#100820")

function Composite-Icon {
    try {
        if (-not (Test-Path $ForePath)) { throw "Foreground not found at $ForePath" }

        # Load Foreground
        $foreImg = [System.Drawing.Bitmap]::FromFile($ForePath)
        
        # Instantiate correct Enum for 32bpp (Alpha)
        $PFormat = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb

        # Create Canvas
        $finalImg = New-Object System.Drawing.Bitmap $Width, $Height, $PFormat
        $g = [System.Drawing.Graphics]::FromImage($finalImg)
        $g.Clear($BgColor)
        
        # Enable High Quality Scaling
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Draw centered
        $g.DrawImage($foreImg, 0, 0, $Width, $Height)
        
        # Save
        $finalImg.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $g.Dispose()
        $finalImg.Dispose()
        $foreImg.Dispose()
        
        Write-Host "✅ Created Synthesized Opaque Icon at $DestPath"
    }
    catch {
        Write-Error "Composition Failed: $_"
    }
}

Composite-Icon
