<#
.SYNOPSIS
    Rollback Admin Dashboard Import Migration
    
.DESCRIPTION
    Restores files from .backup files created during migration
    
.PARAMETER Confirm
    Skip confirmation prompt
    
.PARAMETER DeleteBackups
    Delete backup files after successful rollback
    
.EXAMPLE
    .\rollback-migration.ps1
    Rollback with confirmation
    
.EXAMPLE
    .\rollback-migration.ps1 -Confirm:$false -DeleteBackups
    Rollback without confirmation and delete backups
#>

param(
    [switch]$Confirm = $true,
    [switch]$DeleteBackups = $false
)

# Statistics
$stats = @{
    BackupsFound = 0
    FilesRestored = 0
    BackupsDeleted = 0
    Errors = 0
}

# Colors
$ColorSuccess = 'Green'
$ColorWarning = 'Yellow'
$ColorError = 'Red'
$ColorInfo = 'Cyan'

function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  Migration Rollback" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "This will restore files from .backup files`n" -ForegroundColor Yellow
}

function Write-Stats {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Rollback Statistics" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Backups Found:        $($stats.BackupsFound)" -ForegroundColor White
    Write-Host "Files Restored:       $($stats.FilesRestored)" -ForegroundColor Green
    Write-Host "Backups Deleted:      $($stats.BackupsDeleted)" -ForegroundColor Yellow
    Write-Host "Errors:               $($stats.Errors)" -ForegroundColor $(if ($stats.Errors -gt 0) { $ColorError } else { $ColorSuccess })
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Get-BackupFiles {
    Write-Host "Searching for backup files..." -ForegroundColor $ColorInfo
    
    $backupFiles = Get-ChildItem -Path "." -Include "*.backup" -Recurse -File | Where-Object {
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.next*" -and
        $_.FullName -notlike "*dist*" -and
        $_.FullName -notlike "*build*"
    }
    
    $stats.BackupsFound = $backupFiles.Count
    
    if ($backupFiles.Count -eq 0) {
        Write-Host "No backup files found`n" -ForegroundColor $ColorWarning
        return @()
    }
    
    Write-Host "Found $($backupFiles.Count) backup file(s)`n" -ForegroundColor $ColorSuccess
    
    return $backupFiles
}

function Restore-File {
    param([string]$BackupPath)
    
    $originalPath = $BackupPath -replace '\.backup$', ''
    
    try {
        Write-Host "Restoring: $originalPath" -ForegroundColor $ColorWarning
        
        # Copy backup to original location
        Copy-Item $BackupPath $originalPath -Force -ErrorAction Stop
        
        $stats.FilesRestored++
        Write-Host "  ✓ Restored successfully" -ForegroundColor $ColorSuccess
        
        # Delete backup if requested
        if ($DeleteBackups) {
            Remove-Item $BackupPath -Force -ErrorAction Stop
            $stats.BackupsDeleted++
            Write-Host "  ✓ Backup deleted" -ForegroundColor $ColorInfo
        }
        
    } catch {
        $stats.Errors++
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor $ColorError
    }
}

function Confirm-Rollback {
    if (-not $Confirm) {
        return $true
    }
    
    Write-Host "This will restore files from backups and may overwrite current changes." -ForegroundColor $ColorWarning
    Write-Host "`nContinue? (Y/N): " -NoNewline -ForegroundColor $ColorWarning
    
    $confirmation = Read-Host
    
    return $confirmation -eq 'Y' -or $confirmation -eq 'y'
}

# Main execution
Write-Header

if (-not (Confirm-Rollback)) {
    Write-Host "Rollback cancelled by user`n" -ForegroundColor $ColorWarning
    exit 0
}

$backupFiles = Get-BackupFiles

if ($backupFiles.Count -eq 0) {
    exit 0
}

Write-Host "Starting rollback...`n" -ForegroundColor $ColorInfo

foreach ($backup in $backupFiles) {
    Restore-File $backup.FullName
}

Write-Stats

if ($stats.FilesRestored -gt 0) {
    Write-Host "✓ Rollback completed successfully!" -ForegroundColor $ColorSuccess
    
    if (-not $DeleteBackups) {
        Write-Host "`nBackup files are still present." -ForegroundColor $ColorInfo
        Write-Host "Run with -DeleteBackups flag to remove them.`n" -ForegroundColor $ColorInfo
    }
    
    Write-Host "Next steps:" -ForegroundColor $ColorInfo
    Write-Host "1. Verify files are restored correctly" -ForegroundColor White
    Write-Host "2. Run: npm run type-check" -ForegroundColor White
    Write-Host "3. Run: npm run test`n" -ForegroundColor White
} else {
    Write-Host "No files were restored`n" -ForegroundColor $ColorWarning
}

# Return exit code
exit $(if ($stats.Errors -gt 0) { 1 } else { 0 })
