import json
import unittest.mock
import atheris
import sys
import os
import django
import logging
from unittest.mock import MagicMock
import pytest
from django.test import Client

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@pytest.fixture(scope="session")
def load_corpus():
    corpus_dir = os.path.join(os.path.dirname(__file__), ".", "corpus_concerts")
    print(f"Checking directory: {corpus_dir}")  # Debugging
    return [
        open(os.path.join(corpus_dir, file)).read().strip()
        for file in os.listdir(corpus_dir)
    ]


@pytest.mark.django_db
class TestDjangoFuzzer:
    def get_input(self, data: bytes) -> str:
        fdp = atheris.FuzzedDataProvider(data)
        max_len = 50  # Limit query length
        return fdp.ConsumeUnicodeNoSurrogates(max_len)

    @atheris.instrument_func
    def run_concert_api_fuzz(self, fuzzed_query: str, authenticated_client):
        try:
            logger.info(f"Fuzzing /api/concerts/ with query: {fuzzed_query}")
            response = authenticated_client.get(f"/api/concerts/?query={fuzzed_query}")
            if response.status_code not in [200, 201]:
                logger.error(f"Unexpected status code: {response.status_code}")
        except Exception as e:
            logger.error(f"Fuzzing error: {str(e)}")

    # def fuzz_favorites(self, data: bytes, test_user, authenticated_client):
    #     fuzzed_query = data.decode("utf-8", errors="ignore")
    #     try:
    #         json_data = json.loads(fuzzed_query)
    #     except json.JSONDecodeError:
    #         json_data = {"concert": fuzzed_query}
    #     try:
    #         print(f"Fuzzing favorite with query: {json_data}")
    #         response = authenticated_client.post(
    #             "/api/concerts/favorite/", json_data, content_type="application/json"
    #         )
    #         if response.status_code >= 500:
    #             raise RuntimeError(f"Server error: {response.status_code}")
    #     except Exception as e:
    #         print(f"Fuzzing error: {str(e)}")

    def fuzz_target(self, data: bytes, authenticated_client):
        """ Fuzz entry point for Atheris """
        self.run_concert_api_fuzz(data, authenticated_client)

    def start_fuzzing(self, corpus, authenticated_client):
        """ Starts Atheris fuzzing with the loaded corpus """
        atheris.Setup(corpus, self.fuzz_target)
        atheris.Fuzz()

@pytest.mark.django_db
def test_atheris_fuzzing(load_corpus, test_user, authenticated_client):
    fuzzer = TestDjangoFuzzer()
    fuzzer.start_fuzzing(load_corpus, authenticated_client)