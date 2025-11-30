# Fix TS2353 errors - Object literal with Error type
# Pattern: logger.error('msg', { error: err }) → logger.error('msg', err instanceof Error ? err : new Error(String(err)))

Write-Host "Fixing TS2353 object literal errors..." -ForegroundColor Cyan

$fixedCount = 0
$fileCount = 0

# Get files with TS2353 errors
$errors = npm run type-check 2>&1 | Select-String "TS2353.*'error' does not exist in type 'Error'"

$affectedFiles = @{}
foreach ($error in $errors) {
    if ($error -match "([^(]+)\(\d+,\d+\):") {
        $filePath = $matches[1].Trim()
        $affectedFiles[$filePath] = $true
    }
}

Write-Host "Found $($affectedFiles.Count) files with TS2353 errors" -ForegroundColor Yellow

foreach ($filePath in $affectedFiles.Keys) {
    if (-not (Test-Path $filePath)) { continue }
    
    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    
    # Pattern: logger.error('...', { error: ... })
    # Replace with: logger.error('...', err instanceof Error ? err : new Error(String(err)))
    
    # This is complex - need to handle various error variable names
    $patterns = @(
        # Pattern 1: logger.error('msg', { error: err })
        @{
            Pattern = "logger\.error\(([^,]+),\s*\{\s*error:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\s*\)"
            Replacement = "logger.error(`$1, `$2 instanceof Error ? `$2 : new Error(String(`$2)))"
        }
    )
    
    foreach ($p in $patterns) {
        if ($content -match $p.Pattern) {
            $content = $content -replace $p.Pattern, $p.Replacement
            $fixedCount++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $fileCount++
        Write-Host "  ✓ Fixed: $filePath" -ForegroundColor Green
    }
}

Write-Host "`nFixed $fileCount files with $fixedCount replacements" -ForegroundColor Green
