#!/bin/bash

# Generate images for PayPilot landing page using Nano Banana (Gemini Image API)
GEMINI_API_KEY="AIzaSyA8m90_nSfknrxDuOEyiiZXbmDxrw3HZqk"
OUTPUT_DIR="../public/images"

mkdir -p "$OUTPUT_DIR"

# Function to generate image
generate_image() {
  local prompt="$1"
  local filename="$2"

  echo "Generating: $filename"

  response=$(curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"contents\": [{
        \"parts\": [
          {\"text\": \"$prompt\"}
        ]
      }],
      \"generationConfig\": {
        \"responseModalities\": [\"image\", \"text\"]
      }
    }")

  # Extract base64 image data and save
  echo "$response" | python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
try:
    for part in data['candidates'][0]['content']['parts']:
        if 'inlineData' in part:
            img_data = base64.b64decode(part['inlineData']['data'])
            with open('$OUTPUT_DIR/$filename', 'wb') as f:
                f.write(img_data)
            print('Saved: $filename')
            break
except Exception as e:
    print(f'Error: {e}')
    print(data)
"
}

# Generate hero dashboard image
generate_image "A clean, modern HR dashboard interface showing payroll analytics, employee data visualization, and time tracking. Use a professional green color scheme with forest green (#3A7139) accents on a light stone (#F5F5F4) background. Minimal design, no gradients, flat UI style. 16:9 aspect ratio. Premium SaaS product screenshot." "hero-dashboard.png"

# Generate payroll illustration
generate_image "A minimalist illustration of automated payroll processing. Show a simple calculator with money symbols, flowing into organized payment slips. Use forest green (#3A7139) as the primary color on cream/stone background. Flat design, no gradients, clean lines. Modern fintech style." "payroll-illustration.png"

# Generate team/HR illustration
generate_image "A minimalist flat illustration showing a diverse team of professionals in a modern office setting. Abstract geometric people figures. Use forest green (#3A7139) accents on light stone background. Clean, modern, minimal SaaS style. No gradients." "team-illustration.png"

echo "Done generating images!"
