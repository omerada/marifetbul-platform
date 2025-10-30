<#
.SYNOPSIS
    Admin Dashboard Import Path Migration Script
    
.DESCRIPTION
    Migrates import paths from deprecated location to canonical location:
    FROM: @/components/admin/dashboard
    TO:   @/components/domains/admin/dashboard
    
.PARAMETER DryRun
    Preview changes without applying them
    
.PARAMETER Backup
    Create .backup files before modifying (default: true)
    
.PARAMETER Verbose
    Show detailed output
    
.EXAMPLE
    .\migrate-admin-dashboard-imports.ps1 -DryRun
    Preview all changes without applying them
    
.EXAMPLE
    .\migrate-admin-dashboard-imports.ps1 -Backup
    Apply changes with backup files
    
.EXAMPLE
    .\migrate-admin-dashboard-imports.ps1 -Backup:$false
    Apply changes without backup
#>

param(
    [switch]$DryRun = $false,
    [switch]$Backup = $true,
    [switch]$Verbose = $false
)

# Configuration
$oldImportPattern = '@/components/admin/dashboard'
$newImportPattern = '@/components/domains/admin/dashboard'
$fileExtensions = @('*.ts', '*.tsx', '*.js', '*.jsx')
$excludePaths = @('.next', 'node_modules', 'dist', 'build', '.git')

# Statistics
$stats = @{
    TotalFiles = 0
    FilesScanned = 0
    FilesModified = 0
    LinesModified = 0
    Errors = 0
}

# Colors
$ColorSuccess = 'Green'
$ColorWarning = 'Yellow'
$ColorError = 'Red'
$ColorInfo = 'Cyan'

function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Admin Dashboard Import Migration" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN MODE - No files will be modified]`n" -ForegroundColor Yellow
    }
    
    if ($Backup -and -not $DryRun) {
        Write-Host "[BACKUP MODE - .backup files will be created]`n" -ForegroundColor Green
    }
}

function Write-Stats {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Migration Statistics" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Total Files Found:    $($stats.TotalFiles)" -ForegroundColor White
    Write-Host "Files Scanned:        $($stats.FilesScanned)" -ForegroundColor White
    Write-Host "Files Modified:       $($stats.FilesModified)" -ForegroundColor Green
    Write-Host "Lines Modified:       $($stats.LinesModified)" -ForegroundColor Green
    Write-Host "Errors:               $($stats.Errors)" -ForegroundColor $(if ($stats.Errors -gt 0) { $ColorError } else { $ColorSuccess })
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Test-ShouldExclude {
    param([string]$Path)
    
    foreach ($exclude in $excludePaths) {
        if ($Path -like "*$exclude*") {
            return $true
        }
    }
    
    return $false
}

function Get-TargetFiles {
    Write-Host "Scanning for files..." -ForegroundColor Info
    
    $allFiles = @()
    foreach ($ext in $fileExtensions) {
        $files = Get-ChildItem -Path "." -Include $ext -Recurse -File | Where-Object {
            -not (Test-ShouldExclude $_.FullName)
        }
        $allFiles += $files
    }
    
    $stats.TotalFiles = $allFiles.Count
    Write-Host "Found $($allFiles.Count) files to scan`n" -ForegroundColor $ColorSuccess
    
    return $allFiles
}

function Backup-File {
    param([string]$FilePath)
    
    $backupPath = "$FilePath.backup"
    
    if (Test-Path $backupPath) {
        # Backup already exists, add timestamp
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $backupPath = "$FilePath.$timestamp.backup"
    }
    
    Copy-Item $FilePath $backupPath -Force
    
    if ($Verbose) {
        Write-Host "  Created backup: $backupPath" -ForegroundColor $ColorInfo
    }
}

function Update-ImportPaths {
    param([string]$FilePath)
    
    $stats.FilesScanned++
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # Check if file contains old import pattern
        if ($content -match [regex]::Escape($oldImportPattern)) {
            Write-Host "Processing: $FilePath" -ForegroundColor $ColorWarning
            
            # Count occurrences
            $matches = [regex]::Matches($content, [regex]::Escape($oldImportPattern))
            $count = $matches.Count
            
            if ($Verbose) {
                Write-Host "  Found $count occurrence(s)" -ForegroundColor $ColorInfo
            }
            
            if (-not $DryRun) {
                # Create backup if enabled
                if ($Backup) {
                    Backup-File $FilePath
                }
                
                # Replace old pattern with new pattern
                $newContent = $content -replace [regex]::Escape($oldImportPattern), $newImportPattern
                
                # Write updated content
                Set-Content $FilePath $newContent -NoNewline -ErrorAction Stop
                
                $stats.FilesModified++
                $stats.LinesModified += $count
                
                Write-Host "  ✓ Updated successfully ($count lines)" -ForegroundColor $ColorSuccess
            } else {
                Write-Host "  [DRY RUN] Would update $count line(s)" -ForegroundColor $ColorInfo
            }
        }
    } catch {
        $stats.Errors++
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor $ColorError
    }
}

function Confirm-Migration {
    if ($DryRun) {
        return $true
    }
    
    Write-Host "`nThis will modify files in your project." -ForegroundColor $ColorWarning
    Write-Host "Backup mode: $Backup" -ForegroundColor $ColorWarning
    Write-Host "`nContinue? (Y/N): " -NoNewline -ForegroundColor $ColorWarning
    
    $confirmation = Read-Host
    
    return $confirmation -eq 'Y' -or $confirmation -eq 'y'
}

# Main execution
Write-Header

if (-not (Confirm-Migration)) {
    Write-Host "Migration cancelled by user`n" -ForegroundColor $ColorWarning
    exit 0
}

$files = Get-TargetFiles

Write-Host "Starting migration...`n" -ForegroundColor $ColorInfo

foreach ($file in $files) {
    Update-ImportPaths $file.FullName
}

Write-Stats

if ($stats.FilesModified -gt 0 -and -not $DryRun) {
    Write-Host "✓ Migration completed successfully!" -ForegroundColor $ColorSuccess
    Write-Host "`nNext steps:" -ForegroundColor $ColorInfo
    Write-Host "1. Run: npm run type-check" -ForegroundColor White
    Write-Host "2. Run: npm run lint" -ForegroundColor White
    Write-Host "3. Run: npm run test" -ForegroundColor White
    Write-Host "4. Run: npm run build" -ForegroundColor White
    Write-Host "`nIf issues occur, run: .\rollback-migration.ps1`n" -ForegroundColor $ColorWarning
} elseif ($DryRun) {
    Write-Host "✓ Dry run completed!" -ForegroundColor $ColorSuccess
    Write-Host "`nTo apply changes, run without -DryRun flag`n" -ForegroundColor $ColorInfo
} else {
    Write-Host "No files needed migration`n" -ForegroundColor $ColorInfo
}

# Return exit code
exit $(if ($stats.Errors -gt 0) { 1 } else { 0 })
