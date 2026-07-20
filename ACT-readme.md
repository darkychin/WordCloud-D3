# How to run ACT - Commands locally

1. Start with running compose
```bash
docker compose -f docker-compose.yml up --build -d
```

2. Go into the running container's shell
```bash
docker compose -f docker-compose.yml exec sh
```

3. Then run your `act` commands
```bash
# List all available jobs
act -l

# Run default push event with attached secrets
act --secret-file .env.local

# Run a specific job name
act -j my_job_name


```

how to checkout@6 to show latest commit