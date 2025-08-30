#!/usr/bin/env python3
"""
Simple integration script for Cofrastra 40 database
Just run this script to create and populate your database
"""

import sqlite3
import json

def create_cofrastra_database(db_name="cofrastra_40.db"):
    """
    One function to create the complete database.
    Just call this function in your codebase.
    """
    
    print(f"Creating {db_name}...")
    
    # Create connection
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    # Execute the complete SQL schema
    schema_and_data = """
    -- Create tables
    CREATE TABLE object_types (
        id INTEGER PRIMARY KEY,
        type_name TEXT UNIQUE NOT NULL,
        description TEXT,
        properties JSON
    );

    CREATE TABLE materials (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE,
        properties JSON
    );

    CREATE TABLE profiles (
        id INTEGER PRIMARY KEY,
        object_type_id INTEGER DEFAULT 1,
        product_name TEXT,
        thickness_m REAL,
        geometry JSON,
        structural_properties JSON,
        material_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (object_type_id) REFERENCES object_types(id),
        FOREIGN KEY (material_id) REFERENCES materials(id),
        CHECK (object_type_id = 1)
    );

    CREATE TABLE composite_slabs (
        id INTEGER PRIMARY KEY,
        object_type_id INTEGER DEFAULT 2,
        profile_id INTEGER,
        concrete_thickness_m REAL,
        total_thickness_m REAL,
        performance_data JSON,
        load_capacities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (object_type_id) REFERENCES object_types(id),
        FOREIGN KEY (profile_id) REFERENCES profiles(id),
        CHECK (object_type_id = 2)
    );

    CREATE TABLE performance_tests (
        id INTEGER PRIMARY KEY,
        composite_slab_id INTEGER,
        test_type TEXT,
        test_conditions JSON,
        results JSON,
        test_standard TEXT,
        FOREIGN KEY (composite_slab_id) REFERENCES composite_slabs(id)
    );

    -- Insert reference data
    INSERT INTO object_types (type_name, description, properties) VALUES 
    ('PROFILE', 'Steel profile without concrete - can be used as formwork', 
     '{"is_composite": false, "requires_concrete": false, "can_bear_load_alone": false, "primary_function": "formwork_and_reinforcement"}'),
    ('COMPOSITE_SLAB', 'Steel profile + concrete composite structural element', 
     '{"is_composite": true, "requires_concrete": true, "can_bear_load_alone": true, "primary_function": "structural_floor_system"}');

    INSERT INTO materials (name, properties) VALUES 
    ('S350_GD_ZM175', '{"steel_grade": "S 350 GD", "standard": "NF EN 10346", "protection_type": "Acier galvanisé ZM 175", "protection_standard": "NF P 34-310", "coating": "ETPM ZM Evolution"}'),
    ('C25_30_Concrete', '{"grade": "C25/30", "density_N_m3": 25000, "compressive_strength_MPa": 25}');

    -- Create unified view
    CREATE VIEW all_physical_objects AS
    SELECT 
        'PROFILE_' || p.id as unified_id,
        p.id as original_id,
        ot.type_name as object_type,
        p.product_name as name,
        p.thickness_m as primary_thickness_m,
        NULL as concrete_thickness_m,
        p.thickness_m as total_thickness_m,
        json_object(
            'geometry', json(p.geometry),
            'structural_properties', json(p.structural_properties),
            'material', json(m.properties)
        ) as properties
    FROM profiles p
    JOIN object_types ot ON p.object_type_id = ot.id
    JOIN materials m ON p.material_id = m.id
    UNION ALL
    SELECT 
        'COMPOSITE_' || cs.id as unified_id,
        cs.id as original_id,
        ot.type_name as object_type,
        p.product_name || '_WITH_' || CAST(CAST(cs.concrete_thickness_m * 1000 AS INTEGER) AS TEXT) || 'MM_CONCRETE' as name,
        p.thickness_m as primary_thickness_m,
        cs.concrete_thickness_m,
        cs.total_thickness_m,
        json_object(
            'profile_geometry', json(p.geometry),
            'profile_structural_properties', json(p.structural_properties),
            'composite_performance', json(cs.performance_data),
            'composite_load_capacities', json(cs.load_capacities),
            'material', json(m.properties)
        ) as properties
    FROM composite_slabs cs
    JOIN object_types ot ON cs.object_type_id = ot.id
    JOIN profiles p ON cs.profile_id = p.id
    JOIN materials m ON p.material_id = m.id;
    """
    
    # Execute schema
    cursor.executescript(schema_and_data)
    
    # Insert the 3 profiles
    profiles = [
        (1, 'Cofrastra_40_0.75mm', 0.00075, 
         '{"profile_width_m": 0.750, "profile_height_m": 0.040, "rib_spacing_m": 0.150, "cross_section_shape": "dovetail_ribbed"}',
         '{"weight_N_m2": 98.0, "section_area_m2_ml": 0.001183, "effective_inertia_m4_ml": 1.758e-9, "neutral_fiber_position_m": 0.0106, "inertia_modulus_m3_ml": 1.657e-6}',
         1),
        (1, 'Cofrastra_40_0.88mm', 0.00088,
         '{"profile_width_m": 0.750, "profile_height_m": 0.040, "rib_spacing_m": 0.150, "cross_section_shape": "dovetail_ribbed"}',
         '{"weight_N_m2": 115.0, "section_area_m2_ml": 0.001400, "effective_inertia_m4_ml": 2.223e-9, "neutral_fiber_position_m": 0.0106, "inertia_modulus_m3_ml": 2.095e-6}',
         1),
        (1, 'Cofrastra_40_1.00mm', 0.00100,
         '{"profile_width_m": 0.750, "profile_height_m": 0.040, "rib_spacing_m": 0.150, "cross_section_shape": "dovetail_ribbed"}',
         '{"weight_N_m2": 131.0, "section_area_m2_ml": 0.001600, "effective_inertia_m4_ml": 2.541e-9, "neutral_fiber_position_m": 0.0106, "inertia_modulus_m3_ml": 2.395e-6}',
         1)
    ]
    
    cursor.executemany("""
        INSERT INTO profiles (object_type_id, product_name, thickness_m, geometry, structural_properties, material_id)
        VALUES (?, ?, ?, ?, ?, ?)
    """, profiles)
    
    # Insert the 30 composite slabs
    concrete_thicknesses = [0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18]
    profile_weights = [98.0, 115.0, 131.0]
    
    composite_slabs = []
    for profile_id in range(1, 4):
        profile_weight = profile_weights[profile_id - 1]
        for concrete_thickness in concrete_thicknesses:
            total_thickness = concrete_thickness + 0.04
            concrete_volume = concrete_thickness
            total_weight = profile_weight + (concrete_volume * 25000)
            
            performance_data = json.dumps({
                "concrete_volume_m3_m2": concrete_volume,
                "total_weight_N_m2": total_weight
            })
            
            load_capacities = json.dumps({
                "max_span_without_props_m": 4.0,
                "design_load_range_N_m2": f"{int(total_weight * 0.3)}-30000"
            })
            
            composite_slabs.append((2, profile_id, concrete_thickness, total_thickness, performance_data, load_capacities))
    
    cursor.executemany("""
        INSERT INTO composite_slabs (object_type_id, profile_id, concrete_thickness_m, total_thickness_m, performance_data, load_capacities)
        VALUES (?, ?, ?, ?, ?, ?)
    """, composite_slabs)
    
    # Add some performance test data
    performance_tests = [
        (1, 'fire_resistance', '{"concrete_thickness_m": 0.09}', '{"REI_minutes": 30}', 'REI'),
        (3, 'fire_resistance', '{"concrete_thickness_m": 0.11}', '{"REI_minutes": 90}', 'REI'),
        (7, 'fire_resistance', '{"concrete_thickness_m": 0.13}', '{"REI_minutes": 120}', 'REI'),
        (1, 'acoustic', '{"test_method": "modeling"}', '{"Rw_dB": 46, "C": -1, "Ctr": -6}', 'CSTB_AC15-26054708'),
        (2, 'acoustic', '{"test_method": "modeling"}', '{"Rw_dB": 47, "C": -2, "Ctr": -6}', 'CSTB_AC15-26054708')
    ]
    
    cursor.executemany("""
        INSERT INTO performance_tests (composite_slab_id, test_type, test_conditions, results, test_standard)
        VALUES (?, ?, ?, ?, ?)
    """, performance_tests)
    
    # Create indexes
    indexes = [
        "CREATE INDEX idx_profiles_type ON profiles(object_type_id)",
        "CREATE INDEX idx_composites_type ON composite_slabs(object_type_id)",
        "CREATE INDEX idx_composites_profile ON composite_slabs(profile_id)",
        "CREATE INDEX idx_composites_thickness ON composite_slabs(concrete_thickness_m)"
    ]
    
    for index in indexes:
        cursor.execute(index)
    
    conn.commit()
    conn.close()
    
    print(f"✓ Database '{db_name}' created successfully!")
    print("  - 3 PROFILE objects (steel profiles)")
    print("  - 30 COMPOSITE_SLAB objects (profile + concrete)")
    print("  - Performance test data")
    print("  - Ready to use!")
    
    return db_name


def get_all_objects(db_name="cofrastra_40.db"):
    """
    Simple function to retrieve all objects from the database
    Returns a dictionary with profiles and composite slabs
    """
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT unified_id, object_type, name, primary_thickness_m, 
               concrete_thickness_m, total_thickness_m, properties 
        FROM all_physical_objects 
        ORDER BY object_type, original_id
    """)
    
    results = cursor.fetchall()
    conn.close()
    
    objects = {
        "PROFILE": [],
        "COMPOSITE_SLAB": []
    }
    
    for row in results:
        obj = {
            "id": row[0],
            "type": row[1], 
            "name": row[2],
            "profile_thickness_m": row[3],
            "concrete_thickness_m": row[4],
            "total_thickness_m": row[5],
            "properties": json.loads(row[6])
        }
        objects[row[1]].append(obj)
    
    return objects


def get_objects_by_type(object_type, db_name="cofrastra_40.db"):
    """
    Get all objects of a specific type ('PROFILE' or 'COMPOSITE_SLAB')
    """
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT unified_id, name, primary_thickness_m, 
               concrete_thickness_m, total_thickness_m, properties
        FROM all_physical_objects 
        WHERE object_type = ?
        ORDER BY original_id
    """, (object_type,))
    
    results = cursor.fetchall()
    conn.close()
    
    objects = []
    for row in results:
        obj = {
            "id": row[0],
            "name": row[1],
            "profile_thickness_m": row[2],
            "concrete_thickness_m": row[3],
            "total_thickness_m": row[4],
            "properties": json.loads(row[5])
        }
        objects.append(obj)
    
    return objects


def find_composite_slab(profile_thickness_m, concrete_thickness_m, db_name="cofrastra_40.db"):
    """
    Find a specific composite slab by profile and concrete thickness
    """
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT unified_id, name, properties
        FROM all_physical_objects 
        WHERE object_type = 'COMPOSITE_SLAB' 
          AND primary_thickness_m = ? 
          AND concrete_thickness_m = ?
    """, (profile_thickness_m, concrete_thickness_m))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            "id": result[0],
            "name": result[1],
            "properties": json.loads(result[2])
        }
    return None


# Integration examples for your codebase
def example_usage():
    """
    Example of how to use this in your codebase
    """
    
    # Step 1: Create the database (do this once)
    db_file = create_cofrastra_database("my_cofrastra.db")
    
    # Step 2: Get all objects
    all_objects = get_all_objects(db_file)
    print(f"Found {len(all_objects['PROFILE'])} profiles")
    print(f"Found {len(all_objects['COMPOSITE_SLAB'])} composite slabs")
    
    # Step 3: Get specific object types
    profiles = get_objects_by_type("PROFILE", db_file)
    composites = get_objects_by_type("COMPOSITE_SLAB", db_file)
    
    # Step 4: Find a specific composite slab
    specific_slab = find_composite_slab(0.00088, 0.13, db_file)  # 0.88mm profile + 130mm concrete
    if specific_slab:
        print(f"Found slab: {specific_slab['name']}")
        print(f"Properties: {specific_slab['properties']['composite_performance']}")
    
    return all_objects


if __name__ == "__main__":
    """
    Run this script to create the database and see examples
    """
    print("=== Cofrastra 40 Database Integration ===")
    example_usage()