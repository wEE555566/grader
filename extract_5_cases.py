import fitz

def main():
    with open('5_cases_pdf.txt', 'w', encoding='utf-8') as out:
        for p in ['02_If_FC_11', '02_If_FC_21', '04_Array_31', '06_Vector_11']:
            out.write(f"\n--- {p} ---\n")
            doc = fitz.open(f'backend/data/exams/{p}.pdf')
            for page in doc:
                out.write(page.get_text() + "\n")

if __name__ == '__main__':
    main()
