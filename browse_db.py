#!/usr/bin/env python3
"""Simple database browser for components database."""

from src.floor_composer.components_db import get_default_database

def main():
    db = get_default_database()
    
    print("=== COMPONENTS DATABASE BROWSER ===")
    print(f"Database: {db.db_path}")
    print()
    
    # Show manufacturers
    print("MANUFACTURERS:")
    manufacturers = db.get_manufacturers()
    for m in manufacturers:
        print(f"  {m['id']}: {m['name']} ({m['country']})")
    print()
    
    # Show component types
    print("COMPONENT TYPES:")
    types = db.get_component_types()
    for t in types:
        print(f"  {t['id']}: {t['name']}")
    print()
    
    # Show all profiles
    print("TRAPEZOIDAL DECKING PROFILES:")
    profiles = db.get_trapezoidal_decking()
    for p in profiles:
        print(f"  {p['reference']}:")
        print(f"    Manufacturer: {p['manufacturer_name']}")
        print(f"    Dimensions: {p['total_profile_width']}mm x {p['height']}mm")
        print(f"    Wave: {p['wave_width']}mm, Bottom: {p['bottom_width']}mm, Top: {p['top_width']}mm")
        print()

if __name__ == "__main__":
    main()