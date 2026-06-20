import json
import os

FILE_PATH = "/app/data/problems.json"

MANUAL_TEST_CASES = {
    "00_Intro_11": [{"input": "", "expected_output": "Hello  World.\nWe're using C++."}],
    "01_Expr_11": [{"input": "", "expected_output": "3.13296"}],
    "01_Expr_12": [
        {"input": "56\n173", "expected_output": "1.64046063991524\n1.63048681740224\n1.6321557478024"},
        {"input": "60\n170", "expected_output": "1.68325082306035\n1.68042831425886\n1.68633705687079"},
        {"input": "80.0\n150.0", "expected_output": "1.82574185835055\n1.86665761243954\n1.90070706076581"}
    ],
    "01_Expr_13": [
        {"input": "1.0\n-5.0\n6.0", "expected_output": "2 3"},
        {"input": "1.0\n-1\n-42", "expected_output": "-6 7"},
        {"input": "6\n-4.0\n-12", "expected_output": "-1.12 1.786"},
        {"input": "20.0\n-50.5\n-21.2", "expected_output": "-0.367 2.892"}
    ],
    "01_Expr_14": [
        {"input": "2567", "expected_output": "6"},
        {"input": "2566", "expected_output": "4"},
        {"input": "2557", "expected_output": "0"}
    ],
    "01_Expr_15": [
        {"input": "1", "expected_output": "0.111111"},
        {"input": "1.9", "expected_output": "0.314983"},
        {"input": "0.1", "expected_output": "0.036963"}
    ],
    "01_Expr_21": [
        {"input": "2 10 20\n4 0 0", "expected_output": "1:49:40"},
        {"input": "18 10 10\n19 0 0", "expected_output": "0:49:50"},
        {"input": "19 0 10\n18 0 0", "expected_output": "22:59:50"}
    ],
    "01_Expr_22": [
        {"input": "50 50 5 1 100 50", "expected_output": "54 50"},
        {"input": "50 50 5 1 50 20", "expected_output": "50 46"},
        {"input": "50 50 5 1 10 10", "expected_output": "47 47"},
        {"input": "50 50 5 1 20 20", "expected_output": "47 47"}
    ],
    "01_Str_11": [
        {"input": "123456789012", "expected_output": "1-2345-67890-12-1"},
        {"input": "310030011214", "expected_output": "3-1003-00112-14-2"},
        {"input": "110070234512", "expected_output": "1-1007-02345-12-9"}
    ],
    "01_Str_12": [
        {"input": "12/01/2562", "expected_output": "JAN 12, 2019"},
        {"input": "05/03/2566", "expected_output": "MAR 5, 2023"},
        {"input": "31/12/2563", "expected_output": "DEC 31, 2020"}
    ],
    "01_Str_31": [
        {"input": "7 0 0", "expected_output": "7 / 1"},
        {"input": "0 0 0", "expected_output": "0 / 1"},
        {"input": "0 5 0", "expected_output": "1 / 2"},
        {"input": "0 3 3", "expected_output": "1 / 3"},
        {"input": "0 08 3", "expected_output": "1 / 12"},
        {"input": "0 02 27", "expected_output": "1 / 44"},
        {"input": "123 456 789", "expected_output": "41111111 / 333000"},
        {"input": "987 987 987", "expected_output": "329000 / 333"}
    ],
    "02_If_11": [
        {"input": "Engineering", "expected_output": "Error"},
        {"input": "1", "expected_output": "Error"},
        {"input": "10", "expected_output": "Error"},
        {"input": "20000", "expected_output": "Error"},
        {"input": "58", "expected_output": "OK"},
        {"input": "01", "expected_output": "OK"}
    ],
    "02_If_12": [
        {"input": "99.99", "expected_output": "A"},
        {"input": "0.1", "expected_output": "F"}
    ],
    "02_If_13": [
        {"input": "9.84 9.30 9.42 9.58", "expected_output": "9.5"},
        {"input": "9.15 9.20 9.30 9.50", "expected_output": "9.25"},
        {"input": "9.15 9.23 9.30 9.50", "expected_output": "9.27"}
    ],
    "02_If_14": [
        {"input": "7039999921 2.8 B C C\n7030000021 3.5 B A A", "expected_output": "None"},
        {"input": "7039999921 2.8 A C C\n7030000021 3.5 B A A", "expected_output": "7039999921"},
        {"input": "7030000021 3.2 A A D\n7039999921 2.8 A C C", "expected_output": "7039999921"},
        {"input": "7039999921 3.1 A B B\n7030000021 3.0 A A A", "expected_output": "7039999921"},
        {"input": "7039999921 3.1 A B B\n7030000021 3.1 A C A", "expected_output": "7039999921"},
        {"input": "7039999921 3.1 A C A\n7030000021 3.1 A C C", "expected_output": "7039999921"},
        {"input": "7039999921 3.1 A C B\n7030000021 3.1 A C B", "expected_output": "Both"}
    ],
    "02_If_15": [
        {"input": "1112", "expected_output": "Not a mobile number"},
        {"input": "022153555", "expected_output": "Not a mobile number"},
        {"input": "0868144444", "expected_output": "Mobile number"},
        {"input": "0900999999", "expected_output": "Mobile number"},
        {"input": "0646664444", "expected_output": "Mobile number"},
        {"input": "0700100010", "expected_output": "Not a mobile number"}
    ],
    "02_If_16": [
        {"input": "12", "expected_output": "positive\neven"},
        {"input": "-35", "expected_output": "negative\nodd"},
        {"input": "0", "expected_output": "zero\neven"}
    ],
    "02_If_17": [
        {"input": "50", "expected_output": "18"},
        {"input": "300", "expected_output": "28"},
        {"input": "5000", "expected_output": "Reject"}
    ],
    "02_If_21": [
        {"input": "32", "expected_output": "32"},
        {"input": "8456", "expected_output": "8.5K"},
        {"input": "84560", "expected_output": "85K"},
        {"input": "108283", "expected_output": "108K"},
        {"input": "2293910", "expected_output": "2.3M"},
        {"input": "12999995", "expected_output": "13M"},
        {"input": "580912391", "expected_output": "581M"},
        {"input": "1301008191", "expected_output": "1.3B"},
        {"input": "25555555555", "expected_output": "26B"},
        {"input": "2555555555555", "expected_output": "2556B"}
    ],
    "02_If_22": [
        {"input": "1\n1\n2559", "expected_output": "1"},
        {"input": "31\n12\n2559", "expected_output": "366"},
        {"input": "5\n12\n2560", "expected_output": "339"},
        {"input": "31\n12\n2560", "expected_output": "365"}
    ],
    "03_Loop_24": [
        {"input": "XXXZZZZZZZZZZZZZZZZZZZZZZZZZZ", "expected_output": "X 3 Z 26"},
        {"input": "ABBA", "expected_output": "A 1 B 2 A 1"}
    ],
    "03_Loop_31": [
        {"input": "0 9", "expected_output": "10"},
        {"input": "1234567890 1234567890", "expected_output": "10"},
        {"input": "1234 56789012345678901", "expected_output": "954302098765426398"},
        {"input": "0 100000000000000000", "expected_output": "1688888888888888908"}
    ],
    "03_Loop_32": [
        {"input": "5\nK R\nR R Y\nR B P G\nR B R K Y B\nR B Y G N B P K Y", "expected_output": "WRONG_INPUT\nWRONG_INPUT\nWRONG_INPUT\nWRONG_INPUT\nWRONG_INPUT"},
        {"input": "6\nR\nR K R K R\nR B R\nR B R G\nR B R K Y\nR B R K Y G N B P K", "expected_output": "1\n17\n7\n10\n16\n41"}
    ],
    "03_Loop_33": [
        {"input": "-10 10\n20 -20\n-30 30\n-998", "expected_output": "-30 30"},
        {"input": "-10 10\n20 -20\n-30 30\n-999", "expected_output": "10 -10"}
    ],
    "03_Loop_FC_21": [
        {"input": "0.0", "expected_output": "1"},
        {"input": "0.7", "expected_output": "30"}
    ],
    "03_Loop_FC_22": [
        {"input": "152 91", "expected_output": "11 73"},
        {"input": "132 11", "expected_output": "10 20"},
        {"input": "40 30", "expected_output": "1610 10"},
        {"input": "431 3\n10 10 10\n1 12 1\n1 2 1\n1 2 -3", "expected_output": "431 4\n2 2 2\n3 3 9\n1 1 10\n0 0 -9\n3 -11 1"}
    ],
    "04_Array_32": [
        {"input": "4\n1 3 1\n2 1 8\n3 2 2\n4 12 3\n3\n5 9\n6 2\n3 2", "expected_output": ">> 2\n>> 4\n>> 1"},
        {"input": "4\n1 3 1\n2 2 8\n3 10 10\n4 12 6\n4\n1 6\n8 12\n11 15\n4 1", "expected_output": ">> 1\n>> 2\n>> 3\n>> 4"}
    ],
    "04_Array_FC_21": [
        {"input": "5\n1 2 3 4 5", "expected_output": "[1, 2, 3, 4, 5]"},
        {"input": "5\n5 4 3 2 1", "expected_output": "[1, 4, 3, 2, 5]"},
        {"input": "8\n9 2 7 1 6 8 4 5", "expected_output": "[2, 1, 4, 5, 6, 8, 7, 9]"}
    ],
    "05_String_11": [
        {"input": "Is!I s!ee!ee trees of gr!sk!een!!\nie@Red @so@r@fb@os@lu@es t@eA@oo@@\nnd%I see %cl%them bloom%%\nou$For$ds$ m$of$e$wh$ $it$an$eT$d$he$ you$$\nbr^An^ig^d^ht^ I think t^bl^o m^es^ys^se^elf^^\ndd%What%ay% a wond%Th%er%ed%ful wor%ar%ld%%", "expected_output": "I see trees of green\nRed roses too\nI see them bloom\nFor me and you\nAnd I think to myself\nWhat a wonderful world"}
    ],
    "05_String_12": [
        {"input": "9\n90\n900\n1\nEND", "expected_output": "1000"},
        {"input": "111111111111111111111111111111111111111\n999999999999999999999999999999999999999\n222222222222222222222222222222222222222\n888888888888888888888888888888888888888\n333333333333333333333333333333333333333\n777777777777777777777777777777777777777\n444444444444444444444444444444444444444\n666666666666666666666666666666666666666\n555555555555555555555555555555555555555\nEND", "expected_output": "4999999999999999999999999999999999999995"}
    ],
    "05_String_21": [
        {"input": "HappyNewYear2020", "expected_output": "Happy, New, Year, 2020"},
        {"input": "happyBirthDay2u", "expected_output": "happy, Birth, Day, 2, u"},
        {"input": "h20m10s15", "expected_output": "h, 20, m, 10, s, 15"},
        {"input": "ABBADancingQueen16August1976", "expected_output": "A, B, B, A, Dancing, Queen, 16, August, 1976"}
    ],
    "05_String_22": [
        {"input": "ACGGCGGCTGG\nGCGGAATGGCGTTTGCGAGAGCT", "expected_output": "-----ACGGCGGCTGG\nGCGGAATGGCGTTTGCGAGAGCT\n7"},
        {"input": "AACTAAAGATCG\nCAAAGTTCAACCC", "expected_output": "AACTAAAGATCG\n---CAAAGTTCAACCC\n6"},
        {"input": "AAAAAAAAAA\nAAAAAAA", "expected_output": "AAAAAAAAAA\nAAAAAAA\n7"},
        {"input": "AAAAAAAAA\nGGGGGG", "expected_output": "AAAAAAAAA\nGGGGGG\n0"}
    ],
    "05_String_23": [
        {"input": "0AA-000\n899", "expected_output": "0AA-899"},
        {"input": "2ZZ-998\n2", "expected_output": "3AA-000"},
        {"input": "8XY-900\n222", "expected_output": "8XZ-122"},
        {"input": "4XY-999\n3000000", "expected_output": "9JI-999"}
    ],
    "04_Array_11": [
        {"input": "000099999888765", "expected_output": "1,2,3,4"},
        {"input": "Arabic numerals are the ten digits: 0,1,2,3,4,5,6,7,8,9.", "expected_output": "None"}
    ],
    "06_Vector_12": [
        {"input": "18", "expected_output": "11->34->17->52->26->13->40->20->10->5->16->8->4->2->1"}
    ],
    "06_Vector_13": [
        {"input": "6/6/2566\n/", "expected_output": "(6)(6)(2566)"},
        {"input": "--Love-is-the---absence-of-judgment---\n-", "expected_output": "(Love)(is)(the)(absence)(of)(judgment)"},
        {"input": "There..is...no.mistake.in.  nature...\n.", "expected_output": "(There)(is)(no)(mistake)(in)(  nature)"}
    ],
    "06_Vector_14": [
        {"input": "1 2 3 9 4 5 6 7 8 0 10 11 14 12 99 98", "expected_output": "16\n0 1 2 3 4 5 6 7 8 9"},
        {"input": "1 9 1 9 1 9 1 9 1 9 1", "expected_output": "2\n1 9"}
    ],
    "06_Vector_21": [
        {"input": "akainu", "expected_output": "uk$aain"},
        {"input": "papaya", "expected_output": "aypp$aa"},
        {"input": "nananananananananan", "expected_output": "nnnnnnnnnnaaaaaaaaa$"},
        {"input": "nnnnnnnnnaaaaaaaaaa", "expected_output": "aaaaaaaaaannnnnnnnn$"}
    ]
}

def update():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        problems = json.load(f)
        
    updated = 0
    for p in problems:
        pid = p["id"]
        if pid in MANUAL_TEST_CASES:
            p["test_cases"] = MANUAL_TEST_CASES[pid]
            updated += 1
            
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)
        
    print(f"Updated {updated} problems with precise manual test cases.")

if __name__ == "__main__":
    update()
