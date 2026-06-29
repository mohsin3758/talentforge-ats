#!/bin/bash
# Run all Playwright tests and capture results
cd /home/z/my-project

echo "Starting Playwright tests at $(date)"
echo "================================"

# Run tests with list reporter, capture to file
bunx playwright test --reporter=list 2>&1 | tee /tmp/pw-output.log

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "================================"
echo "Finished at $(date)"
echo "Exit code: $EXIT_CODE"

# Extract summary
echo ""
echo "=== SUMMARY ==="
grep -E "✓|✘|passed|failed" /tmp/pw-output.log | tail -40

exit $EXIT_CODE
