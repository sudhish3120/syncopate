# Synchopate

Create an ```.env``` file in ```backend/``` like this

```
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Start backend and postgres
```docker-compose up --build -d```

#### Run migrations inside the container
```docker exec -it django_backend python manage.py migrate```

#### Ensure backend is working
```curl http://localhost:8000/api```

#### Frontend stuff
```
cd client
npm install
npm run dev
```

Next.js should be running on http://localhost:3000/
Django backend should be on http://localhost:8000/

