import asyncio
import httpx
import fitz
import os
import json
import glob
import re

DATA_DIR = "/app/data/exams"
OUTPUT_FILE = "/app/data/problems.json"
LLM_URL = "https://touda.abdul.in.th/completions"

async def parse_pdf(pdf_path, client, semaphore):
    async with semaphore:
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            if not lines:
                return None
            
            title = lines[0]
            problem_id = os.path.basename(pdf_path).replace(".pdf", "")
            
            # Simple heuristic for description
            desc_lines = []
            for line in lines[1:]:
                if "ข้อมูล" in line or "input" in line.lower() or "ตัวอย่าง" in line:
                    break
                desc_lines.append(line)
            description = " ".join(desc_lines)
            
            # Prompt the LLM to extract test cases
            prompt = f"""
You are a parser. Extract the test cases from the following competitive programming problem text.
Return ONLY a valid JSON array of objects. Each object must have "input" (string) and "expected_output" (string).
If there is no input, use an empty string "".
Do not output any markdown formatting, only the JSON array.

Text:
{text[-1500:]}
"""
            payload = {
                "prompt": prompt,
                "temperature": 0.1,
                "max_tokens": 1000
            }
            
            resp = await client.post(LLM_URL, json=payload, timeout=30.0)
            result = resp.json()["choices"][0]["text"].strip()
            
            # Clean JSON
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
                
            try:
                test_cases = json.loads(result)
                if not isinstance(test_cases, list):
                    test_cases = []
            except Exception:
                test_cases = []
                
            print(f"Processed {problem_id}: {len(test_cases)} test cases found.")
            
            return {
                "id": problem_id,
                "name": title,
                "description": description,
                "test_cases": test_cases
            }
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
            return {
                "id": os.path.basename(pdf_path).replace(".pdf", ""),
                "name": os.path.basename(pdf_path).replace(".pdf", ""),
                "description": "Error parsing.",
                "test_cases": []
            }

async def main():
    pdfs = glob.glob(f"{DATA_DIR}/*.pdf")
    print(f"Found {len(pdfs)} PDFs.")
    
    semaphore = asyncio.Semaphore(10) # 10 concurrent requests
    
    async with httpx.AsyncClient() as client:
        tasks = [parse_pdf(pdf, client, semaphore) for pdf in pdfs]
        results = await asyncio.gather(*tasks)
        
    problems = [r for r in results if r]
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)
        
    print(f"Saved {len(problems)} problems to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
