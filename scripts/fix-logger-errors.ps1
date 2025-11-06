# Fix logger.error calls with unknown error parameter
# Converts: logger.error('message', error)
# To: logger.error('message', error instanceof Error ? error : new Error(String(error)))

$ErrorActionPreference = "Stop"

Write-Host "🔧 Fixing logger.error calls with unknown error parameter..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0
$totalFixes = 0

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch "\\node_modules\\" -and 
        $_.FullName -notmatch "\\.next\\" -and
        $_.FullName -notmatch "\\dist\\" -and
        $_.FullName -notmatch "\\build\\"
    }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fixes = 0

    # Pattern 1: logger.error('message', error) in catch block
    # Match inside catch (error) or catch (err) blocks
    $pattern1 = "(?<indent>\s*)logger\.error\((?<quote>[`'""])(?<message>[^`'""]+)\k<quote>,\s*(?<err>error|err)\)"
    if ($content -match $pattern1) {
        $content = $content -replace $pattern1, '$${indent}logger.error($${quote}$${message}$${quote}, $${err} instanceof Error ? $${err} : new Error(String($${err})))'
        $fixes++
    }

    # Pattern 2: logger.error with context object
    $pattern2 = "(?<indent>\s*)logger\.error\((?<quote>[`'""])(?<message>[^`'""]+)\k<quote>,\s*(?<err>error|err),\s*(?<context>\{[^}]+\})\)"
    $matches2 = [regex]::Matches($content, $pattern2)
    foreach ($match in $matches2) {
        $indent = $match.Groups["indent"].Value
        $quote = $match.Groups["quote"].Value
        $message = $match.Groups["message"].Value
        $err = $match.Groups["err"].Value
        $context = $match.Groups["context"].Value
        
        $replacement = "$indent`logger.error($quote$message$quote, $err instanceof Error ? $err : new Error(String($err)), $context)"
        $content = $content.Replace($match.Value, $replacement)
        $fixes++
    }

    if ($fixes -gt 0 -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed++
        $totalFixes += $fixes
        $relativePath = $file.FullName.Replace($PWD.Path + "\", "")
        Write-Host "✓ Fixed: $relativePath ($fixes fixes)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=" * 60
Write-Host "📊 Fix Summary" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host "Files fixed:  $filesFixed"
Write-Host "Total fixes:  $totalFixes"
Write-Host ""

if ($filesFixed -gt 0) {
    Write-Host "✅ Fixes applied successfully!" -ForegroundColor Green
    Write-Host "   Run: npx tsc --noEmit to verify" -ForegroundColor Yellow
} else {
    Write-Host "✓ No files needed fixing." -ForegroundColor Green
}
