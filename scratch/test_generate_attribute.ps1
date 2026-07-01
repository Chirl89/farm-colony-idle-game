# Simulate parsing weights.csv exactly like data-loader.js does
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

$headers = $headerLine -split $delimiter | ForEach-Object { $_.Trim().ToLower() }
$idxCategory = $headers.IndexOf("category")
$idxType = if ($headers.IndexOf("type") -ne -1) { $headers.IndexOf("type") } elseif ($headers.IndexOf("id") -ne -1) { $headers.IndexOf("id") } else { $headers.IndexOf("level") }
$idxYieldAmount = if ($headers.IndexOf("yield_amount") -ne -1) { $headers.IndexOf("yield_amount") }
    elseif ($headers.IndexOf("yield_pop") -ne -1) { $headers.IndexOf("yield_pop") }
    elseif ($headers.IndexOf("value") -ne -1) { $headers.IndexOf("value") }
    elseif ($headers.IndexOf("weight") -ne -1) { $headers.IndexOf("weight") }
    else { -1 }

$AttributeWeight = @{}
foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#") -or $trimmed -notmatch "[a-zA-Z0-9]") { continue }
    $columns = $trimmed -split $delimiter
    if ($columns.Count -lt 3) { continue }
    $category = $columns[$idxCategory]
    if ($category -eq "Category" -or $category.ToLower() -eq "category") { continue }
    
    if ($category.ToLower() -eq "attributeweight") {
        $type = $columns[$idxType]
        # Equivalent to (parseFloat(columns[idxYieldAmount]) || 0)
        $valStr = $columns[$idxYieldAmount]
        $valNum = 0.0
        if ([double]::TryParse($valStr, [ref]$valNum)) {
            # In JS: yield_amount = valNum || 0
            if ($valNum -eq 0.0) { $valNum = 0.0 }
        } else {
            $valNum = 0.0
        }
        $AttributeWeight[$type] = @{
            yield = $valNum
        }
    }
}

# Now simulate generateAttribute()
function GenerateAttribute {
    $weights = @{}
    # CONFIG.AttributeWeight check
    if ($AttributeWeight.Count -gt 0) {
        foreach ($key in $AttributeWeight.Keys) {
            $val = [int]$key
            # const w = CONFIG.AttributeWeight[key].yield || 0;
            $w = $AttributeWeight[$key].yield
            if ($w -gt 0) {
                $weights[$val] = $w
            }
        }
    } else {
        $weights = @{ 1 = 10; 2 = 20; 3 = 35; 4 = 30; 5 = 4; 6 = 1 }
    }

    $totalWeight = 0
    foreach ($key in $weights.Keys) {
        $totalWeight += $weights[$key]
    }

    if ($totalWeight -le 0) { return 3 }

    $r = ((Get-Random -Minimum 0 -Maximum 1000000) / 1000000) * $totalWeight
    $currentSum = 0
    $sortedKeys = $weights.Keys | Sort-Object
    foreach ($key in $sortedKeys) {
        $currentSum += $weights[$key]
        if ($r -le $currentSum) {
            return $key
        }
    }
    return 3
}

$results = @{ 1 = 0; 2 = 0; 3 = 0; 4 = 0; 5 = 0; 6 = 0; 7 = 0; 8 = 0; 9 = 0; 10 = 0 }
for ($i = 0; $i -lt 100000; $i++) {
    $res = GenerateAttribute
    $results[$res]++
}

Write-Host "Simulation of 100,000 generateAttribute() calls:"
foreach ($key in 1..10) {
    Write-Host "Level ${key}: $($results[$key]) times"
}
