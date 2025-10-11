
import os
import subprocess
import sys

print(" STARTING MARINE DATA PIPELINE")
print("=" * 50)

scripts = [
    "1_clean_fish_data.py",
    "2_fetch_ocean.py",
    "3_eDna_sequence.py",
    "4_merge_dataset.py"
]

for script in scripts:
    print(f"\n RUNNING: {script}")
    print("-" * 40)

    try:
        result = subprocess.run(
            [sys.executable, script],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )

        print(result.stdout)
        if result.stderr:
            print("ERRORS:", result.stderr)

    except Exception as e:
        print(f" FAILED: {e}")

print("\n" + "=" * 50)
print(" PIPELINE COMPLETED!")
print(" Check data/processed/ for your final dataset")
