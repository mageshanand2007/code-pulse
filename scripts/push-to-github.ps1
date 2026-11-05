# PowerShell script to create and push CodePulse to GitHub
param (
    [Parameter(Mandatory=$false)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken
)

if (-not $Username) {
    $Username = Read-Host "Enter your GitHub username"
}

$repoName = "CodePulse"
Write-Host "Target repository: https://github.com/$Username/$repoName" -ForegroundColor Cyan

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if (-not $existingRemote) {
    git remote add origin "https://github.com/$Username/$repoName.git"
    Write-Host "Added git remote 'origin' -> https://github.com/$Username/$repoName.git" -ForegroundColor Green
} else {
    git remote set-url origin "https://github.com/$Username/$repoName.git"
    Write-Host "Updated git remote 'origin' -> https://github.com/$Username/$repoName.git" -ForegroundColor Green
}

# If GitHubToken is provided, try creating repository via REST API
if ($GitHubToken) {
    Write-Host "Creating public GitHub repository '$repoName' via GitHub REST API..." -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "token $GitHubToken"
        "Accept"        = "application/vnd.github.v3+json"
        "User-Agent"    = "CodePulse-Setup"
    }
    $body = @{
        name        = $repoName
        description = "CodePulse – GitHub Repository Health Monitor with 100-point scoring, secret detection, commit telemetry, and Groq AI recommendations."
        private     = $false
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body
        Write-Host "Repository '$repoName' created successfully on GitHub!" -ForegroundColor Green
    } catch {
        Write-Host "Note: Repository might already exist on your GitHub account ($($_.Exception.Message))" -ForegroundColor Yellow
    }
}

Write-Host "Pushing branch 'main' to origin..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed CodePulse to https://github.com/$Username/$repoName" -ForegroundColor Green
} else {
    Write-Host "Push completed or requires authentication in your browser/Git Credential Manager." -ForegroundColor Yellow
}
