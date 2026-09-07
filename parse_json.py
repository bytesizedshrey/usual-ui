import json
import os

source_file = "/Users/shreyashgajbhiye/.gemini/antigravity/brain/2f6b067b-91a7-46a4-9391-e1f8dc1859e5/.system_generated/steps/37/content.md"

with open(source_file, "r") as f:
    content = f.read()

# Extract the JSON part
json_start = content.find("{")
json_str = content[json_start:]

data = json.loads(json_str)

required_files = [
    "src/shaders/structure-flow/StructureFlowCollection.tsx",
    "src/shaders/structure-flow/StructureFlowBackground.tsx",
    "src/shaders/structure-flow/structureFlowRenderer.ts",
    "src/shaders/structure-flow/three128.d.ts",
    "src/shaders/threeui.css"
]

for file_info in data.get("files", []):
    path = file_info.get("path")
    code = file_info.get("code")
    
    if path in required_files:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(code)
        print(f"Wrote {path}")

# Create index.ts for alias
with open("src/shaders/index.ts", "w") as f:
    f.write("export { StructureFlowCollection } from './structure-flow/StructureFlowCollection';\n")
print("Wrote src/shaders/index.ts")

