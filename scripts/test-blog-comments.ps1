# Blog Comment System - Integration Test Script
# Sprint 18 - Day 14
# Tests API integration and data flow

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Blog Comment System - Integration Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8080/api/v1"
$blogSlug = "test-post"
$adminToken = ""  # Set after login
$userToken = ""   # Set after login

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Helper function to make API calls
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = "",
        [object]$Body = $null,
        [string]$Description
    )
    
    $global:totalTests++
    Write-Host "Test $global:totalTests: $Description" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "✅ PASSED" -ForegroundColor Green
        $global:passedTests++
        return $response
        
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $global:failedTests++
        return $null
    }
    
    Write-Host ""
}

# Start tests
Write-Host "Starting integration tests..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# SECTION 1: Authentication
# ============================================
Write-Host "SECTION 1: Authentication Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 1: Admin Login
$adminLogin = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        email = "admin@marifetbul.com"
        password = "Admin123!"
    } `
    -Description "Admin user login"

if ($adminLogin) {
    $adminToken = $adminLogin.token
    Write-Host "Admin token obtained: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
}

# Test 2: Regular User Login
$userLogin = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        email = "user@test.com"
        password = "User123!"
    } `
    -Description "Regular user login"

if ($userLogin) {
    $userToken = $userLogin.token
    Write-Host "User token obtained: $($userToken.Substring(0, 20))..." -ForegroundColor Gray
}

Write-Host ""

# ============================================
# SECTION 2: Comment Submission
# ============================================
Write-Host "SECTION 2: Comment Submission Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 3: Submit valid comment
$newComment = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Token $userToken `
    -Body @{
        content = "Bu çok faydalı bir test yorumu!"
        parentId = $null
    } `
    -Description "Submit valid comment"

$commentId = $newComment.id

# Test 4: Submit reply to comment
$replyComment = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Token $userToken `
    -Body @{
        content = "Test yanıtı"
        parentId = $commentId
    } `
    -Description "Submit reply to comment"

# Test 5: Submit without authentication (should fail)
$unauthComment = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Body @{
        content = "Unauthorized test"
    } `
    -Description "Submit without auth (expect fail)"

Write-Host ""

# ============================================
# SECTION 3: Comment Retrieval
# ============================================
Write-Host "SECTION 3: Comment Retrieval Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 6: Get all comments for post
$allComments = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Description "Get all comments for post"

if ($allComments) {
    Write-Host "Retrieved $($allComments.totalElements) comments" -ForegroundColor Gray
}

# Test 7: Get comments with pagination
$paginatedComments = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/posts/$blogSlug/comments?page=0&size=10" `
    -Description "Get paginated comments"

Write-Host ""

# ============================================
# SECTION 4: Comment Editing
# ============================================
Write-Host "SECTION 4: Comment Edit Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 8: Update own comment
$updatedComment = Invoke-ApiTest `
    -Method "PUT" `
    -Endpoint "/blog/comments/$commentId" `
    -Token $userToken `
    -Body @{
        content = "Güncellenmiş test yorumu!"
    } `
    -Description "Update own comment"

# Test 9: Update someone else's comment (should fail)
$unauthorizedUpdate = Invoke-ApiTest `
    -Method "PUT" `
    -Endpoint "/blog/comments/$commentId" `
    -Token $adminToken `
    -Body @{
        content = "Unauthorized update"
    } `
    -Description "Update others comment (expect fail)"

Write-Host ""

# ============================================
# SECTION 5: Comment Reporting
# ============================================
Write-Host "SECTION 5: Comment Report Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 10: Report comment
$report = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/comments/$commentId/report" `
    -Token $adminToken `
    -Body @{
        reason = "SPAM"
        details = "Test spam report"
    } `
    -Description "Report comment as spam"

Write-Host ""

# ============================================
# SECTION 6: Admin Moderation
# ============================================
Write-Host "SECTION 6: Admin Moderation Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 11: Get moderation queue
$moderationQueue = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/comments/admin/moderation?status=PENDING" `
    -Token $adminToken `
    -Description "Get pending comments for moderation"

if ($moderationQueue) {
    Write-Host "Pending comments: $($moderationQueue.content.Count)" -ForegroundColor Gray
}

# Test 12: Approve comment
$approved = Invoke-ApiTest `
    -Method "PUT" `
    -Endpoint "/blog/comments/admin/$commentId/approve" `
    -Token $adminToken `
    -Description "Approve comment"

# Test 13: Reject comment with note
$rejected = Invoke-ApiTest `
    -Method "PUT" `
    -Endpoint "/blog/comments/admin/$commentId/reject" `
    -Token $adminToken `
    -Body @{
        reason = "INAPPROPRIATE_CONTENT"
        note = "Test rejection note"
    } `
    -Description "Reject comment with note"

# Test 14: Mark as spam
$spam = Invoke-ApiTest `
    -Method "PUT" `
    -Endpoint "/blog/comments/admin/$commentId/spam" `
    -Token $adminToken `
    -Description "Mark comment as spam"

Write-Host ""

# ============================================
# SECTION 7: Bulk Operations
# ============================================
Write-Host "SECTION 7: Bulk Operation Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Create multiple test comments for bulk operations
$bulkCommentIds = @()
for ($i = 1; $i -le 5; $i++) {
    $bulkComment = Invoke-ApiTest `
        -Method "POST" `
        -Endpoint "/blog/posts/$blogSlug/comments" `
        -Token $userToken `
        -Body @{
            content = "Bulk test comment $i"
        } `
        -Description "Create bulk test comment $i"
    
    if ($bulkComment) {
        $bulkCommentIds += $bulkComment.id
    }
}

# Test 15: Bulk approve
$bulkApproved = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/comments/admin/bulk-approve" `
    -Token $adminToken `
    -Body @{
        commentIds = $bulkCommentIds[0..2]
    } `
    -Description "Bulk approve 3 comments"

# Test 16: Bulk reject
$bulkRejected = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/comments/admin/bulk-reject" `
    -Token $adminToken `
    -Body @{
        commentIds = $bulkCommentIds[3..4]
        reason = "SPAM"
        note = "Bulk spam rejection"
    } `
    -Description "Bulk reject 2 comments"

Write-Host ""

# ============================================
# SECTION 8: Dashboard Statistics
# ============================================
Write-Host "SECTION 8: Dashboard Statistics Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 17: Get dashboard summary
$summary = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/comments/admin/summary" `
    -Token $adminToken `
    -Description "Get admin dashboard summary"

if ($summary) {
    Write-Host "Dashboard Stats:" -ForegroundColor Gray
    Write-Host "  Total: $($summary.total)" -ForegroundColor Gray
    Write-Host "  Pending: $($summary.pending)" -ForegroundColor Gray
    Write-Host "  Approved: $($summary.approved)" -ForegroundColor Gray
    Write-Host "  Rejected: $($summary.rejected)" -ForegroundColor Gray
    Write-Host "  Spam: $($summary.spam)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# SECTION 9: Cleanup
# ============================================
Write-Host "SECTION 9: Cleanup Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 18: Delete comment
$deleted = Invoke-ApiTest `
    -Method "DELETE" `
    -Endpoint "/blog/comments/$commentId" `
    -Token $userToken `
    -Description "Delete own comment"

# Test 19: Bulk delete
$bulkDeleted = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/comments/admin/bulk-delete" `
    -Token $adminToken `
    -Body @{
        commentIds = $bulkCommentIds
    } `
    -Description "Bulk delete test comments"

Write-Host ""

# ============================================
# SECTION 10: Edge Cases
# ============================================
Write-Host "SECTION 10: Edge Case Tests" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Magenta

# Test 20: Empty comment (should fail)
$emptyComment = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Token $userToken `
    -Body @{
        content = ""
    } `
    -Description "Submit empty comment (expect fail)"

# Test 21: Very long comment (should fail)
$longContent = "A" * 2001
$longComment = Invoke-ApiTest `
    -Method "POST" `
    -Endpoint "/blog/posts/$blogSlug/comments" `
    -Token $userToken `
    -Body @{
        content = $longContent
    } `
    -Description "Submit too long comment (expect fail)"

# Test 22: Non-existent comment ID (should fail)
$nonExistent = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/comments/99999" `
    -Description "Get non-existent comment (expect fail)"

# Test 23: Invalid filter status
$invalidFilter = Invoke-ApiTest `
    -Method "GET" `
    -Endpoint "/blog/comments/admin/moderation?status=INVALID" `
    -Token $adminToken `
    -Description "Use invalid filter status (expect fail)"

Write-Host ""

# ============================================
# TEST RESULTS SUMMARY
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests:  $totalTests" -ForegroundColor White
Write-Host "Passed:       $passedTests" -ForegroundColor Green
Write-Host "Failed:       $failedTests" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "System is ready for production." -ForegroundColor Green
} elseif ($successRate -ge 90) {
    Write-Host "✅ SYSTEM OPERATIONAL" -ForegroundColor Yellow
    Write-Host "Minor issues detected, review failed tests." -ForegroundColor Yellow
} else {
    Write-Host "⚠️  CRITICAL ISSUES DETECTED" -ForegroundColor Red
    Write-Host "System requires attention before deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Test execution completed." -ForegroundColor Cyan
Write-Host "Review the output above for detailed results." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
