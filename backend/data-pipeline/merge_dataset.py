import pandas as pd
import numpy as np
import os

print(" Merging Fish + Ocean + eDNA Data...")
print("=" * 60)

# File paths
fish_path = "../../Data/processed/cleaned_fish_data.csv"
ocean_path = "../../Data/processed/ocean_data_india.csv"
edna_path = "../../Data/processed/real_edna_data.csv"
output_path = "../../Data/processed/final_merged_dataset.csv"

# Check if required files exist
for path, name in [(fish_path, "fish"), (ocean_path, "ocean"), (edna_path, "eDNA")]:
    if not os.path.exists(path):
        print(f" Run previous scripts first! {name} data not found: {path}")
        exit()

# Load all datasets
print(" Loading all datasets...")
df_fish = pd.read_csv(fish_path)
df_ocean = pd.read_csv(ocean_path)
df_edna = pd.read_csv(edna_path)

print(f" Fish data: {len(df_fish)} species")
print(f" Ocean data: {len(df_ocean)} data points")
print(f" eDNA data: {len(df_edna)} sequences")

# Find species column names
species_columns = {}
for df, name in [(df_fish, 'fish'), (df_edna, 'edna')]:
    for col in ['species', 'scientificName', 'originalScientificName', 'name', 'Species']:
        if col in df.columns:
            species_columns[name] = col
            print(f" Found species column in {name}: '{col}'")
            break

if 'fish' not in species_columns:
    print(" Could not find species column in fish data. Available columns:")
    print(df_fish.columns.tolist())
    exit()

if 'edna' not in species_columns:
    print(" Could not find species column in eDNA data. Available columns:")
    print(df_edna.columns.tolist())
    exit()

fish_species_col = species_columns['fish']
edna_species_col = species_columns['edna']

print(
    f" Matching using: Fish['{fish_species_col}'] ↔ eDNA['{edna_species_col}']")

# Create the final dataframe
final_df = df_fish.copy()

# Add ocean parameters
print("\n Adding ocean parameters...")
for i, fish_row in final_df.iterrows():
    if i < len(df_ocean):
        ocean_row = df_ocean.iloc[i]
        final_df.loc[i, 'temperature'] = ocean_row.get('temperature', np.nan)
        final_df.loc[i, 'salinity'] = ocean_row.get('salinity', np.nan)
        final_df.loc[i, 'dissolved_oxygen'] = ocean_row.get(
            'dissolved_oxygen', np.nan)
        final_df.loc[i, 'ph'] = ocean_row.get('ph', np.nan)
        final_df.loc[i, 'chlorophyll'] = ocean_row.get('chlorophyll', np.nan)
        final_df.loc[i, 'ocean_latitude'] = ocean_row.get('latitude', np.nan)
        final_df.loc[i, 'ocean_longitude'] = ocean_row.get('longitude', np.nan)

# Add eDNA data by species matching
print("🧬 Adding eDNA sequence data...")

# Create clean match keys for both dataframes
print("   Creating match keys...")
df_fish_clean = final_df.copy()
df_fish_clean['match_key'] = df_fish_clean[fish_species_col].astype(
    str).str.strip().str.lower()

df_edna_clean = df_edna.copy()
df_edna_clean['match_key'] = df_edna_clean[edna_species_col].astype(
    str).str.strip().str.lower()

print(f"   Fish match keys created: {len(df_fish_clean)}")
print(f"   eDNA match keys created: {len(df_edna_clean)}")

# Check which eDNA columns actually exist
print("   Checking available eDNA columns...")
available_columns = df_edna_clean.columns.tolist()
print(f"   Available eDNA columns: {available_columns}")

# Prepare aggregation dictionary based on available columns
agg_dict = {}
if 'read_count' in available_columns:
    agg_dict['read_count'] = 'sum'
if 'confidence_score' in available_columns:
    agg_dict['confidence_score'] = 'mean'
if 'sequence_length' in available_columns:
    agg_dict['sequence_length'] = 'mean'

# Add optional columns if they exist
if 'detection_strength' in available_columns:
    agg_dict['detection_strength'] = 'mean'
if 'gc_content' in available_columns:
    agg_dict['gc_content'] = 'mean'
if 'detection_category' in available_columns:
    agg_dict['detection_category'] = lambda x: x.mode(
    )[0] if len(x.mode()) > 0 else 'Unknown'

print(f"   Aggregation dictionary: {agg_dict}")

# Aggregate eDNA data by species
print("   Aggregating eDNA data by species...")
if agg_dict:  # Only aggregate if we have columns to aggregate
    edna_aggregated = df_edna_clean.groupby(
        'match_key').agg(agg_dict).reset_index()
    print(f"   Aggregated eDNA data: {len(edna_aggregated)} unique species")
else:
    print("    No eDNA columns available for aggregation")
    # Create empty dataframe with just match_key
    edna_aggregated = pd.DataFrame(
        {'match_key': df_edna_clean['match_key'].unique()})

# Merge eDNA data with main dataframe
print("   Merging datasets...")
try:
    final_df = pd.merge(
        df_fish_clean,
        edna_aggregated,
        on='match_key',
        how='left'
    )
    print("    Merge successful!")
except Exception as e:
    print(f"    Merge failed: {e}")
    print("    Continuing without eDNA data merge")
    final_df = df_fish_clean

# Fill missing eDNA values with appropriate defaults
print(" Filling missing eDNA values...")
if 'read_count' in final_df.columns:
    final_df['read_count'] = final_df['read_count'].fillna(0)
if 'confidence_score' in final_df.columns:
    final_df['confidence_score'] = final_df['confidence_score'].fillna(0.3)
if 'sequence_length' in final_df.columns:
    final_df['sequence_length'] = final_df['sequence_length'].fillna(0)
if 'detection_strength' in final_df.columns:
    final_df['detection_strength'] = final_df['detection_strength'].fillna(0.2)
if 'gc_content' in final_df.columns:
    final_df['gc_content'] = final_df['gc_content'].fillna(0.5)
if 'detection_category' in final_df.columns:
    final_df['detection_category'] = final_df['detection_category'].fillna(
        'No eDNA Data')

# Remove the temporary match key if it exists
if 'match_key' in final_df.columns:
    final_df = final_df.drop('match_key', axis=1)

# Create comprehensive abundance score
print(" Creating abundance prediction...")


def calculate_abundance(row):
    """Calculate abundance based on available data"""
    # Base on temperature if available
    temp_score = 0
    if 'temperature' in row and not pd.isna(row.get('temperature')):
        if row['temperature'] < 28:
            temp_score = 1
        elif row['temperature'] < 30:
            temp_score = 0.5

    # eDNA detection if available
    edna_score = 0
    if 'confidence_score' in row and not pd.isna(row.get('confidence_score')):
        conf = row['confidence_score']
        if conf > 0.7:
            edna_score = 1
        elif conf > 0.4:
            edna_score = 0.7
        elif conf > 0.1:
            edna_score = 0.3

    # Use whatever data we have
    if temp_score > 0 or edna_score > 0:
        combined_score = (temp_score * 0.6) + (edna_score * 0.4)
        if combined_score > 0.7:
            return 'High'
        elif combined_score > 0.4:
            return 'Medium'
        else:
            return 'Low'
    else:
        return 'Unknown'


final_df['abundance_prediction'] = final_df.apply(calculate_abundance, axis=1)

# Add data source information
final_df['data_source'] = 'Integrated Marine Data'
final_df['processing_date'] = pd.Timestamp.now().strftime('%Y-%m-%d')

# Save the final merged dataset
final_df.to_csv(output_path, index=False)

print(f"\n MERGE COMPLETE!")
print(f"    Final dataset: {len(final_df)} rows")
print(f"    Columns: {list(final_df.columns)}")
print(f"    Saved to: {output_path}")

# Show statistics
print(f"\n DATASET STATISTICS:")
if 'read_count' in final_df.columns:
    species_with_edna = final_df[final_df['read_count']
                                 > 0][fish_species_col].nunique()
    print(f"    Species with eDNA data: {species_with_edna}")
print(
    f"    Abundance prediction: {final_df['abundance_prediction'].value_counts().to_dict()}")

# Show sample
print("\n SAMPLE OF FINAL DATA:")
print("=" * 60)
sample_cols = [fish_species_col, 'temperature', 'abundance_prediction']
if 'read_count' in final_df.columns:
    sample_cols.append('read_count')
if 'confidence_score' in final_df.columns:
    sample_cols.append('confidence_score')

print(final_df[sample_cols].head(5))

print("\n DATASET READY FOR ANALYSIS!")
