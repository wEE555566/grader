import json
import fitz

def main():
    with open('backend/data/problems.json', encoding='utf-8') as f:
        problems = json.load(f)
    
    with open('info.txt', 'w', encoding='utf-8') as out:
        out.write("FIRST 5 PROBLEMS:\n")
        for p in problems[:5]:
            out.write(f"{p['id']}: {len(p['test_cases'])} cases\n")
        
        out.write("\nPROBLEMS WITH 5 TEST CASES:\n")
        for p in problems:
            if len(p['test_cases']) == 5:
                out.write(f"{p['id']}\n")
        
        out.write("\n=================================\n")
        for pid in [p['id'] for p in problems[:3]]:
            out.write(f"\nPDF TEXT FOR {pid}:\n")
            doc = fitz.open(f'backend/data/exams/{pid}.pdf')
            for page in doc:
                out.write(page.get_text() + "\n")

if __name__ == '__main__':
    main()
