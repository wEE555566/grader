import fitz
import glob
import json
import os
import re

DATA_DIR = "/app/data/exams"
OUTPUT_FILE = "/app/data/problems.json"

def extract_testcases(text):
    # Try to find input/output blocks
    # This is a very rough heuristic.
    cases = []
    lines = text.split('\n')
    
    in_input = False
    in_output = False
    
    current_input = []
    current_output = []
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if 'input (' in line_lower or 'ข้อมูลนําเข้า' in line_lower or 'input' == line_lower.strip():
            if current_input or current_output:
                cases.append({
                    "input": "\n".join(current_input).strip(),
                    "expected_output": "\n".join(current_output).strip()
                })
                current_input = []
                current_output = []
            in_input = True
            in_output = False
            continue
        elif 'output (' in line_lower or 'ข้อมูลส่งออก' in line_lower or 'output' == line_lower.strip():
            in_input = False
            in_output = True
            continue
            
        if in_input and not in_output:
            if line.strip() and not line.strip().startswith('ตัวอย่าง'):
                current_input.append(line.strip())
        elif in_output and not in_input:
            if line.strip() and not line.strip().startswith('ตัวอย่าง'):
                current_output.append(line.strip())

    if current_input or current_output:
        cases.append({
            "input": "\n".join(current_input).strip(),
            "expected_output": "\n".join(current_output).strip()
        })
        
    return cases

def main():
    pdfs = glob.glob(f"{DATA_DIR}/*.pdf")
    problems = []
    
    for pdf in pdfs:
        doc = fitz.open(pdf)
        text = ""
        for page in doc:
            text += page.get_text()
            
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        if not lines:
            continue
            
        title = lines[0]
        problem_id = os.path.basename(pdf).replace(".pdf", "")
        
        desc_lines = []
        for line in lines[1:]:
            if "ข้อมูล" in line or "input" in line.lower() or "ตัวอย่าง" in line:
                break
            desc_lines.append(line)
        description = " ".join(desc_lines)
        
        test_cases = extract_testcases(text)
        
        # Fallback if empty
        if not test_cases:
            # Just add a dummy test case so it runs
            test_cases = [{"input": "dummy input", "expected_output": "dummy expected output"}]
            
        problems.append({
            "id": problem_id,
            "name": title,
            "description": description,
            "test_cases": test_cases
        })
        
    # Sort problems by ID
    problems.sort(key=lambda x: x["id"])
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)
        
    print(f"Parsed {len(problems)} problems with heuristic test cases.")

if __name__ == "__main__":
    main()
