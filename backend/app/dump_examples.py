"""Dump detected I/O table rows for review."""
import fitz
import glob
import os
import re

EXAMS = os.environ.get(
    "GRADER_EXAMS",
    os.path.join(os.path.dirname(__file__), "..", "data", "exams"),
)

INPUT_MARK = re.compile(r"input|ข้อมูล.*เข้", re.I)
OUTPUT_MARK = re.compile(r"output|ข้อมูล.*ส่ง", re.I)
EXAMPLE_MARK = re.compile(r"ตัวอย่")


def dump_pdf(path):
    doc = fitz.open(path)
    spans = []
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                for s in line["spans"]:
                    t = s["text"].strip()
                    if t:
                        spans.append((s["bbox"][0], s["bbox"][1], t))

    in_x = [x for x, _, t in spans if t.lower() == "input" or INPUT_MARK.search(t)]
    out_x = [x for x, _, t in spans if t.lower() == "output" or OUTPUT_MARK.search(t)]
    split = (min(in_x) + min(out_x)) / 2 if in_x and out_x else 200

    rows = {}
    for x, y, t in spans:
        key = round(y / 8)
        rows.setdefault(key, {"y": y, "left": [], "right": []})
        (rows[key]["left"] if x < split else rows[key]["right"]).append((x, t))

    ordered = sorted(rows.values(), key=lambda r: r["y"])
    print(f"\n{'='*60}\n{os.path.basename(path)} split={split:.0f}")
    in_table = False
    for r in ordered:
        left = " ".join(t for _, t in sorted(r["left"]))
        right = " ".join(t for _, t in sorted(r["right"]))
        if EXAMPLE_MARK.search(left) or left.lower() == "input" or right.lower() == "output":
            in_table = True
            print(f"--- header y={r['y']:.0f} ---")
            continue
        if not in_table:
            continue
        if not left and not right:
            continue
        if any(w in left + right for w in ("พยายาม", "จงเขีย", "หมายเหตุ")):
            break
        print(f"L|{left}")
        print(f"R|{right}")


for pdf in sorted(glob.glob(os.path.join(EXAMS, "*.pdf"))):
    pid = os.path.basename(pdf).replace(".pdf", "")
    if pid.startswith(("00_", "01_", "02_If_1", "02_If_2", "03_Loop_2", "03_Loop_3", "03_Loop_FC", "04_Array_1", "04_Array_3", "04_Array_FC", "05_String_1", "05_String_2", "06_Vector_1", "06_Vector_2")):
        continue  # skip manual-covered prefixes partially
    dump_pdf(pdf)
