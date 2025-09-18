# backend/app/fhir_utils.py
try:
    from fhir.resources.bundle import Bundle
    from fhir.resources.fhirabstractbase import FHIRValidationError
    FHIR_AVAILABLE = True
except ImportError:
    # Fallback if FHIR resources not available
    FHIR_AVAILABLE = False
    Bundle = None
    FHIRValidationError = Exception

def validate_fhir_bundle(bundle_json: dict) -> bool:
    """
    Validate basic FHIR bundle structure using fhir.resources.
    Raises FHIRValidationError if invalid.
    """
    if not FHIR_AVAILABLE:
        # Basic validation without FHIR library
        if not isinstance(bundle_json, dict):
            raise ValueError("Bundle must be a dictionary")
        if "resourceType" not in bundle_json:
            raise ValueError("Bundle must have resourceType")
        if bundle_json.get("resourceType") != "Bundle":
            raise ValueError("resourceType must be 'Bundle'")
        return True
    
    try:
        b = Bundle.parse_obj(bundle_json)
        return True
    except FHIRValidationError as e:
        raise e
