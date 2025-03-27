import atheris
import sys
import os
import django 
import logging
from django.test import Client


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
logger = logging.getLogger(__name__)
client = Client()

def fuzzer_get_concerts(query):
    try:
        fuzzed_query = query.decode('utf-8')
        response = client.get(f"/concerts/?query={fuzzed_query}")
        assert response.status_code in [200, 500], f"Unexpected status code: {response.status_code}"
    except Exception as e:
        logger.error(f"Fuzzing error in concert endpoint: {str(e)}")

def main():
    atheris.Setup(sys.argv, fuzzer_get_concerts)
    atheris.Fuzz()  

if __name__ == "__main__":
    main()