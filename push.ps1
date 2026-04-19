$remote = git remote

if (-not $remote) {
Write-Host "⚠ Nessun remote configurato!"
Write-Host "Inserisci URL della repo GitHub:"
$url = Read-Host

```
git remote add origin $url
git branch -M main
```

}

Write-Host "Vuoi fare commit + push? (Y/N)"
$answer = Read-Host

if ($answer -eq "Y" -or $answer -eq "y") {

```
Write-Host "Aggiungo file..."
git add .

Write-Host "Messaggio commit:"
$msg = Read-Host

git commit -m "$msg"

Write-Host "Push in corso..."
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Push fallito, forzo..."
    git push -f origin main
}

Write-Host "Fatto ✔"
```

}
else {
Write-Host "Operazione annullata"
}
