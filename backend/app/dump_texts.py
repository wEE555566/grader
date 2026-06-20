import fitz
import glob
import os

DATA_DIR = "/app/data/exams"

def dump_first_n():
    pdfs = sorted(glob.glob(f"{DATA_DIR}/*.pdf"))
    
    for pdf in pdfs[20:]:
        doc = fitz.open(pdf)
        text = ""
        for page in doc:
            text += page.get_text()
            
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        print(f"========== {os.path.basename(pdf)} ==========")
        print("\n".join(lines[-60:]))
        print("==========================================\n")

if __name__ == "__main__":
    dump_first_n()
