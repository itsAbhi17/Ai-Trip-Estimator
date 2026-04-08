import jsbeautifier

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to remove lines 33 to 214 (0-indexed 32 to 213)
del lines[32:215]

with open('app.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
