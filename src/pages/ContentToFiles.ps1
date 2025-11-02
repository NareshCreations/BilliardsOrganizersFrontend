# PowerShell Script to Recreate Files from Unique Delimiter Format
# Save this as: ContentToFiles.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [string]$OutputDirectory,

    [switch]$Force = $false
)

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "Error"   { "Red" }
        "Warning" { "Yellow" }
        "Success" { "Green" }
        default   { "White" }
    }

    if ($PSCmdlet.MyInvocation.BoundParameters["Verbose"]) {
        Write-Host "[$timestamp] $Message" -ForegroundColor $color
    }
    elseif ($Level -eq "Error" -or $Level -eq "Warning") {
        # Always show warnings/errors
        Write-Host "[$timestamp] $Message" -ForegroundColor $color
    }
}


function Write-FileContent {
    param(
        [string]$FilePath,
        [string]$Content
    )
    
    try {
        $absolutePath = [System.IO.Path]::GetFullPath($FilePath)
        $directory = [System.IO.Path]::GetDirectoryName($absolutePath)
        
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
            if ($Verbose) { Write-Log "Created directory: $directory" -Level "Success" }
        }
        
        $Content | Out-File -FilePath $absolutePath -Encoding UTF8 -Force
        Write-Log "Created file: $FilePath" -Level "Success"
        return $true
    }
    catch {
        Write-Log "Failed to create file: $FilePath - $($_.Exception.Message)" -Level "Error"
        return $false
    }
}

function Parse-FileContent {
    param([string]$InputFile)
    
    if (-not (Test-Path $InputFile)) {
        Write-Log "Input file not found: $InputFile" -Level "Error"
        return @{ Files = @(); RootFolder = "" }
    }
    
    Write-Log "Reading input file: $InputFile"
    
    $content = Get-Content $InputFile -Raw -Encoding UTF8
    if (-not $content) {
        Write-Log "Input file is empty" -Level "Error"
        return @{ Files = @(); RootFolder = "" }
    }
    
    Write-Log "Parsing file structure..."
    
    $files = @()
    $rootFolder = ""
    $lines = $content -split "`r?`n"
    $currentFile = $null
    $currentContent = @()
    $inFileContent = $false
    $separatorPattern = "^=+$"
    
    $rootFolderPattern = '^<<Naresh><Claud->Script->RootFolder>>:\s*(.+)$'
    $fileHeaderPattern = '^<<Naresh><Claud->Script->File>>:\s*\d+\.\s+(.+)$'
    
    foreach ($line in $lines) {
        if ($line -match $rootFolderPattern) {
            $rootFolder = $matches[1].Trim()
            if ($Verbose) { Write-Log "Found root folder: $rootFolder" }
            continue
        }
        if ($line -match $fileHeaderPattern) {
            if ($currentFile -and $currentContent.Count -gt 0) {
                $files += @{
                    Path = $currentFile
                    Content = ($currentContent -join "`n").Trim()
                }
            }
            $currentFile = $matches[1].Trim()
            $currentContent = @()
            $inFileContent = $false
            if ($Verbose) { Write-Log "Found file: $currentFile" }
        }
        elseif ($line -match $separatorPattern) {
            $inFileContent = $true
        }
        elseif ($inFileContent -and $currentFile) {
            $currentContent += $line
        }
    }
    if ($currentFile -and $currentContent.Count -gt 0) {
        $files += @{
            Path = $currentFile
            Content = ($currentContent -join "`n").Trim()
        }
    }
    
    return @{ Files = $files; RootFolder = $rootFolder }
}

function Normalize-FilePath {
    param([string]$Path, [string]$BaseDirectory)
    
    $normalized = $Path -replace '\\', '/'
    $normalized = $normalized.TrimStart('/')
    $relativePath = $normalized -replace '/', [System.IO.Path]::DirectorySeparatorChar
    return Join-Path $BaseDirectory $relativePath
}

try {
    Write-Log "Starting file recreation..."
    Write-Log "Input file: $InputFile"

    $parseResult = Parse-FileContent $InputFile
    $parsedFiles = $parseResult.Files
    $rootFolder = $parseResult.RootFolder

    if ($parsedFiles.Count -eq 0) {
        Write-Log "No files found in input file" -Level "Error"
        exit 1
    }
    if (-not $rootFolder) {
        Write-Log "Root folder not found, using default 'src'" -Level "Warning"
        $rootFolder = "src"
    }

    if (-not $PSBoundParameters.ContainsKey("OutputDirectory")) {
        $OutputDirectory = "$rootFolder"
        Write-Log "Using output directory from RootFolder: $OutputDirectory" -Level "Success"
    }
    else {
        Write-Log "Using provided output directory: $OutputDirectory" -Level "Success"
    }

    $currentDir = Get-Location
    if (-not [System.IO.Path]::IsPathRooted($OutputDirectory)) {
        $OutputDirectory = Join-Path $currentDir $OutputDirectory
    }
    Write-Log "Full output path: $OutputDirectory"

    if (Test-Path $OutputDirectory) {
        if (-not $Force) {
            Write-Log "Output directory already exists: $OutputDirectory" -Level "Warning"
            $choice = Read-Host "Continue and overwrite? (y/N)"
            if ($choice -notmatch '^[Yy]') { exit 0 }
        }
    }
    else {
        New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
        Write-Log "Created output directory: $OutputDirectory" -Level "Success"
    }

    $successCount = 0
    $errorCount = 0
    foreach ($fileInfo in $parsedFiles) {
        $fullPath = Normalize-FilePath $fileInfo.Path $OutputDirectory
        if (Write-FileContent -FilePath $fullPath -Content $fileInfo.Content) {
            $successCount++
        }
        else {
            $errorCount++
        }
    }

    Write-Log "============== SUMMARY ==============" -Level "Success"
    Write-Log "Total files: $($parsedFiles.Count)" -Level "Success"
    Write-Log "Created: $successCount" -Level "Success"
    Write-Log "Errors: $errorCount" -Level $(if ($errorCount -gt 0) { "Warning" } else { "Success" })
    Write-Log "Output directory: $OutputDirectory" -Level "Success"
}
catch {
    Write-Log "Unexpected error: $($_.Exception.Message)" -Level "Error"
    exit 1
}
