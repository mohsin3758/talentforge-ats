#!/bin/bash
# Test auth flow in browser — improved version with proper ref handling
set -e

cd /home/z/my-project
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "=== Starting dev server ==="
nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
SERVER_PID=$!

for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "✓ Server ready"
    break
  fi
  sleep 1
done

echo ""
echo "=== TEST 1: Login page renders ==="
agent-browser open http://localhost:3000/login 2>&1 | tail -1
sleep 4
agent-browser screenshot /home/z/my-project/download/auth-login-page.png 2>&1 | tail -1

# Get all interactive elements
SNAPSHOT=$(agent-browser snapshot -i -c 2>&1)
echo "Login page elements:"
echo "$SNAPSHOT" | grep -E "(textbox|button)" | head -8

echo ""
echo "=== TEST 2: Login with admin credentials ==="
# Fill email (ref e5 from snapshot)
agent-browser fill @e5 "admin@talentforge.com" 2>&1 | tail -1
# Fill password (ref e6)
agent-browser fill @e6 "Admin123!" 2>&1 | tail -1
# Click Sign in (ref e2)
agent-browser click @e2 2>&1 | tail -1
sleep 6

# Check where we ended up
URL=$(agent-browser get url 2>&1 | tail -1)
echo "URL after login: $URL"

agent-browser screenshot /home/z/my-project/download/auth-after-login.png 2>&1 | tail -1

# Check if we're back on the main app (not login page)
if echo "$URL" | grep -q "localhost:3000/$"; then
  echo "✓ Login successful — redirected to main app"
  
  # Check for user menu in Topbar
  echo ""
  echo "=== Checking Topbar for user menu ==="
  agent-browser snapshot -i -c 2>&1 | grep -iE "(admin|sign out|Admin Recruiter|avatar)" | head -5
  
  # Click the user menu to see sign out
  echo ""
  echo "=== Opening user menu ==="
  # Find the user menu button (contains "Admin")
  USER_BTN=$(agent-browser snapshot -i -c 2>&1 | grep -i "admin" | grep "button" | head -1 | grep -oP '@\w+' | head -1)
  if [ -n "$USER_BTN" ]; then
    agent-browser click $USER_BTN 2>&1 | tail -1
    sleep 2
    agent-browser screenshot /home/z/my-project/download/auth-user-menu.png 2>&1 | tail -1
    agent-browser snapshot -i -c 2>&1 | grep -iE "(sign out|sign out)" | head -3
  else
    echo "User menu button not found — checking snapshot"
    agent-browser snapshot -i -c 2>&1 | head -20
  fi
else
  echo "✗ Login may have failed — still on login page"
  agent-browser screenshot /home/z/my-project/download/auth-login-failed.png 2>&1 | tail -1
fi

echo ""
echo "=== TEST 3: Register a new user ==="
agent-browser open http://localhost:3000/login 2>&1 | tail -1
sleep 3

# Click Sign up to switch to register mode
agent-browser click @e3 2>&1 | tail -1
sleep 2

agent-browser screenshot /home/z/my-project/download/auth-register-page.png 2>&1 | tail -1
echo "Register page elements:"
agent-browser snapshot -i -c 2>&1 | grep -E "(textbox|button)" | head -8

# Get fresh refs after switching to register mode
SNAPSHOT=$(agent-browser snapshot -i -c 2>&1)
NAME_REF=$(echo "$SNAPSHOT" | grep -i "full name\|name" | grep "textbox" | head -1 | grep -oP '@\w+' | head -1)
EMAIL_REF=$(echo "$SNAPSHOT" | grep -i "email" | grep "textbox" | head -1 | grep -oP '@\w+' | head -1)
PASS_REF=$(echo "$SNAPSHOT" | grep -i "password" | grep "textbox" | head -1 | grep -oP '@\w+' | head -1)
SUBMIT_REF=$(echo "$SNAPSHOT" | grep -i "create account" | grep -oP '@\w+' | head -1)

echo "Name ref: $NAME_REF, Email ref: $EMAIL_REF, Pass ref: $PASS_REF, Submit ref: $SUBMIT_REF"

if [ -n "$NAME_REF" ] && [ -n "$EMAIL_REF" ] && [ -n "$PASS_REF" ] && [ -n "$SUBMIT_REF" ]; then
  agent-browser fill $NAME_REF "Browser Test User" 2>&1 | tail -1
  agent-browser fill $EMAIL_REF "browsertest2@example.com" 2>&1 | tail -1
  agent-browser fill $PASS_REF "BrowserTest123!" 2>&1 | tail -1
  agent-browser click $SUBMIT_REF 2>&1 | tail -1
  sleep 6
  
  URL=$(agent-browser get url 2>&1 | tail -1)
  echo "URL after register: $URL"
  
  agent-browser screenshot /home/z/my-project/download/auth-after-register.png 2>&1 | tail -1
  
  if echo "$URL" | grep -q "localhost:3000/$"; then
    echo "✓ Registration successful — redirected to main app"
    # Check if the new user is logged in
    agent-browser snapshot -i -c 2>&1 | grep -iE "(browser test|sign out|browsertest)" | head -3
  else
    echo "✗ Registration may have failed"
  fi
fi

echo ""
echo "=== Cleanup ==="
agent-browser close 2>&1 | tail -1
kill $SERVER_PID 2>/dev/null
echo "Done"
