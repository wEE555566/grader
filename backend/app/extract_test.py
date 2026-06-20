import fitz
import sys
import os

pdf_path = sys.argv[1]
if not os.path.exists(pdf_path):
    print(f"File not found: {pdf_path}")
    sys.exit(1)

doc = fitz.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()

print(f"--- Text from {pdf_path} ---")
print(text)
