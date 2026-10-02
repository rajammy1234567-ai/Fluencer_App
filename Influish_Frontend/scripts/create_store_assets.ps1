Add-Type -AssemblyName System.Drawing

$projectDir = (Get-Item $PSScriptRoot).Parent.FullName
$storeDir = Join-Path $projectDir "store_assets"
if (!(Test-Path $storeDir)) {
    New-Item -ItemType Directory -Path $storeDir | Out-Null
}

# 1. Generate 512x512 App Icon
$iconSrcPath = Join-Path $projectDir "assets\images\icon.png"
if (Test-Path $iconSrcPath) {
    $src = [System.Drawing.Image]::FromFile($iconSrcPath)
    $dest = New-Object System.Drawing.Bitmap(512, 512)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, 512, 512)
    $dest.Save((Join-Path $storeDir "app-icon-512x512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Output "App icon 512x512 generated successfully."
}

# 2. Generate 1024x500 Feature Graphic
$fg = New-Object System.Drawing.Bitmap(1024, 500)
$gfx = [System.Drawing.Graphics]::FromImage($fg)
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gfx.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Sleek Dark Gradient Background (#0B0B10 to #1A1A2E)
$rect = New-Object System.Drawing.Rectangle(0, 0, 1024, 500)
$color1 = [System.Drawing.ColorTranslator]::FromHtml("#09090D")
$color2 = [System.Drawing.ColorTranslator]::FromHtml("#161626")
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$gfx.FillRectangle($gradBrush, $rect)

# Accent Glow / Circle
$accentColor = [System.Drawing.Color]::FromArgb(40, 99, 102, 241) # Soft Indigo glow
$accentBrush = New-Object System.Drawing.SolidBrush($accentColor)
$gfx.FillEllipse($accentBrush, 600, -100, 600, 600)
$accentBrush.Dispose()

# Draw Logo Icon (centered vertically on left)
if (Test-Path $iconSrcPath) {
    $srcLogo = [System.Drawing.Image]::FromFile($iconSrcPath)
    $gfx.DrawImage($srcLogo, 100, 130, 240, 240)
    $srcLogo.Dispose()
}

# Typography
$titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gfx.DrawString("Fluencer", $titleFont, $titleBrush, 380, 160)

$taglineFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$taglineColor = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$taglineBrush = New-Object System.Drawing.SolidBrush($taglineColor)
$gfx.DrawString("Creator & Brand Collaboration Hub", $taglineFont, $taglineBrush, 385, 235)

# Badge / Value Prop pill
$badgeFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$badgeColor = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$badgeBrush = New-Object System.Drawing.SolidBrush($badgeColor)
$gfx.DrawString("SPONSORED CAMPAIGNS  •  PRO PASS  •  INSTANT PAYOUTS", $badgeFont, $badgeBrush, 385, 285)

$badgeFont.Dispose()
$badgeBrush.Dispose()
$titleFont.Dispose()
$titleBrush.Dispose()
$taglineFont.Dispose()
$taglineBrush.Dispose()
$gradBrush.Dispose()
$gfx.Dispose()

$fg.Save((Join-Path $storeDir "feature-graphic-1024x500.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fg.Dispose()
Write-Output "Feature graphic 1024x500 generated successfully."
