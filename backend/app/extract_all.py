"""
Rebuild problems.json from PDF metadata + verified test cases.
Priority: MANUAL_TEST_CASES > EXTRACTED_TEST_CASES > coordinate auto-parse.
"""
import fitz
import glob
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("GRADER_DATA_DIR", os.path.join(SCRIPT_DIR, "..", "data"))
EXAMS_DIR = os.path.join(DATA_DIR, "exams")
OUTPUT_FILE = os.path.join(DATA_DIR, "problems.json")

sys.path.insert(0, SCRIPT_DIR)
from populate_db_manual import MANUAL_TEST_CASES  # noqa: E402
from pdf_test_cases import EXTRACTED_TEST_CASES  # noqa: E402

Y_TOLERANCE = 8
INPUT_MARK = re.compile(r"input|ข้อมูล.*เข้", re.I)
OUTPUT_MARK = re.compile(r"output|ข้อมูล.*ส่ง", re.I)
EXAMPLE_MARK = re.compile(r"ตัวอย่")


def extract_spans(pdf_path: str) -> list[tuple[float, float, str]]:
    doc = fitz.open(pdf_path)
    spans = []
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if text:
                        spans.append((span["bbox"][0], span["bbox"][1], text))
    return spans


def extract_metadata(spans: list[tuple[float, float, str]], problem_id: str) -> tuple[str, str]:
    lines = [t for _, _, t in spans]
    if not lines:
        return problem_id, ""
    title = lines[0]
    desc = []
    for line in lines[1:]:
        if INPUT_MARK.search(line) or EXAMPLE_MARK.search(line):
            break
        if "ข้อมูล" in line and ("เข้" in line or "ส่งออก" in line):
            break
        desc.append(line)
    return title, " ".join(desc)


def auto_parse_pairs(pdf_path: str) -> list[dict]:
    spans = extract_spans(pdf_path)
    in_x = [x for x, _, t in spans if t.lower() == "input" or INPUT_MARK.search(t)]
    out_x = [x for x, _, t in spans if t.lower() == "output" or OUTPUT_MARK.search(t)]
    if not in_x or not out_x:
        return []
    split = (min(in_x) + min(out_x)) / 2

    header_y = None
    for _, y, t in spans:
        if "input" in t.lower() and ("(" in t or "จาก" in t or t.lower() == "input"):
            header_y = y

    if header_y is None:
        return []

    rows = {}
    for x, y, t in spans:
        if y < header_y - 5:
            continue
        key = round(y / Y_TOLERANCE)
        rows.setdefault(key, {"left": [], "right": []})
        (rows[key]["left"] if x < split else rows[key]["right"]).append(t)

    cases = []
    past_header = False
    buf = []
    for key in sorted(rows.keys()):
        left = " ".join(rows[key]["left"]).strip()
        right = " ".join(rows[key]["right"]).strip()
        if not past_header:
            if "input" in left.lower() or "output" in right.lower() or EXAMPLE_MARK.search(left):
                past_header = True
            continue
        if not left and not right:
            continue
        if any(w in left + right for w in ("พยายาม", "จงเขียน", "หมายเหตุ")):
            break
        if right and x_filter(left):
            if buf:
                cases.append({"input": "\n".join(buf), "expected_output": right})
                buf = []
            elif left:
                cases.append({"input": left, "expected_output": right})
        elif left and x_filter(left):
            if right:
                cases.append({"input": left, "expected_output": right})
            else:
                buf.append(left)
    return cases


def x_filter(text: str) -> bool:
    if text.lower().startswith("input") or text.lower().startswith("output"):
        return False
    return True


def resolve_cases(problem_id: str, pdf_path: str) -> list[dict]:
    manual = MANUAL_TEST_CASES.get(problem_id)
    if manual is not None and len(manual) > 0:
        return manual
    if problem_id in EXTRACTED_TEST_CASES:
        return EXTRACTED_TEST_CASES[problem_id]
    auto = auto_parse_pairs(pdf_path)
    if auto:
        return auto
    return []


def main():
    pdfs = sorted(glob.glob(os.path.join(EXAMS_DIR, "*.pdf")))
    if not pdfs:
        print(f"No PDFs in {EXAMS_DIR}")
        sys.exit(1)

    problems = []
    for pdf in pdfs:
        pid = os.path.basename(pdf).replace(".pdf", "")
        spans = extract_spans(pdf)
        title, description = extract_metadata(spans, pid)
        test_cases = resolve_cases(pid, pdf)
        problems.append({
            "id": pid,
            "name": title,
            "description": description,
            "test_cases": test_cases,
        })
        src = (
            "manual" if MANUAL_TEST_CASES.get(pid)
            else "extracted" if pid in EXTRACTED_TEST_CASES
            else "auto"
        )
        print(f"{pid}: {len(test_cases)} cases [{src}]")

    problems.sort(key=lambda p: p["id"])
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)

    empty = [p["id"] for p in problems if not p["test_cases"]]
    print(f"\nSaved {len(problems)} problems")
    if empty:
        print("Missing test cases:", empty)
        sys.exit(1)


if __name__ == "__main__":
    main()
