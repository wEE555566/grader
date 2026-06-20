import httpx
import asyncio

LLM_URL = "https://touda.abdul.in.th/completions"

async def test():
    text = """
1.0 
-5.0 
6.0 
2 3 
1.0 
-1 
-42 
-6 7 
6 
-4.0 
-12 
-1.12 1.786 
20.0 
-50.5 
-21.2 
-0.367 2.892 
    """
    prompt = f"""
You are a data extractor. Extract the test cases from the given text.
The text contains interleaved inputs and outputs.
Format your response exactly like this:
[TEST CASE]
INPUT:
line 1
line 2
EXPECTED:
line 3
[TEST CASE]
...

Here is the text:
{text}
"""
    payload = {
        "prompt": prompt,
        "temperature": 0.1,
        "max_tokens": 1000
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(LLM_URL, json=payload, timeout=60.0)
        print(res.json()["choices"][0]["text"])

asyncio.run(test())
