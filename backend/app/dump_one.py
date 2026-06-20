import fitz
import sys
import os

DATA_DIR = "/app/data/exams"

def dump(pdf_name):
    path = f"{DATA_DIR}/{pdf_name}"
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    print("\n".join(lines))

if __name__ == "__main__":
    dump(sys.argv[1])
