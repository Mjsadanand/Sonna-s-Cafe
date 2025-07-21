# Script to create banner offers with correct dates

$baseUrl = "http://localhost:3000"

# Create banner offers with past validFrom dates
$bannerOffers = @(
    @{
        title = "Fresh Weekend Special!"
        description = "Get 25% off on all menu items this weekend"
        type = "banner"
        discountType = "percentage"
        discountValue = "25"
        minimumOrderAmount = "300"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")  # 1 hour ago
        validUntil = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")   # 7 days from now
        priority = 5
    },
    @{
        title = "Fresh Free Delivery Day!"
        description = "Free delivery on orders above ₹200"
        type = "banner"
        discountType = "free_delivery"
        discountValue = "0"
        minimumOrderAmount = "200"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = (Get-Date).AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")  # 2 hours ago
        validUntil = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")   # 3 days from now
        priority = 3
    },
    @{
        title = "Fresh Menu Launch Special!"
        description = "Try our new menu items with 15% off!"
        type = "banner"
        discountType = "percentage"
        discountValue = "15"
        minimumOrderAmount = "250"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = (Get-Date).AddHours(-3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")  # 3 hours ago
        validUntil = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")   # 5 days from now
        priority = 4
    }
)

foreach ($offer in $bannerOffers) {
    try {
        $json = $offer | ConvertTo-Json -Depth 10
        Write-Host "Creating $($offer.type) offer: $($offer.title)"
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/offers" -Method POST -Body $json -ContentType "application/json"
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.success) {
            Write-Host "Created successfully - ID: $($result.data.id)" -ForegroundColor Green
        } else {
            Write-Host "Failed: $($result.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error creating $($offer.title): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTesting banner API..."
try {
    $bannerResponse = Invoke-WebRequest -Uri "$baseUrl/api/offers?type=banner" -Headers @{"x-session-id"="test-session-123"}
    $bannerResult = $bannerResponse.Content | ConvertFrom-Json
    Write-Host "Banner API Response: $($bannerResult.data.Count) offers found" -ForegroundColor Yellow
    foreach ($banner in $bannerResult.data) {
        Write-Host "  - $($banner.title) (Target: $($banner.targetAudience))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error testing banner API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting debug API..."
try {
    $debugResponse = Invoke-WebRequest -Uri "$baseUrl/api/offers/debug?type=banner"
    $debugResult = $debugResponse.Content | ConvertFrom-Json
    Write-Host "Debug counts: All=$($debugResult.data.debug.counts.all), Active=$($debugResult.data.debug.counts.active), DateFiltered=$($debugResult.data.debug.counts.dateFiltered), TypeFiltered=$($debugResult.data.debug.counts.typeFiltered), Final=$($debugResult.data.debug.counts.final)" -ForegroundColor Magenta
} catch {
    Write-Host "Error testing debug API: $($_.Exception.Message)" -ForegroundColor Red
}
