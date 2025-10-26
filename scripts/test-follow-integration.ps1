# ================================================
# FOLLOW SYSTEM INTEGRATION TEST
# ================================================
# Test script for User Follow/Unfollow functionality
# Tests all 4 REST API endpoints with realistic scenarios
#
# @author MarifetBul Development Team
# @version 1.0.0
# @since 2025-10-26

param(
    [string]$BaseUrl = "http://localhost:8080/api/v1",
    [string]$Token = ""
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "FOLLOW SYSTEM INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to make authenticated API calls
function Invoke-AuthenticatedRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Token,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -Body ($Body | ConvertTo-Json) -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -ErrorAction Stop
        }
        return $response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Get initial follow status
Write-Host "[TEST 1] Get Follow Status" -ForegroundColor Yellow
Write-Host "GET $BaseUrl/users/{userId}/follow-status" -ForegroundColor Gray
$userId = "test-user-id-123"  # Replace with actual user ID
$statusResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$BaseUrl/users/$userId/follow-status" -Token $Token

if ($statusResponse) {
    Write-Host "✓ Success:" -ForegroundColor Green
    Write-Host "  - Is Following: $($statusResponse.data.isFollowing)" -ForegroundColor White
    Write-Host "  - Follower Count: $($statusResponse.data.followerCount)" -ForegroundColor White
    Write-Host "  - Following Count: $($statusResponse.data.followingCount)" -ForegroundColor White
    Write-Host "  - Mutual Follow: $($statusResponse.data.isMutualFollow)" -ForegroundColor White
} else {
    Write-Host "✗ Failed to get follow status" -ForegroundColor Red
}
Write-Host ""

# Test 2: Follow a user (toggle from not following to following)
Write-Host "[TEST 2] Follow User (Toggle)" -ForegroundColor Yellow
Write-Host "POST $BaseUrl/users/{userId}/follow" -ForegroundColor Gray
$followResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$BaseUrl/users/$userId/follow" -Token $Token

if ($followResponse) {
    Write-Host "✓ Success:" -ForegroundColor Green
    Write-Host "  - Is Following: $($followResponse.data.isFollowing)" -ForegroundColor White
    Write-Host "  - Follower Count: $($followResponse.data.followerCount)" -ForegroundColor White
    Write-Host "  - Following Count: $($followResponse.data.followingCount)" -ForegroundColor White
    
    if ($followResponse.data.isFollowing -eq $true) {
        Write-Host "  ✓ User is now being followed" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Failed to follow user" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get followers list
Write-Host "[TEST 3] Get Followers List" -ForegroundColor Yellow
Write-Host "GET $BaseUrl/users/{userId}/followers?page=0&size=20" -ForegroundColor Gray
$followersResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$BaseUrl/users/$userId/followers?page=0&size=20" -Token $Token

if ($followersResponse) {
    Write-Host "✓ Success:" -ForegroundColor Green
    Write-Host "  - Total Followers: $($followersResponse.pagination.total)" -ForegroundColor White
    Write-Host "  - Current Page: $($followersResponse.pagination.page)" -ForegroundColor White
    Write-Host "  - Page Size: $($followersResponse.pagination.limit)" -ForegroundColor White
    Write-Host "  - Total Pages: $($followersResponse.pagination.totalPages)" -ForegroundColor White
    
    if ($followersResponse.data.Count -gt 0) {
        Write-Host "  - First Follower: $($followersResponse.data[0].username)" -ForegroundColor White
    }
} else {
    Write-Host "✗ Failed to get followers list" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get following list
Write-Host "[TEST 4] Get Following List" -ForegroundColor Yellow
Write-Host "GET $BaseUrl/users/{userId}/following?page=0&size=20" -ForegroundColor Gray
$followingResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$BaseUrl/users/$userId/following?page=0&size=20" -Token $Token

if ($followingResponse) {
    Write-Host "✓ Success:" -ForegroundColor Green
    Write-Host "  - Total Following: $($followingResponse.pagination.total)" -ForegroundColor White
    Write-Host "  - Current Page: $($followingResponse.pagination.page)" -ForegroundColor White
    Write-Host "  - Page Size: $($followingResponse.pagination.limit)" -ForegroundColor White
    Write-Host "  - Total Pages: $($followingResponse.pagination.totalPages)" -ForegroundColor White
    
    if ($followingResponse.data.Count -gt 0) {
        Write-Host "  - First Following: $($followingResponse.data[0].username)" -ForegroundColor White
    }
} else {
    Write-Host "✗ Failed to get following list" -ForegroundColor Red
}
Write-Host ""

# Test 5: Unfollow (toggle back)
Write-Host "[TEST 5] Unfollow User (Toggle Back)" -ForegroundColor Yellow
Write-Host "POST $BaseUrl/users/{userId}/follow" -ForegroundColor Gray
$unfollowResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$BaseUrl/users/$userId/follow" -Token $Token

if ($unfollowResponse) {
    Write-Host "✓ Success:" -ForegroundColor Green
    Write-Host "  - Is Following: $($unfollowResponse.data.isFollowing)" -ForegroundColor White
    Write-Host "  - Follower Count: $($unfollowResponse.data.followerCount)" -ForegroundColor White
    
    if ($unfollowResponse.data.isFollowing -eq $false) {
        Write-Host "  ✓ User is no longer being followed" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Failed to unfollow user" -ForegroundColor Red
}
Write-Host ""

# Test 6: Verify self-follow prevention
Write-Host "[TEST 6] Self-Follow Prevention Test" -ForegroundColor Yellow
Write-Host "POST $BaseUrl/users/{currentUserId}/follow (should fail)" -ForegroundColor Gray
Write-Host "This test should be run manually by attempting to follow your own profile" -ForegroundColor Cyan
Write-Host ""

# Test Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Completed Tests:" -ForegroundColor White
Write-Host "  1. Get Follow Status" -ForegroundColor White
Write-Host "  2. Follow User (Toggle)" -ForegroundColor White
Write-Host "  3. Get Followers List (Paginated)" -ForegroundColor White
Write-Host "  4. Get Following List (Paginated)" -ForegroundColor White
Write-Host "  5. Unfollow User (Toggle)" -ForegroundColor White
Write-Host ""
Write-Host "Manual Tests Required:" -ForegroundColor Yellow
Write-Host "  - Self-follow prevention (attempt to follow yourself)" -ForegroundColor White
Write-Host "  - Concurrent follow/unfollow operations" -ForegroundColor White
Write-Host "  - Pagination with large datasets (>20 items)" -ForegroundColor White
Write-Host "  - Follow notification creation (when integrated)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: cd marifetbul-backend && ./mvnw spring-boot:run" -ForegroundColor White
Write-Host "  2. Get auth token from login endpoint" -ForegroundColor White
Write-Host "  3. Run this script with token: .\test-follow-integration.ps1 -Token 'your-jwt-token'" -ForegroundColor White
Write-Host "  4. Test frontend UI manually" -ForegroundColor White
Write-Host ""
