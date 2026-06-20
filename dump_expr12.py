import fitz

doc = fitz.open('backend/data/exams/01_Expr_12.pdf')
with open('01_expr_12.txt', 'w', encoding='utf-8') as f:
    for page in doc:
        f.write(repr(page.get_text()) + "\n")
