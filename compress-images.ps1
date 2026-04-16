$srcDir = 'c:\Users\ADM Setebit\Desktop\sitealfredo\imagens'
$files = @(
    'scales-justice-workplace.jpg',
    'judge-gavel-about-strike-court.jpg',
    'legal-agreement-handshake.jpg',
    'legal-consultation-with-documents-scales-justice.jpg',
    'legal-document-signing.jpg',
    'man-is-writing-pen-card.jpg',
    'real-estate-contract-table.jpg',
    'top-view-career-guidance-items-judges.jpg',
    'top-view-career-guidance-items-judges (1).jpg',
    'truth-concept-arrangement-with-balance.jpg'
)

Add-Type -AssemblyName System.Drawing

foreach ($f in $files) {
    $path = Join-Path $srcDir $f
    if (-not (Test-Path $path)) {
        Write-Host "SKIP: $f"
        continue
    }
    $size = (Get-Item $path).Length
    if ($size -lt 500000) {
        $sizeKB = [math]::Round($size / 1024)
        Write-Host "OK (small): $f (${sizeKB}KB)"
        continue
    }

    # Backup original
    $bak = $path + '.original'
    if (-not (Test-Path $bak)) {
        Copy-Item $path $bak
    }

    # Load image bytes into MemoryStream to avoid file lock
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $ms = New-Object System.IO.MemoryStream($bytes, 0, $bytes.Length)
    $img = [System.Drawing.Image]::FromStream($ms)
    $w = $img.Width
    $h = $img.Height

    # Target: max 1200px wide
    $maxW = 1200
    if ($w -gt $maxW) {
        $ratio = $maxW / $w
        $newW = [int]($w * $ratio)
        $newH = [int]($h * $ratio)
    } else {
        $newW = $w
        $newH = $h
    }

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)
    
    # Dispose source BEFORE saving
    $img.Dispose()
    $ms.Dispose()

    # Save to a temp file first, then replace
    $tempPath = $path + '.tmp'
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 70L)
    $bmp.Save($tempPath, $codec, $encoderParams)
    $bmp.Dispose()
    $g.Dispose()

    # Replace original with compressed
    Remove-Item $path -Force
    Rename-Item $tempPath $f

    $newSize = (Get-Item $path).Length
    $oldMB = [math]::Round($size / 1048576, 1)
    $newKB = [math]::Round($newSize / 1024)
    Write-Host "COMPRESSED: $f  ${oldMB}MB -> ${newKB}KB"
}

Write-Host "DONE - All images compressed!"
