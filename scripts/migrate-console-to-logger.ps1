<#
.SYNOPSIS
    Migrates console.* calls to logger in TypeScript/JavaScript files

.DESCRIPTION
    Sprint 1 - Task 4: Logger Migration
    Automatically converts console.log/error/warn to logger equivalents
    
    Patterns handled:
    - console.log(...) -> logger.debug(...)
    - console.error(...) -> logger.error(...)
    - console.warn(...) -> logger.warn(...)
    - console.info(...) -> logger.info(...)

.NOTES
    Author: MarifetBul Development Team
    Version: 1.0.0
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Path = ".",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [string[]]$Exclude = @(
        "node_modules",
        ".next",
        "build",
        "dist",
        "__tests__",
        "tests",
        "scripts",
        "public"
    )
)

$ErrorActionPreference = "Stop"

# Statistics
$stats = @{
    FilesScanned = 0
    FilesModified = 0
    ConsoleCalls = 0
    ImportsAdded = 0
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-ShouldExclude {
    param([string]$FilePath)
    
    foreach ($pattern in $Exclude) {
        if ($FilePath -like "*$pattern*") {
            return $true
        }
    }
    return $false
}

function Add-LoggerImport {
    param([string]$Content)
    
    # Check if logger import already exists
    if ($Content -match "import logger from '@/lib/infrastructure/monitoring/logger'") {
        return $Content
    }
    
    # Find the last import statement
    $lines = $Content -split "`n"
    $lastImportIndex = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^import\s+") {
            $lastImportIndex = $i
        }
    }
    
    if ($lastImportIndex -ge 0) {
        # Insert logger import after last import
        $newLines = @()
        $newLines += $lines[0..$lastImportIndex]
        $newLines += "import logger from '@/lib/infrastructure/monitoring/logger';"
        $newLines += $lines[($lastImportIndex + 1)..($lines.Count - 1)]
        $stats.ImportsAdded++
        return ($newLines -join "`n")
    }
    
    # No imports found, add at beginning
    $stats.ImportsAdded++
    return "import logger from '@/lib/infrastructure/monitoring/logger';`n`n$Content"
}

function Convert-ConsoleToLogger {
    param([string]$Content)
    
    $modified = $false
    $result = $Content
    
    # Pattern: console.error(...) -> logger.error(...)
    # Handle multi-line console calls
    if ($result -match 'console\.(error|warn|info|log|debug)') {
        # console.log -> logger.debug
        $result = $result -replace '\bconsole\.log\(', 'logger.debug('
        
        # console.error -> logger.error (ensure Error object)
        $result = $result -replace 'console\.error\((.*?),\s*(\w+)\);', 'logger.error($1, $2 instanceof Error ? $2 : new Error(String($2)));'
        
        # console.warn -> logger.warn
        $result = $result -replace '\bconsole\.warn\(', 'logger.warn('
        
        # console.info -> logger.info
        $result = $result -replace '\bconsole\.info\(', 'logger.info('
        
        # console.debug -> logger.debug
        $result = $result -replace '\bconsole\.debug\(', 'logger.debug('
        
        $stats.ConsoleCalls++
        $modified = $true
    }
    
    if ($modified) {
        # Add logger import if console.* was found
        $result = Add-LoggerImport $result
    }
    
    return @{
        Content = $result
        Modified = $modified
    }
}

function Process-File {
    param([System.IO.FileInfo]$File)
    
    if (Test-ShouldExclude $File.FullName) {
        return
    }
    
    $stats.FilesScanned++
    
    try {
        $content = Get-Content -Path $File.FullName -Raw -Encoding UTF8
        
        $result = Convert-ConsoleToLogger $content
        
        if ($result.Modified) {
            $stats.FilesModified++
            
            if ($DryRun) {
                Write-ColorOutput "  [DRY RUN] Would modify: $($File.FullName)" "Yellow"
            } else {
                Set-Content -Path $File.FullName -Value $result.Content -Encoding UTF8 -NoNewline
                Write-ColorOutput "  Modified: $($File.FullName)" "Green"
            }
        }
    } catch {
        Write-ColorOutput "  Error processing $($File.FullName): $_" "Red"
    }
}

# Main execution
Write-ColorOutput "`nConsole to Logger Migration Script" "Cyan"
Write-ColorOutput "======================================`n" "Cyan"

if ($DryRun) {
    Write-ColorOutput "WARNING: DRY RUN MODE - No files will be modified`n" "Yellow"
}

Write-ColorOutput "Scanning for TypeScript/JavaScript files...`n" "White"

# Find all TS/TSX/JS/JSX files
$files = Get-ChildItem -Path $Path -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Where-Object { -not $_.PSIsContainer }

Write-ColorOutput "Found $($files.Count) files to process`n" "White"

foreach ($file in $files) {
    Process-File $file
}

# Print statistics
Write-ColorOutput "`n$('=' * 60)" "Cyan"
Write-ColorOutput "Migration Statistics" "Cyan"
Write-ColorOutput "$('=' * 60)" "Cyan"
Write-ColorOutput "Files scanned:      $($stats.FilesScanned)" "White"
Write-ColorOutput "Files modified:     $($stats.FilesModified)" "Green"
Write-ColorOutput "Console calls:      $($stats.ConsoleCalls)" "Yellow"
Write-ColorOutput "Imports added:      $($stats.ImportsAdded)" "Yellow"

if ($DryRun) {
    Write-ColorOutput "`nRun without -DryRun to apply changes" "Yellow"
} elseif ($stats.FilesModified -gt 0) {
    Write-ColorOutput "`nMigration complete!" "Green"
    Write-ColorOutput "   Next steps:" "White"
    Write-ColorOutput "   1. Review changes: git diff" "White"
    Write-ColorOutput "   2. Run type check: npm run type-check" "White"
    Write-ColorOutput "   3. Run linter: npm run lint" "White"
    Write-ColorOutput "   4. Test the application" "White"
} else {
    Write-ColorOutput "`nNo files needed modification" "Green"
}

Write-ColorOutput ""
