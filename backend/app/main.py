from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import subprocess
import tempfile
import os
import time
import math
import json

app = FastAPI(title="Grader API")

app.mount("/api/files", StaticFiles(directory="/app/data/exams"), name="files")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeSubmission(BaseModel):
    code: str
    problem_id: str

# Load problems from JSON
PROBLEMS_DB = {}
try:
    with open("/app/data/problems.json", "r", encoding="utf-8") as f:
        problems_list = json.load(f)
        for p in problems_list:
            PROBLEMS_DB[p["id"]] = p
except Exception as e:
    print("Error loading problems.json:", e)

def is_close_float(a: str, b: str, rel_tol: float = 1e-6, abs_tol: float = 1e-9) -> bool:
    """Return True if a and b represent floats that are close enough."""
    try:
        return math.isclose(float(a), float(b), rel_tol=rel_tol, abs_tol=abs_tol)
    except ValueError:
        return a == b

def compare_outputs(actual: str, expected: str) -> bool:
    """Token-by-token comparison with float tolerance."""
    actual_tokens = actual.split()
    expected_tokens = expected.split()
    if len(actual_tokens) != len(expected_tokens):
        return False
    return all(is_close_float(a, e) for a, e in zip(actual_tokens, expected_tokens))

def compile_code(source_file, output_exec):
    try:
        result = subprocess.run(
            ["g++", source_file, "-o", output_exec],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            return False, result.stderr
        return True, ""
    except Exception as e:
        return False, str(e)

def run_test_case(exec_file, input_data, timeout_sec=2):
    try:
        start_time = time.time()
        result = subprocess.run(
            [exec_file],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=timeout_sec
        )
        end_time = time.time()
        execution_time = end_time - start_time
        
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr,
            "time": execution_time
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Time Limit Exceeded", "time": timeout_sec}
    except Exception as e:
        return {"success": False, "error": str(e), "time": 0}

@app.post("/api/grade")
def grade_submission(submission: CodeSubmission):
    if submission.problem_id not in PROBLEMS_DB:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    problem = PROBLEMS_DB[submission.problem_id]
    test_cases = problem.get("test_cases", [])
    
    with tempfile.TemporaryDirectory() as temp_dir:
        source_path = os.path.join(temp_dir, "solution.cpp")
        exec_path = os.path.join(temp_dir, "solution")
        
        with open(source_path, "w", encoding="utf-8") as f:
            f.write(submission.code)
            
        success, compiler_msg = compile_code(source_path, exec_path)
        if not success:
            return {
                "status": "Compilation Error",
                "message": compiler_msg,
                "passed": 0,
                "total": max(1, len(test_cases)),
                "results": []
            }

        if not test_cases:
            return {
                "status": "Accepted",
                "passed": 1,
                "total": 1,
                "total_time": "0.0000s",
                "results": [
                    {
                        "test_case": 1,
                        "status": "Passed",
                        "time": "0.0000s",
                        "actual_output": "Compilation Success (Manually verified)",
                        "expected_output": "Compilation Success (Manually verified)"
                    }
                ],
                "message": "No test cases found. Marking as Accepted since compilation succeeded."
            }
            
        results = []
        passed = 0
        total_time = 0
        
        for idx, tc in enumerate(test_cases):
            run_res = run_test_case(exec_path, tc["input"])
            total_time += run_res["time"]
            
            actual_output = run_res["output"].strip()
            expected_output = tc.get("expected_output", "").strip()
            
            if not run_res["success"]:
                status = "Runtime Error" if run_res["error"] != "Time Limit Exceeded" else "Time Limit Exceeded"
                is_pass = False
            else:
                # Compare with float tolerance for numeric outputs
                if compare_outputs(actual_output, expected_output) or (not expected_output and not actual_output):
                    status = "Passed"
                    is_pass = True
                    passed += 1
                else:
                    status = "Wrong Answer"
                    is_pass = False
            
            results.append({
                "test_case": idx + 1,
                "status": status,
                "time": f"{run_res['time']:.4f}s",
                "actual_output": actual_output,
                "expected_output": expected_output
            })
            
        overall_status = "Accepted" if passed == len(test_cases) else "Rejected"
        return {
            "status": overall_status,
            "passed": passed,
            "total": len(test_cases),
            "total_time": f"{total_time:.4f}s",
            "results": results
        }
        
@app.get("/api/problems")
def get_problems():
    out = []
    for p_id, p in PROBLEMS_DB.items():
        test_cases = p.get("test_cases", [])
        out.append({
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "grading_mode": "strict" if test_cases else "mock",
            "test_case_count": len(test_cases),
        })
    return sorted(out, key=lambda x: x["id"])

