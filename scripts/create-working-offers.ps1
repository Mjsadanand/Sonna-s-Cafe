# Script to create banner offers with definitely past dates

$baseUrl = "http://localhost:3000"

# Create banner offers with clearly past validFrom dates
$bannerOffers = @(
    @{
        title = "Working Weekend Special!"
        description = "Get 25% off on all menu items this weekend"
        type = "banner"
        discountType = "percentage"
        discountValue = "25"
        minimumOrderAmount = "300"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = "2025-07-21T05:00:00.000Z"  # Definitely in the past
        validUntil = "2025-07-28T12:00:00.000Z"  # Future
        priority = 5
    },
    @{
        title = "Working Free Delivery!"
        description = "Free delivery on orders above ₹200"
        type = "banner"
        discountType = "free_delivery"
        discountValue = "0"
        minimumOrderAmount = "200"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = "2025-07-21T04:00:00.000Z"  # Definitely in the past
        validUntil = "2025-07-24T12:00:00.000Z"  # Future
        priority = 3
    }
)

foreach ($offer in $bannerOffers) {
    try {
        $json = $offer | ConvertTo-Json -Depth 10
        Write-Host "Creating $($offer.type) offer: $($offer.title)"
        Write-Host "  ValidFrom: $($offer.validFrom)"
        Write-Host "  ValidUntil: $($offer.validUntil)"
        
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

Write-Host "`nCurrent time check..."
$currentTime = Get-Date
Write-Host "Local time: $($currentTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))"
Write-Host "UTC time: $($currentTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))"

Write-Host "`nTesting simple debug API..."
try {
    $debugResponse = (Invoke-WebRequest -Uri "$baseUrl/api/offers/simple-debug" -Method GET).Content
    $debugResult = $debugResponse | ConvertFrom-Json
    Write-Host "Server time: $($debugResult.data.now)" -ForegroundColor Magenta
    Write-Host "Total banner offers: $($debugResult.data.totalBannerOffers)" -ForegroundColor Magenta
    Write-Host "Passing offers: $($debugResult.data.passingOffers)" -ForegroundColor Green
} catch {
    Write-Host "Error testing debug API: $($_.Exception.Message)" -ForegroundColor Red
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
