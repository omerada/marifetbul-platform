# Fix unknown to Error casting in catch blocks
# Production-ready error handling

$files = Get-ChildItem -Path "app", "components", "hooks", "lib" -Recurse -Include "*.ts", "*.tsx" -File

$pattern = 'logger\.(error|warn|info|debug)\(([^,]+),\s*error,\s*\{'
$replacement = 'logger.$1($2, error instanceof Error ? error : new Error(String(error)), {'

$fixedCount = 0
$fileCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $originalContent = $content
    $content = $content -replace $pattern, $replacement
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fileCount++
        $matches = ([regex]::Matches($originalContent, $pattern)).Count
        $fixedCount += $matches
        Write-Host "Fixed $matches errors in: $($file.FullName)"
    }
}

Write-Host "`nTotal: Fixed $fixedCount error castings in $fileCount files"
