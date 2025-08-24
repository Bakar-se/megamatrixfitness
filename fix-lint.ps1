Write-Host "🔧 Fixing linting and formatting issues..." -ForegroundColor Green

# Run ESLint with auto-fix
Write-Host "📝 Running ESLint auto-fix..." -ForegroundColor Yellow
npx eslint src --fix

# Run Prettier formatting
Write-Host "🎨 Running Prettier formatting..." -ForegroundColor Yellow
npx prettier --write .

# Run TypeScript check
Write-Host "🔍 Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "✅ All fixes completed!" -ForegroundColor Green
Write-Host "🚀 You can now try git push again!" -ForegroundColor Cyan
