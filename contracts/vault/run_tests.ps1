# Script para ejecutar todos los tests sin #[should_panic]
# Los tests 03-06 tienen #[should_panic] y causan problemas en Windows

$tests = @(
    "test_01_create_vault_basic_success",
    "test_02_create_multiple_vaults_different_amounts",
    "test_07_withdraw_after_unlock_time",
    "test_08_withdraw_exact_unlock_time",
    "test_09_withdraw_multiple_vaults",
    "test_10_early_withdraw_with_five_percent_penalty",
    "test_11_early_withdraw_with_ten_percent_penalty",
    "test_12_early_withdraw_multiple_vaults",
    "test_13_early_withdraw_returns_correct_amounts",
    "test_14_early_withdraw_penalty_goes_to_pool",
    "test_15_get_vault_returns_correct_data",
    "test_16_get_nonexistent_vault_returns_none",
    "test_17_get_vault_count_increments",
    "test_18_unlock_time_calculated_correctly",
    "test_19_vault_locked_until_exact_time",
    "test_20_early_withdraw_calculation_precision",
    "test_21_vault_becomes_inactive_after_withdraw",
    "test_22_vault_becomes_inactive_after_early_withdraw",
    "test_23_vault_with_minimum_amount",
    "test_24_vault_with_maximum_reasonable_amount",
    "test_25_vault_with_minimum_lock_duration",
    "test_26_vault_with_maximum_lock_duration",
    "test_27_create_many_vaults_scalability",
    "test_28_early_withdraw_with_large_amount",
    "test_29_early_withdraw_with_small_amount",
    "test_30_multiple_operations_sequence"
)

$passed = 0
$failed = 0
$failedTests = @()

Write-Host "Ejecutando $($tests.Count) tests..." -ForegroundColor Cyan
Write-Host ""

foreach ($test in $tests) {
    Write-Host "Ejecutando: $test..." -NoNewline
    $result = cargo test $test 2>&1 | Out-String
    
    if ($LASTEXITCODE -eq 0 -and $result -match "test result: ok") {
        Write-Host " OK PASSED" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " X FAILED" -ForegroundColor Red
        $failed++
        $failedTests += $test
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumen de Tests:" -ForegroundColor Cyan
Write-Host "  Pasados: $passed / $($tests.Count)" -ForegroundColor Green
$failedColor = if ($failed -eq 0) { "Green" } else { "Red" }
Write-Host "  Fallidos: $failed / $($tests.Count)" -ForegroundColor $failedColor

if ($failedTests.Count -gt 0) {
    Write-Host ""
    Write-Host "Tests fallidos:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "  - $test" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
