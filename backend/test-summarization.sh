#!/bin/bash

echo "🧪 Testing MetroDocs Summarization System"
echo "=========================================="

# Step 1: Login
echo "Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@metro-docs.com","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token extracted: ${TOKEN:0:20}..."

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful!"

# Step 2: Upload document
echo -e "\nStep 2: Uploading test document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Metro Safety Inspection Report",
    "text": "The metro system requires comprehensive safety inspections across all stations. Track maintenance is critical for passenger safety. Electrical systems need regular testing and calibration. Emergency procedures must be updated and staff training completed by end of month. Signal systems require immediate attention due to recent malfunctions."
  }')

echo "Upload response: $UPLOAD_RESPONSE"

# Extract document ID
DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"documentId":[0-9]*' | cut -d':' -f2)
echo "Document ID: $DOC_ID"

if [ -z "$DOC_ID" ]; then
  echo "❌ Document upload failed!"
  exit 1
fi

echo "✅ Document uploaded successfully!"

# Step 3: Process document
echo -e "\nStep 3: Processing document for summarization..."
PROCESS_RESPONSE=$(curl -s -X POST http://localhost:3000/documents/$DOC_ID/process \
  -H "Authorization: Bearer $TOKEN")

echo "Processing response: $PROCESS_RESPONSE"

if echo "$PROCESS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Document processed successfully!"
else
  echo "❌ Document processing failed!"
  exit 1
fi

# Step 4: Get summary
echo -e "\nStep 4: Retrieving document summary..."
SUMMARY_RESPONSE=$(curl -s -X GET http://localhost:3000/documents/$DOC_ID/summary \
  -H "Authorization: Bearer $TOKEN")

echo "Summary response: $SUMMARY_RESPONSE"

if echo "$SUMMARY_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Summary retrieved successfully!"
else
  echo "❌ Summary retrieval failed!"
fi

# Step 5: List all summaries
echo -e "\nStep 5: Listing all summaries..."
SUMMARIES_RESPONSE=$(curl -s -X GET http://localhost:3000/documents/summaries/all \
  -H "Authorization: Bearer $TOKEN")

echo "Summaries response: $SUMMARIES_RESPONSE"

if echo "$SUMMARIES_RESPONSE" | grep -q '"success":true'; then
  echo "✅ All summaries listed successfully!"
else
  echo "❌ Failed to list summaries!"
fi

echo -e "\n🎉 Summarization testing completed!"
echo "=========================================="
