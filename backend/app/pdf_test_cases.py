# Auto-extracted / verified test cases for problems not covered by MANUAL_TEST_CASES.
# Source: PDF two-column example tables (Google Drive grader set).

EXTRACTED_TEST_CASES = {
    "01_Expr_11": [{"input": "", "expected_output": "3.13296"}],
    "02_If_31": [
        {"input": "1 1 2559 1 1 2560", "expected_output": "366 -0.52 0.43 0.54"},
        {"input": "1 1 2560 1 1 2561", "expected_output": "365 -0.73 0.22 0.37"},
        {"input": "20 11 2540 10 2 2544", "expected_output": "1177 0.89 0.22 -0.87"},
        {"input": "10 8 2541 27 10 2559", "expected_output": "6649 0.52 0.22 0.1"},
    ],
    "03_Loop_11": [
        {"input": "10\n20\n30\n41.5\n-1", "expected_output": "25.38"},
        {"input": "10\n20\n-1", "expected_output": "15"},
        {"input": "-1", "expected_output": "No Data"},
    ],
    "03_Loop_22": [
        {"input": "200", "expected_output": "2*2*2*5*5"},
        {"input": "3298402", "expected_output": "2*29*29*37*53"},
        {"input": "1137740897", "expected_output": "2659*427883"},
        {"input": "1234567890", "expected_output": "2*3*3*5*3607*3803"},
    ],
    "02_If_FC_11": [
        {"input": "1\n2\n3\n4\n5", "expected_output": "3"},
        {"input": "40\n30\n20\n50\n10", "expected_output": "30"},
        {"input": "10\n10\n10\n10\n10", "expected_output": "10"},
        {"input": "0\n-1\n-2\n2\n1", "expected_output": "0"},
    ],
    "02_If_FC_21": [
        {"input": "1 2 3 4", "expected_output": "1 4 3 4"},
        {"input": "4 3 2 1", "expected_output": "3 9 5 1"},
        {"input": "2 2 2 2", "expected_output": "2 4 2 2"},
        {"input": "9 0 9 0", "expected_output": "0 9 9 0"},
        {"input": "3 2 1 4", "expected_output": "2 7 1 4"},
    ],
    "02_If_FC_22": [
        {"input": "1 1 2560", "expected_output": "16/1/2560"},
        {"input": "31 12 2560", "expected_output": "15/1/2561"},
        {"input": "28 2 2559", "expected_output": "14/3/2559"},
        {"input": "28 2 2560", "expected_output": "15/3/2560"},
    ],
    "03_Loop_12": [
        {"input": "1", "expected_output": "2.91038e-11"},
        {"input": "100", "expected_output": "2"},
        {"input": "250.0", "expected_output": "2.39794"},
        {"input": "500.0", "expected_output": "2.69897"},
    ],
    "03_Loop_13": [
        {"input": "the", "expected_output": "2"},
        {"input": "The word \"the\" is one of the most common words in English.\nSadet", "expected_output": "2"},
        {"input": "\"Phra Sadet\" tham \"Phra Sadet\" wa ja sadet rue mai sadet.", "expected_output": "2"},
    ],
    "03_Loop_14": [
        {"input": "AAABC", "expected_output": "3"},
        {"input": "AABCC\nAAAAAAAAAAAAAAAAAAAAAAA", "expected_output": "0"},
        {"input": "BBBXXBBBBB BBBBB BBBBBB\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAA", "expected_output": "Incomplete answer"},
    ],
    "03_Loop_15": [
        {"input": "[[a + (b + [c / d] – e) + f] + 4]", "expected_output": "((a + [b + (c / d) – e] + f) + 4)"},
        {"input": "no parentheses", "expected_output": "no parentheses"},
    ],
    "03_Loop_16": [
        {"input": "2", "expected_output": ".*\n***"},
        {"input": "3", "expected_output": "..*\n.*.*\n*****"},
        {"input": "8", "expected_output": ".......*\n......*.*\n.....*...*\n....*.....*\n...*.......*\n..*.........*\n.*...........*\n***************"},
    ],
    "03_Loop_21": [
        {"input": "ABCdd65", "expected_output": ">> invalid"},
        {"input": "You're_kidding!", "expected_output": ">> invalid"},
        {"input": "yes_no_ok_999", "expected_output": ">> invalid"},
        {"input": "YES_NO_OK_123", "expected_output": ">> invalid"},
        {"input": "Eng104**", "expected_output": ">> weak"},
        {"input": "HappyNewYear2023", "expected_output": ">> weak"},
        {"input": "John-Wick--4", "expected_output": ">> strong"},
        {"input": "++**Eng--104*++", "expected_output": ">> strong"},
    ],
    "03_Loop_23": [
        {"input": "abbcccddddcccbba\n2\naa", "expected_output": "aa"},
        {"input": "abbcccddddcccbba\n3\nabbbba", "expected_output": "abbbba"},
        {"input": "abbcccddddcccbba\n4\nabbccccccbba", "expected_output": "abbccccccbba"},
        {"input": "abbcccddddcccbba\n5\nabbcccddddcccbba", "expected_output": "abbcccddddcccbba"},
    ],
    "04_Array_12": [
        {"input": "4\nJohn\nJim\nDon\nDebbie", "expected_output": "Jack\nJames\nNot found\nDeborah"},
    ],
    "04_Array_13": [
        {"input": "9\n1 2 3 4 5 6 7 8 9", "expected_output": "0"},
        {"input": "12\n1 1 1 1 1 1 9 1 1 1 1 1", "expected_output": "1"},
        {"input": "11\n1 9 1 9 1 9 1 9 1 9 1", "expected_output": "5"},
    ],
    "04_Array_14": [
        {
            "input": "4 4\n3 3 3 3\n3 3 3 3\n3 3 3 3\n3 3 3 3",
            "expected_output": "3 3\n3 3",
        },
        {
            "input": "5 8\n1.5 2 3 4 5 6 7 8\n8.5 7 6 5 4 3 2 1\n2.5 2 2 2 2 2 2 2\n3.5 3 3 3 3 3 3 3\n2.5 2 2 2 2 2 2 2.5",
            "expected_output": "3.83 3.67 3.67 3.67 3.67 3.67\n4.17 3.67 3.33 3 2.67 2.33\n2.5 2.33 2.33 2.33 2.33 2.39",
        },
    ],
    "04_Array_21": [
        {"input": "4\n1 8 7 9", "expected_output": "1\n1.125\n1.122807018\n1.122840691"},
        {"input": "14\n1 1 1 1 1 1 1 1 1 1 1 1 1 1", "expected_output": "1\n2\n1.5\n1.666666667\n1.6\n1.625\n1.615384615\n1.619047619\n1.617647059\n1.618181818\n1.617977528\n1.618055556\n1.618025751\n1.618037135"},
    ],
    "04_Array_22": [
        {"input": "4\nA J Q 10\nC", "expected_output": "Q 10 A J"},
        {"input": "4\nA J Q 10\nCS", "expected_output": "Q A 10 J"},
        {"input": "4\nA J Q 10\nCSC", "expected_output": "10 J Q A"},
        {"input": "4\nA J Q 10\nCSCSX", "expected_output": "10 Q J A"},
    ],
    "04_Array_23": [
        {
            "input": "4\nTH 300\nFR 2500\nUK 2800\nJP 3500\nNRT-JP LHR-UK DMK-TH CNX-TH BKK-TH PAR-FR BKK-TH",
            "expected_output": "5900",
        },
        {
            "input": "4\nTH 300\nFR 2500\nUK 2800\nJP 3500\nDMK-TH CNX-TH",
            "expected_output": "0",
        },
    ],
    "04_Array_24": [
        {
            "input": "5\n3 1 2 5 4",
            "expected_output": "3 1 2 5 4\n5 2 1 3 4\n4 3 1 2 5\n2 1 3 4 5\n1 2 3 4 5",
        },
        {
            "input": "6\n10 20 30 40 50 60",
            "expected_output": "10 20 30 40 50 60",
        },
    ],
    "04_Array_25": [
        {"input": "5\n1 1 1 1 1", "expected_output": "0"},
        {"input": "10\n1 2 3 4 5 6 7 8 9 10", "expected_output": "0"},
        {"input": "3\n5 1 5", "expected_output": "4"},
        {"input": "3\n5 1 10", "expected_output": "4"},
        {"input": "5\n1 10 1 5 1", "expected_output": "4"},
        {"input": "14\n10 5 4 3 2 1 2 3 4 5 6 7 8 9", "expected_output": "58"},
        {"input": "14\n1 4 2 5 1 1 4 2 3 1 6 4 5 1", "expected_output": "21"},
    ],
    "04_Array_26": [
        {"input": "3\n1 2 0\n3 5 6\n4 7 8", "expected_output": "YES"},
        {"input": "3\n1 2 0\n3 6 5\n4 7 8", "expected_output": "NO"},
        {"input": "4\n1  2  5  6\n7 10  9 11\n0  8  4 12\n15 13 14  3", "expected_output": "YES"},
        {"input": "4\n1  2  6  5\n7 10  9 11\n0  8  4 12\n15 13 14  3", "expected_output": "NO"},
    ],
    "04_Array_27": [
        {"input": "3\n-10 10\n20 -20\n-30 30", "expected_output": "Zig-Zag\n-30 30"},
        {"input": "3\n-10 10\n20 -20\n-30 30", "expected_output": "Zag-Zig\n10 -10"},
    ],  # same input, different zig/zag start in problem
    "04_Array_28": [
        {
            "input": "Happy BirthDay 2 You",
            "expected_output": "a -> 2\nb -> 1\nd -> 1\nh -> 2\ni -> 1\no -> 1\np -> 2\nr -> 1\nt -> 1\nu -> 1\ny -> 3",
        },
    ],
    "04_Array_29": [
        {
            "input": "4\n2 4 6 6\n1 3 3 5\n1 1 3 2\n2 0 4 3",
            "expected_output": "Max overlapping area = 1\nrectangles 0 and 1\nrectangles 2 and 3",
        },
        {
            "input": "4\n5 5 6 6\n4 4 7 7\n3 3 8 8\n2 2 9 9",
            "expected_output": "Max overlapping area = 25\nrectangles 2 and 3",
        },
        {
            "input": "4\n3 2 8 10\n3 2 8 10\n3 2 8 10\n3 2 8 10",
            "expected_output": "Max overlapping area = 40\nrectangles 0 and 1\nrectangles 0 and 2\nrectangles 0 and 3\nrectangles 1 and 2\nrectangles 1 and 3\nrectangles 2 and 3",
        },
        {
            "input": "3\n15 22 33 49\n40 67 100 120\n-10 -9 2 4",
            "expected_output": "No overlaps",
        },
    ],
    "04_Array_31": [
        {"input": "0", "expected_output": "zero"},
        {"input": "9012", "expected_output": "nine thousand twelve"},
        {"input": "4003002001", "expected_output": "four billion three million two thousand one"},
        {
            "input": "1234567890",
            "expected_output": "one billion two hundred thirty four million\nfive hundred sixty seven thousand eight\nhundred ninety",
        },
        {
            "input": "999999999999999",
            "expected_output": "nine hundred ninety nine trillion nine\nhundred ninety nine billion nine hundred\nninety nine million nine hundred ninety\nnine thousand nine hundred ninety nine",
        },
    ],
    "05_String_24": [
        {"input": "mee ther khon deaw", "expected_output": "meaw ther khon dee"},
        {"input": "mow mai khub", "expected_output": "mub mai khow"},
        {"input": "lun took wove", "expected_output": "love took wun"},
        {"input": "kho hai tam dai na ja", "expected_output": "kha hai tam dai na jo"},
    ],
    "05_String_25": [
        {"input": "2 0", "expected_output": ">> 1"},
        {"input": "2 1", "expected_output": ">> 2"},
        {"input": "2 2", "expected_output": ">> 4"},
        {"input": "2 3", "expected_output": ">> 8"},
        {"input": "2 4", "expected_output": ">> 6"},
        {"input": "2 5", "expected_output": ">> 2"},
        {"input": "0 2039840298340980809823049809", "expected_output": ">> 0"},
        {"input": "2039493 3094209883204", "expected_output": ">> 1"},
        {"input": "932840734098203480820498 9384029834098209384098234234234", "expected_output": ">> 4"},
    ],
    "05_String_31": [
        {"input": "Filet-O-Fish\nE 1,2,1,3,2", "expected_output": "MIdTeRm-eXaM-MiDteRM-exaM-miDTeRm-ExaM-mID"},
        {"input": "Filet-O-Fish\nE 2,4,3,2,4", "expected_output": "MIdTeRm-eXAm-miDteRM-eXaM-miDTErm-ExaM-MId"},
        {"input": "Filet-O-Fish\nE 2,3,2,1,1", "expected_output": "MIdTeRm-eXAm-miDteRM-eXaM-miDTerm-ExaM-mID"},
        {"input": "Filet-O-Fish\nE 2,3,2,3,4", "expected_output": "1,2,1,3,2"},
        {"input": "Filet-O-Fish\nD MIDteRm-eXAm-MiDteRM-ExaM-miDTerm-ExaM-MiD", "expected_output": "2,4,3,2,4"},
        {"input": "Filet-O-Fish\nD MIdTeRm-eXaM-MiDteRM-exaM-miDTeRm-ExaM-mID", "expected_output": "2,3,2,1,1"},
        {"input": "Filet-O-Fish\nD MIdTeRm-eXAm-miDteRM-eXaM-miDTErm-ExaM-MId", "expected_output": "2,3,2,3,4"},
        {"input": "Filet-O-Fish\nD MIdTeRm-eXAm-miDteRM-eXaM-miDTerm-ExaM-mID", "expected_output": "2,3,2,3,4"},
    ],
    "06_Vector_11": [
        {"input": "4\n1\n2\n3\n4\n11 12 13 14 15\n21\n22\n23\n24\n25\n-1", "expected_output": "[25, 23, 21, 14, 12, 4, 2, 1, 3, 11, 13, 15, 22, 24]"},
        {"input": "0\n1 2 3 4 5 6\n-1", "expected_output": "[6, 4, 2, 1, 3, 5]"},
        {"input": "6\n1\n2\n3\n4\n5\n6\n-1", "expected_output": "[6, 4, 2, 1, 3, 5]"},
        {"input": "0\n1\n2\n3\n4\n5\n6\n-1", "expected_output": "[6, 4, 2, 1, 3, 5]"},
        {"input": "0\n1\n2\n3\n4\n5\n6\n-1\n-1", "expected_output": "[]"},
    ],
}
