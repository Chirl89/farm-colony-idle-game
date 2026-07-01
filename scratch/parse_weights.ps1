$csvText = Get-Content -Path "C:\Users\EM2025007512\.gemini\antigravity\scratch\farm-colony-idle-game\src\data\weights.csv" -Raw
$lines = $csvText -split "`n"
$delimiter = ";"
$headerLine = ""
foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -and -not $trimmed.StartsWith("#") -and $trimmed -match "[a-zA-Z0-9]") {
        $headerLine = $trimmed
        break
    }
}

Write-Host "Header Line: $headerLine"
$headers = $headerLine -split $delimiter | ForEach-Object { $_.Trim().ToLower() }
$idxCategory = $headers.IndexOf("category")
$idxType = if ($headers.IndexOf("type") -ne -1) { $headers.IndexOf("type") } elseif ($headers.IndexOf("id") -ne -1) { $headers.IndexOf("id") } else { $headers.IndexOf("level") }
$idxYieldAmount = if ($headers.IndexOf("yield_amount") -ne -1) { $headers.IndexOf("yield_amount") }
    elseif ($headers.IndexOf("yield_pop") -ne -1) { $headers.IndexOf("yield_pop") }
    elseif ($headers.IndexOf("value") -ne -1) { $headers.IndexOf("value") }
    elseif ($headers.IndexOf("weight") -ne -1) { $headers.IndexOf("weight") }
    else { -1 }

Write-Host "idxCategory: $idxCategory, idxType: $idxType, idxYieldAmount: $idxYieldAmount"

$parsedConfig = @{}
foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#") -or $trimmed -notmatch "[a-zA-Z0-9]") { continue }
    $columns = $trimmed -split $delimiter
    if ($columns.Count -lt 3) { continue }
    $category = $columns[$idxCategory]
    if ($category -eq "Category" -or $category.ToLower() -eq "category") { continue }
    
    # Normalize
    if ($category.ToLower() -eq "attributeweight") { $category = "AttributeWeight" }
    
    $type = $columns[$idxType]
    $weightVal = if ($idxYieldAmount -ne -1) { [double]$columns[$idxYieldAmount] } else { 0 }
    
    if (-not $parsedConfig.Contains($category)) {
        $parsedConfig[$category] = @{}
    }
    $parsedConfig[$category][$type] = @{
        yield = $weightVal
    }
}

Write-Host "`nParsed AttributeWeight:"
foreach ($key in $parsedConfig["AttributeWeight"].Keys) {
    $val = $parsedConfig["AttributeWeight"][$key]
    Write-Host "${key}: yield = $($val.yield)"
}
