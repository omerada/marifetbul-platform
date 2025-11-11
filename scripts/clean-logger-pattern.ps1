# Clean Logger Error Pattern Script
# Removes verbose error instanceof pattern

$targetPattern = 'error instanceof Error \? error : new Error\(String\(error\)\)'
$replacement = 'error'

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path "." -Include "*.ts","*.tsx" -Recurse -Exclude "node_modules","dist","build",".next"

$modifiedCount = 0
$filesModified = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content -match $targetPattern) {
        Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
        
        # Replace the pattern
        $newContent = $content -replace $targetPattern, $replacement
        
        # Save the file
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        
        $modifiedCount++
        $filesModified += $file.FullName
        
        Write-Host "  OK Modified" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "CLEANUP SUMMARY"
Write-Host "========================================"
Write-Host "Files scanned: $($files.Count)"
Write-Host "Files modified: $modifiedCount"
Write-Host ""
Write-Host "Modified files:"
$filesModified | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "Cleanup complete!"
