#!/usr/bin/env python3
"""
Script to create CLT database JSON from CSV data.
Converts CSV with load combinations to JSON grouped by product_reference.
"""

import csv
import json
from collections import defaultdict
from pathlib import Path


def create_clt_database():
    """Parse CLT CSV file and create JSON database grouped by product_reference."""
    
    csv_path = Path("src/initial_data/documentation/clt.csv")
    json_path = Path("clt_database.json")
    
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # Dictionary to group data by product_reference
    products = defaultdict(lambda: {
        "h": None,
        "fire_resistance": None,
        "pre-design": []
    })
    
    # Read and parse CSV
    total_rows = 0
    processed_rows = 0
    skipped_empty_product = 0
    skipped_empty_h = 0
    skipped_invalid_data = 0
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            total_rows += 1
            product_ref = row["product_reference"].strip()
            
            # Skip rows with empty product references
            if not product_ref:
                skipped_empty_product += 1
                continue
            
            # Set product properties (h and fire_resistance are same for all entries of a product)
            if products[product_ref]["h"] is None:
                h_value = row["h"].strip()
                if h_value:
                    products[product_ref]["h"] = float(h_value)
                    products[product_ref]["fire_resistance"] = row["fire_resistance"].strip()
                else:
                    skipped_empty_h += 1
                    continue  # Skip rows with empty h values
            
            # Add pre-design entry - skip if any required values are empty
            try:
                pre_design_entry = {
                    "live_load_category": row["live_load_category"].strip(),
                    "g": int(row["g"].strip()) if row["g"].strip() else 0,
                    "q": int(row["q"].strip()) if row["q"].strip() else 0,
                    "type_chape": row["Type_Chape"].strip(),
                    "L": float(row["L"].strip()) if row["L"].strip() else 0.0
                }
                
                # Only add if essential values are valid (allow empty live_load_category)
                # Essential: type_chape, g, q, L must be non-zero/non-empty
                if (pre_design_entry["type_chape"] and 
                    pre_design_entry["g"] and 
                    pre_design_entry["q"] and 
                    pre_design_entry["L"]):
                    products[product_ref]["pre-design"].append(pre_design_entry)
                    processed_rows += 1
                else:
                    skipped_invalid_data += 1
                    
            except (ValueError, TypeError):
                skipped_invalid_data += 1
                continue  # Skip rows with invalid data
    
    # Convert defaultdict to regular dict for JSON serialization
    products_dict = dict(products)
    
    # Write JSON file
    with open(json_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(products_dict, jsonfile, indent=2, ensure_ascii=False)
    
    print(f"CLT database created: {json_path}")
    print(f"Total products: {len(products_dict)}")
    
    # Print processing statistics
    print(f"\nProcessing Statistics:")
    print(f"  Total rows in CSV: {total_rows}")
    print(f"  Successfully processed: {processed_rows}")
    print(f"  Skipped (empty product_reference): {skipped_empty_product}")
    print(f"  Skipped (empty h value): {skipped_empty_h}")
    print(f"  Skipped (invalid data): {skipped_invalid_data}")
    print(f"  Total skipped: {skipped_empty_product + skipped_empty_h + skipped_invalid_data}")
    
    # Print sample of first product for verification
    if products_dict:
        first_product = next(iter(products_dict.keys()))
        print(f"\nSample product '{first_product}':")
        print(f"  h: {products_dict[first_product]['h']}")
        print(f"  fire_resistance: {products_dict[first_product]['fire_resistance']}")
        print(f"  pre-design entries: {len(products_dict[first_product]['pre-design'])}")
        print(f"  First pre-design entry: {products_dict[first_product]['pre-design'][0]}")


if __name__ == "__main__":
    create_clt_database()