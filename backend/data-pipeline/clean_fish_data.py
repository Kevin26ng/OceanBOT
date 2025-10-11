import pandas as pd
import os

print(" Cleaning fish species data...")

input_path = "../../Data/raw/fish_data.csv"
output_path = "../../Data/processed/cleaned_fish_data.csv"

# Create directories if needed
os.makedirs(os.path.dirname(input_path), exist_ok=True)
os.makedirs(os.path.dirname(output_path), exist_ok=True)

try:
    df = pd.read_csv(input_path)
    print(f" Loaded {len(df)} fish species")
except FileNotFoundError:
    print(f" File not found: {input_path}")
    print("Please place 'my_500_fish.csv' in data/raw/ folder")
    exit()

# Basic cleaning
df_clean = df.copy()
df_clean = df_clean.dropna()  # Remove empty rows
df_clean = df_clean.drop_duplicates()  # Remove duplicates

# Clean text columns
text_columns = ['species', 'family', 'genus', 'phylum', 'class']
for col in text_columns:
    if col in df_clean.columns:
        df_clean[col] = df_clean[col].str.strip().str.title()

# Save cleaned data
df_clean.to_csv(output_path, index=False)
print(f" Saved {len(df_clean)} cleaned species to {output_path}")
print(f"   Removed {len(df) - len(df_clean)} invalid entries")
