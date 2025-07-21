# Test script to create banner offers via API

$baseUrl = "http://localhost:3000"

# Create banner offers
$bannerOffers = @(
    @{
        title = "Weekend Special!"
        description = "Get 25% off on all menu items this weekend"
        type = "banner"
        discountType = "percentage"
        discountValue = "25"
        minimumOrderAmount = "300"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        validUntil = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        priority = 5
    },
    @{
        title = "Free Delivery Day!"
        description = "Free delivery on orders above ₹200"
        type = "banner"
        discountType = "free_delivery"
        discountValue = "0"
        minimumOrderAmount = "200"
        targetAudience = "all"
        occasionType = "regular"
        validFrom = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        validUntil = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        priority = 3
    },
    @{
        title = "Birthday Special!"
        description = "Special birthday discount - 30% off!"
        type = "banner"
        discountType = "percentage"
        discountValue = "30"
        minimumOrderAmount = "500"
        targetAudience = "birthday"
        occasionType = "birthday"
        validFrom = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        validUntil = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        priority = 8
    }
)

# Create popup offers
$popupOffers = @(
    @{
        title = "Limited Time Offer!"
        description = "Get 20% off your first order"
        type = "popup"
        discountType = "percentage"
        discountValue = "20"
        minimumOrderAmount = "250"
        targetAudience = "new_customers"
        occasionType = "regular"
        validFrom = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        validUntil = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        priority = 7
        popupDelaySeconds = 3
        showFrequencyHours = 2
    }
)

$allOffers = $bannerOffers + $popupOffers

foreach ($offer in $allOffers) {
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
        Write-Host "  - $($banner.title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error testing banner API: $($_.Exception.Message)" -ForegroundColor Red
}
