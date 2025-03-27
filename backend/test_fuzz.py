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
from api.tests.conftest import test_user, authenticated_client

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@pytest.fixture(scope="session")
def load_corpus():
    corpus_dir = os.path.join(os.path.dirname(__file__), ".", "corpus_concerts")
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
    def run_concert_api_fuzz(self, fuzzed_data: str, authenticated_client):
        logger.info()
        try:
            logger.info(f"Fuzzing /api/concerts/ with query: {fuzzed_data}")
            response = authenticated_client.get(f"/api/concerts/?query={fuzzed_data}")
            if response.status_code not in [200, 201]:
                logger.error(f"Unexpected status code: {response.status_code}")
        except Exception as e:
            logger.error(f"Fuzzing error: {str(e)}")

    # def fuzz_target(self, data: bytes, authenticated_client):
    #     """ Fuzz entry point for Atheris """
    #     # fuzzed_query = self.get_input(data)  # Get fuzzed input
    #     self.run_concert_api_fuzz(data, authenticated_client)

    def start_fuzzing(self, corpus):
        """ Starts Atheris fuzzing with the loaded corpus """
        atheris.Setup(corpus, self.run_concert_api_fuzz)
        atheris.Fuzz()

@pytest.mark.django_db
def test_atheris_fuzzing(load_corpus):
    fuzzer = TestDjangoFuzzer()
    fuzzer.start_fuzzing(load_corpus)
