.PHONY: makemigrations migrate up down

# Docker Compose commands
up:
	cd backend && docker-compose up --build -d

down:
	cd backend && docker-compose down

# Run Django makemigrations in Docker container
makemigrations:
	docker exec django_backend python manage.py makemigrations

# Run Django migrate in Docker container
migrate:
	docker exec django_backend python manage.py migrate

# Combined command to run both makemigrations and migrate
migrations: makemigrations migrate

# Combined command to rebuild and restart all containers
rebuild: down up
