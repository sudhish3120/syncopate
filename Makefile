.PHONY: makemigrations migrate up down makemigrations-interactive manage shell

# Docker Compose commands
up:
	cd backend && docker-compose up --build -d

down:
	cd backend && docker-compose down

# Run Django makemigrations in Docker container (non-interactive)
makemigrations:
	docker exec -i django_backend python manage.py makemigrations --noinput

# Run Django makemigrations in Docker container (interactive)
makemigrations-interactive:
	docker exec -it django_backend python manage.py makemigrations

# Run Django migrate in Docker container
migrate:
	docker exec django_backend python manage.py migrate

# Run any Django management command in Docker container
# Usage: make manage cmd="command_name"
# example: make manage cmd="fetch_concerts"
manage:
	docker exec -it django_backend python manage.py $(cmd)

# Open a bash shell in the Docker container
shell:
	docker exec -it django_backend /bin/bash

# Combined command to run both makemigrations and migrate
migrations: makemigrations migrate

# Combined command to rebuild and restart all containers
rebuild: down up
