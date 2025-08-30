"""
SQLite database for storing standard construction components.
"""
import sqlite3
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ComponentsDatabase:
    """SQLite database for construction components."""
    
    def __init__(self, db_path: Optional[str] = None):
        """Initialize database connection."""
        if db_path is None:
            # Default to project data directory
            project_root = Path(__file__).parent.parent.parent
            data_dir = project_root / "data"
            data_dir.mkdir(exist_ok=True)
            db_path = str(data_dir / "components.db")
        
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database tables."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS manufacturers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    country TEXT,
                    website TEXT
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS component_types (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS trapezoidal_decking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    manufacturer_id INTEGER NOT NULL,
                    component_type_id INTEGER NOT NULL,
                    reference TEXT UNIQUE NOT NULL,
                    total_profile_width REAL NOT NULL,
                    wave_width REAL NOT NULL,
                    bottom_width REAL NOT NULL,
                    top_width REAL NOT NULL,
                    height REAL NOT NULL,
                    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
                    FOREIGN KEY (component_type_id) REFERENCES component_types (id)
                )
            """)
            
            conn.commit()
    
    def add_manufacturer(self, name: str, country: str = None, website: str = None) -> int:
        """Add a manufacturer to the database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "INSERT OR IGNORE INTO manufacturers (name, country, website) VALUES (?, ?, ?)",
                (name, country, website)
            )
            conn.commit()
            
            # Get the manufacturer ID
            cursor = conn.execute("SELECT id FROM manufacturers WHERE name = ?", (name,))
            return cursor.fetchone()[0]
    
    def add_component_type(self, name: str, description: str = None) -> int:
        """Add a component type to the database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "INSERT OR IGNORE INTO component_types (name, description) VALUES (?, ?)",
                (name, description)
            )
            conn.commit()
            
            # Get the component type ID
            cursor = conn.execute("SELECT id FROM component_types WHERE name = ?", (name,))
            return cursor.fetchone()[0]
    
    def add_trapezoidal_decking(self, manufacturer_id: int, component_type_id: int,
                               reference: str, total_profile_width: float,
                               wave_width: float, bottom_width: float,
                               top_width: float, height: float) -> int:
        """Add a trapezoidal decking profile to the database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO trapezoidal_decking 
                (manufacturer_id, component_type_id, reference, total_profile_width,
                 wave_width, bottom_width, top_width, height)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (manufacturer_id, component_type_id, reference, total_profile_width,
                  wave_width, bottom_width, top_width, height))
            conn.commit()
            return cursor.lastrowid
    
    def get_trapezoidal_decking(self, reference: str = None) -> List[Dict]:
        """Retrieve trapezoidal decking profiles."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            if reference:
                cursor = conn.execute("""
                    SELECT td.*, m.name as manufacturer_name, ct.name as component_type
                    FROM trapezoidal_decking td
                    JOIN manufacturers m ON td.manufacturer_id = m.id
                    JOIN component_types ct ON td.component_type_id = ct.id
                    WHERE td.reference = ?
                """, (reference,))
            else:
                cursor = conn.execute("""
                    SELECT td.*, m.name as manufacturer_name, ct.name as component_type
                    FROM trapezoidal_decking td
                    JOIN manufacturers m ON td.manufacturer_id = m.id
                    JOIN component_types ct ON td.component_type_id = ct.id
                """)
            
            return [dict(row) for row in cursor.fetchall()]
    
    def get_manufacturers(self) -> List[Dict]:
        """Get all manufacturers."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM manufacturers")
            return [dict(row) for row in cursor.fetchall()]
    
    def get_component_types(self) -> List[Dict]:
        """Get all component types."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM component_types")
            return [dict(row) for row in cursor.fetchall()]


def initialize_arcelor_data(db: ComponentsDatabase):
    """Initialize database with Arcelor trapezoidal steel decking data."""
    # Add Arcelor manufacturer
    arcelor_id = db.add_manufacturer("Arcelor", "Luxembourg", "https://www.arcelormittal.com")
    
    # Add component type
    decking_type_id = db.add_component_type("Trapezoidal Steel Decking", 
                                           "Steel decking for composite floor construction")
    
    # Add the three specified products from CSV data
    profiles = [
        ("cofrastra 40", 750, 150, 124, 46.5, 40),
        ("cofraplus 60+", 1035, 207, 62, 106, 58),
        ("cofraplus 80", 810, 270, 86, 118, 80)
    ]
    
    for reference, total_width, wave_width, bottom_width, top_width, height in profiles:
        db.add_trapezoidal_decking(
            arcelor_id, decking_type_id, reference,
            total_width, wave_width, bottom_width, top_width, height
        )


def get_default_database() -> ComponentsDatabase:
    """Get the default components database with Arcelor data initialized."""
    db = ComponentsDatabase()
    
    # Check if data already exists
    existing_profiles = db.get_trapezoidal_decking()
    if not existing_profiles:
        initialize_arcelor_data(db)
    
    return db


if __name__ == "__main__":
    # Example usage
    db = get_default_database()
    
    # Print all available profiles
    profiles = db.get_trapezoidal_decking()
    for profile in profiles:
        print(f"{profile['reference']}: {profile['total_profile_width']}mm x {profile['height']}mm")