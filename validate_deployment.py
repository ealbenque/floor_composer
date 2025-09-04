#!/usr/bin/env python3
"""
Deployment validation script for Floor Composer
Run this to check if your deployment configuration is ready for Render.com
"""

import os
import json
from pathlib import Path

def check_file_exists(path: Path, description: str) -> bool:
    """Check if a file exists."""
    exists = path.exists()
    print(f"✅ {description}" if exists else f"❌ {description} (MISSING)")
    return exists

def check_yaml_content(path: Path, description: str) -> bool:
    """Check if YAML file exists and has basic structure."""
    try:
        with open(path) as f:
            content = f.read()
        
        # Basic checks for YAML structure
        if 'services:' not in content:
            print(f"❌ {description} (Missing services section)")
            return False
            
        print(f"✅ {description}")
        return True
    except Exception as e:
        print(f"❌ {description} (ERROR: {e})")
        return False

def check_backend_requirements():
    """Check backend requirements.txt contains necessary packages."""
    req_path = Path("backend/requirements.txt")
    if not req_path.exists():
        print("❌ backend/requirements.txt missing")
        return False
    
    with open(req_path) as f:
        requirements = f.read()
    
    required_packages = ['fastapi', 'uvicorn', 'gunicorn', 'pydantic', 'numpy']
    missing = [pkg for pkg in required_packages if pkg not in requirements.lower()]
    
    if missing:
        print(f"❌ Missing packages in requirements.txt: {missing}")
        return False
    
    print("✅ Backend requirements.txt contains all necessary packages")
    return True

def check_database_files():
    """Check if required database files exist."""
    db_path = Path("backend/data/arcelor_steel_deck_database.json")
    exists = check_file_exists(db_path, "Steel deck database")
    return exists

def check_render_config():
    """Check render.yaml configuration."""
    render_path = Path("render.yaml")
    if not render_path.exists():
        print("❌ Root render.yaml missing")
        return False
    
    try:
        with open(render_path) as f:
            content = f.read()
        
        # Basic string checks
        checks = [
            ('services:', 'services section'),
            ('floor-composer-backend', 'backend service'),
            ('floor-composer-frontend', 'frontend service'),
            ('gunicorn', 'gunicorn configuration'),
            ('NEXT_PUBLIC_API_URL', 'frontend API URL'),
            ('onrender.com', 'render.com domain')
        ]
        
        for check_str, description in checks:
            if check_str not in content:
                print(f"❌ Missing {description} in render.yaml")
                return False
        
        print("✅ render.yaml configuration looks good")
        return True
        
    except Exception as e:
        print(f"❌ Error reading render.yaml: {e}")
        return False

def main():
    """Run all validation checks."""
    print("🚀 Floor Composer Deployment Validation\n")
    
    os.chdir(Path(__file__).parent)
    
    checks = [
        (lambda: check_file_exists(Path("render.yaml"), "Root render.yaml exists"), "Root render.yaml"),
        (lambda: check_file_exists(Path("backend/requirements.txt"), "Backend requirements.txt exists"), "Backend requirements"),
        (lambda: check_file_exists(Path("frontend/package.json"), "Frontend package.json exists"), "Frontend package"),
        (lambda: check_file_exists(Path("backend/api/main.py"), "Backend FastAPI main.py exists"), "Backend main"),
        (check_backend_requirements, "Backend requirements check"),
        (check_database_files, "Database files check"),
        (check_render_config, "Render.yaml configuration check"),
    ]
    
    passed = 0
    total = len(checks)
    
    for check_func, name in checks:
        result = check_func()
        if result:
            passed += 1
        print()
    
    print(f"📊 Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All checks passed! Your repository is ready for Render.com deployment.")
        print("\n📋 Next steps:")
        print("1. Push your code to GitHub")
        print("2. Connect your GitHub repo to Render.com")
        print("3. Use the root render.yaml to deploy both services")
        print("4. Your services will be available at:")
        print("   - Backend: https://floor-composer-backend.onrender.com")
        print("   - Frontend: https://floor-composer-frontend.onrender.com")
    else:
        print(f"\n⚠️  {total - passed} issues need to be fixed before deployment.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)