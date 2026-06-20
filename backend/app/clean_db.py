import json

FILE_PATH = "/app/data/problems.json"

def clean():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        problems = json.load(f)
        
    for p in problems:
        # Wipe the garbage
        p["test_cases"] = []
        
        # Hardcode the known ones
        if p["id"] == "00_Intro_11":
            p["test_cases"] = [
                {
                    "input": "",
                    "expected_output": "Hello World.\nWe're using C++."
                }
            ]
        elif p["id"] == "01_Expr_12":
            p["test_cases"] = [
                {
                    "input": "56\n173",
                    "expected_output": "1.64046063991524\n1.63048681740224\n1.6321557478024"
                },
                {
                    "input": "60\n170",
                    "expected_output": "1.68325082306035\n1.68042831425886\n1.68633705687079"
                }
            ]
            
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)
        
    print("Cleaned up problems.json")

if __name__ == "__main__":
    clean()
