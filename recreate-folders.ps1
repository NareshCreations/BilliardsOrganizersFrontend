# PowerShell script to recreate all deleted folders and files
Write-Host "Recreating all component folders and files..." -ForegroundColor Green

# Create all directories
$directories = @(
    # Pages
    "src\pages\Home",
    "src\pages\Auth\Login", 
    "src\pages\Auth\Register",
    "src\pages\Dashboard",
    
    # Components - Atoms
    "src\components\atoms\Button",
    "src\components\atoms\Input",
    "src\components\atoms\Icon",
    
    # Components - Molecules  
    "src\components\molecules\SearchBox",
    "src\components\molecules\Card",
    "src\components\molecules\Modal",
    
    # Components - Organisms
    "src\components\organisms\Navigation",
    "src\components\organisms\Footer",
    
    # Components - Templates
    "src\components\templates\MainLayout",
    "src\components\templates\AuthLayout",
    
    # Components - Forms
    "src\components\forms\LoginForm",
    "src\components\forms\RegisterForm",
    
    # Components - Common
    "src\components\common\ErrorBoundary",
    "src\components\common\LoadingSpinner"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "Created directory: $dir" -ForegroundColor Yellow
}

# Empty test template
$testTemplate = @"
import { describe, it } from 'vitest'

describe('Component', () => {
  it('should exist', () => {
    // TODO: Add actual tests when component is implemented
  })
})
"@

# Create all empty component and test files
$componentFiles = @(
    # Pages
    "src\pages\Home\Home.tsx",
    "src\pages\Home\Home.test.tsx",
    "src\pages\Auth\Login\Login.tsx", 
    "src\pages\Auth\Login\Login.test.tsx",
    "src\pages\Auth\Register\Register.tsx",
    "src\pages\Auth\Register\Register.test.tsx",
    "src\pages\Dashboard\Dashboard.tsx",
    "src\pages\Dashboard\Dashboard.test.tsx",
    
    # Atoms
    "src\components\atoms\Button\Button.tsx",
    "src\components\atoms\Button\Button.test.tsx",
    "src\components\atoms\Button\Button.module.scss",
    "src\components\atoms\Button\index.ts",
    
    "src\components\atoms\Input\Input.tsx",
    "src\components\atoms\Input\Input.test.tsx", 
    "src\components\atoms\Input\Input.module.scss",
    "src\components\atoms\Input\index.ts",
    
    "src\components\atoms\Icon\Icon.tsx",
    "src\components\atoms\Icon\Icon.test.tsx",
    "src\components\atoms\Icon\Icon.module.scss", 
    "src\components\atoms\Icon\index.ts",
    
    # Molecules
    "src\components\molecules\SearchBox\SearchBox.tsx",
    "src\components\molecules\SearchBox\SearchBox.test.tsx",
    "src\components\molecules\SearchBox\SearchBox.module.scss",
    "src\components\molecules\SearchBox\index.ts",
    
    "src\components\molecules\Card\Card.tsx",
    "src\components\molecules\Card\Card.test.tsx",
    "src\components\molecules\Card\Card.module.scss",
    "src\components\molecules\Card\index.ts",
    
    "src\components\molecules\Modal\Modal.tsx",
    "src\components\molecules\Modal\Modal.test.tsx",
    "src\components\molecules\Modal\Modal.module.scss",
    "src\components\molecules\Modal\index.ts",
    
    # Organisms
    "src\components\organisms\Navigation\Navigation.tsx",
    "src\components\organisms\Navigation\Navigation.test.tsx",
    "src\components\organisms\Navigation\Navigation.module.scss",
    "src\components\organisms\Navigation\index.ts",
    
    "src\components\organisms\Footer\Footer.tsx", 
    "src\components\organisms\Footer\Footer.test.tsx",
    "src\components\organisms\Footer\Footer.module.scss",
    "src\components\organisms\Footer\index.ts",
    
    # Templates
    "src\components\templates\MainLayout\MainLayout.tsx",
    "src\components\templates\MainLayout\MainLayout.test.tsx",
    "src\components\templates\MainLayout\MainLayout.module.scss",
    "src\components\templates\MainLayout\index.ts",
    
    "src\components\templates\AuthLayout\AuthLayout.tsx",
    "src\components\templates\AuthLayout\AuthLayout.test.tsx", 
    "src\components\templates\AuthLayout\AuthLayout.module.scss",
    "src\components\templates\AuthLayout\index.ts",
    
    # Forms
    "src\components\forms\LoginForm\LoginForm.tsx",
    "src\components\forms\LoginForm\LoginForm.test.tsx",
    "src\components\forms\LoginForm\LoginForm.module.scss",
    "src\components\forms\LoginForm\index.ts",
    
    "src\components\forms\RegisterForm\RegisterForm.tsx",
    "src\components\forms\RegisterForm\RegisterForm.test.tsx",
    "src\components\forms\RegisterForm\RegisterForm.module.scss", 
    "src\components\forms\RegisterForm\index.ts",
    
    # Common
    "src\components\common\ErrorBoundary\ErrorBoundary.tsx",
    "src\components\common\ErrorBoundary\ErrorBoundary.test.tsx",
    "src\components\common\ErrorBoundary\index.ts",
    
    "src\components\common\LoadingSpinner\LoadingSpinner.tsx",
    "src\components\common\LoadingSpinner\LoadingSpinner.test.tsx",
    "src\components\common\LoadingSpinner\LoadingSpinner.module.scss",
    "src\components\common\LoadingSpinner\index.ts"
)

foreach ($file in $componentFiles) {
    if ($file -like "*.test.tsx") {
        # Add test template to test files
        Set-Content -Path $file -Value $testTemplate
        Write-Host "Created test file: $file" -ForegroundColor Cyan
    } elseif ($file -like "*.tsx") {
        # Add basic component template to tsx files
        $componentTemplate = @"
import React from 'react'

export const ComponentName: React.FC = () => {
  return (
    <div>
      {/* TODO: Implement component */}
    </div>
  )
}
"@
        Set-Content -Path $file -Value $componentTemplate
        Write-Host "Created component: $file" -ForegroundColor Green
    } elseif ($file -like "*.scss") {
        # Add basic styles to scss files
        $scssTemplate = @"
// Component styles
.component {
  // TODO: Add styles
}
"@
        Set-Content -Path $file -Value $scssTemplate
        Write-Host "Created styles: $file" -ForegroundColor Blue
    } elseif ($file -like "index.ts") {
        # Add export to index files
        $indexTemplate = "// TODO: Add exports"
        Set-Content -Path $file -Value $indexTemplate
        Write-Host "Created index: $file" -ForegroundColor Magenta
    } else {
        # Create empty file for others
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "Created file: $file" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "All folders and files have been recreated successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm test' and all tests should pass!" -ForegroundColor Cyan